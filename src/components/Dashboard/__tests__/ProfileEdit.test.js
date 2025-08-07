import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileEdit from '../ProfileEdit';
import { useAuth } from '../../../context/AuthContext';
import { userAPI } from '../../../utils/api';

// Mock axios first
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

// Mock the dependencies
jest.mock('../../../context/AuthContext');
jest.mock('../../../utils/api');

// Mock window.location.reload
delete window.location;
window.location = { reload: jest.fn() };

describe('ProfileEdit', () => {
  const mockUser = {
    _id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    createdAt: '2023-01-01T00:00:00.000Z'
  };

  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      login: mockLogin
    });
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('renders profile information in read-only mode initially', () => {
    render(<ProfileEdit user={mockUser} />);

    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    
    expect(screen.getByDisplayValue('John Doe')).toBeDisabled();
    expect(screen.getByDisplayValue('john@example.com')).toBeDisabled();
    expect(screen.getByDisplayValue('123-456-7890')).toBeDisabled();
    expect(screen.getByDisplayValue('1/1/2023')).toBeDisabled();
  });

  it('switches to edit mode when edit button is clicked', () => {
    render(<ProfileEdit user={mockUser} />);

    fireEvent.click(screen.getByText('Edit Profile'));

    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    
    expect(screen.getByDisplayValue('John Doe')).not.toBeDisabled();
    expect(screen.getByDisplayValue('john@example.com')).not.toBeDisabled();
    expect(screen.getByDisplayValue('123-456-7890')).not.toBeDisabled();
  });

  it('cancels editing and resets form data', () => {
    render(<ProfileEdit user={mockUser} />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit Profile'));
    
    // Change some values
    fireEvent.change(screen.getByDisplayValue('John Doe'), {
      target: { value: 'Jane Doe' }
    });
    
    // Cancel editing
    fireEvent.click(screen.getByText('Cancel'));

    // Should be back to read-only mode with original values
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeDisabled();
  });

  it('updates form data when inputs change', () => {
    render(<ProfileEdit user={mockUser} />);

    fireEvent.click(screen.getByText('Edit Profile'));

    const nameInput = screen.getByDisplayValue('John Doe');
    const emailInput = screen.getByDisplayValue('john@example.com');
    const phoneInput = screen.getByDisplayValue('123-456-7890');

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '987-654-3210' } });

    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('987-654-3210')).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    render(<ProfileEdit user={mockUser} />);

    fireEvent.click(screen.getByText('Edit Profile'));

    // Clear required fields
    fireEvent.change(screen.getByDisplayValue('John Doe'), {
      target: { value: '' }
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    expect(userAPI.updateProfile).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(<ProfileEdit user={mockUser} />);

    fireEvent.click(screen.getByText('Edit Profile'));

    fireEvent.change(screen.getByDisplayValue('john@example.com'), {
      target: { value: 'invalid-email' }
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    expect(userAPI.updateProfile).not.toHaveBeenCalled();
  });

  it('successfully updates profile', async () => {
    const updatedUser = { ...mockUser, name: 'Jane Doe' };
    userAPI.updateProfile.mockResolvedValue({
      data: { user: updatedUser }
    });

    render(<ProfileEdit user={mockUser} />);

    fireEvent.click(screen.getByText('Edit Profile'));

    fireEvent.change(screen.getByDisplayValue('John Doe'), {
      target: { value: 'Jane Doe' }
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });

    expect(userAPI.updateProfile).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'john@example.com',
      phone: '123-456-7890'
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedUser));
  });

  it('handles API errors during update', async () => {
    userAPI.updateProfile.mockRejectedValue({
      response: { data: { error: { message: 'Update failed' } } }
    });

    render(<ProfileEdit user={mockUser} />);

    fireEvent.click(screen.getByText('Edit Profile'));
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('shows loading state during update', async () => {
    userAPI.updateProfile.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<ProfileEdit user={mockUser} />);

    fireEvent.click(screen.getByText('Edit Profile'));
    fireEvent.click(screen.getByText('Save Changes'));

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('clears error when user starts typing', () => {
    render(<ProfileEdit user={mockUser} />);

    fireEvent.click(screen.getByText('Edit Profile'));

    // Clear name to trigger error
    fireEvent.change(screen.getByDisplayValue('John Doe'), {
      target: { value: '' }
    });

    fireEvent.click(screen.getByText('Save Changes'));

    // Wait for error to appear, then start typing
    waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    }).then(() => {
      fireEvent.change(screen.getByDisplayValue(''), {
        target: { value: 'J' }
      });

      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });

  it('displays account statistics', () => {
    render(<ProfileEdit user={mockUser} />);

    expect(screen.getByText('Account Statistics')).toBeInTheDocument();
    expect(screen.getByText('Account Status:')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Last Login:')).toBeInTheDocument();
  });

  it('handles user with missing optional fields', () => {
    const userWithoutPhone = {
      ...mockUser,
      phone: undefined
    };

    render(<ProfileEdit user={userWithoutPhone} />);

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    
    const phoneInput = screen.getByPlaceholderText('Enter your phone number');
    expect(phoneInput.value).toBe('');
  });

  it('handles user with missing createdAt', () => {
    const userWithoutCreatedAt = {
      ...mockUser,
      createdAt: undefined
    };

    render(<ProfileEdit user={userWithoutCreatedAt} />);

    expect(screen.getByDisplayValue('N/A')).toBeInTheDocument();
  });
});