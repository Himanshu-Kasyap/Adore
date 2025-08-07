import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignupForm from '../SignupForm';
import { AuthProvider } from '../../../context/AuthContext';
import * as api from '../../../utils/api';

// Mock the API
jest.mock('../../../utils/api');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('SignupForm Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders signup form with all required fields', () => {
    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Join our rural community platform')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Password *')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
  });

  test('validates required fields and shows error messages', async () => {
    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });
  });

  test('validates name length', async () => {
    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText('Full Name *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email Address *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  test('validates password length', async () => {
    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Password *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  test('validates password confirmation match', async () => {
    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('validates phone number format when provided', async () => {
    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const phoneInput = screen.getByLabelText('Phone Number');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
    });
  });

  test('clears field errors when user starts typing', async () => {
    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText('Full Name *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    // Trigger validation error
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    // Start typing to clear error
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });

  test('handles successful registration', async () => {
    const mockRegisterResponse = {
      data: {
        user: { id: 1, name: 'John Doe', email: 'john@example.com' },
        token: 'mock-token'
      }
    };

    api.authAPI.register.mockResolvedValue(mockRegisterResponse);

    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText('Full Name *');
    const emailInput = screen.getByLabelText('Email Address *');
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.authAPI.register).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: ''
      });
    });

    // Check that token and user are stored in localStorage
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockRegisterResponse.data.user);
    });
  });

  test('handles registration with phone number', async () => {
    const mockRegisterResponse = {
      data: {
        user: { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
        token: 'mock-token'
      }
    };

    api.authAPI.register.mockResolvedValue(mockRegisterResponse);

    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText('Full Name *');
    const emailInput = screen.getByLabelText('Email Address *');
    const phoneInput = screen.getByLabelText('Phone Number');
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '+1234567890' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.authAPI.register).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890'
      });
    });
  });

  test('handles registration error', async () => {
    const mockError = {
      response: {
        data: {
          error: {
            message: 'Email already exists'
          }
        }
      }
    };

    api.authAPI.register.mockRejectedValue(mockError);

    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText('Full Name *');
    const emailInput = screen.getByLabelText('Email Address *');
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', async () => {
    // Mock a delayed response
    api.authAPI.register.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText('Full Name *');
    const emailInput = screen.getByLabelText('Email Address *');
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByRole('button', { name: 'Creating Account...' })).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('navigates to login page when sign in is clicked', () => {
    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const signInButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(signInButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('disables form during loading state', async () => {
    api.authAPI.register.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText('Full Name *');
    const emailInput = screen.getByLabelText('Email Address *');
    const phoneInput = screen.getByLabelText('Phone Number');
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // All form elements should be disabled during loading
    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(phoneInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(signInButton).toBeDisabled();
  });

  test('clears auth errors when user makes changes', async () => {
    const mockError = {
      response: {
        data: {
          error: {
            message: 'Registration failed'
          }
        }
      }
    };

    api.authAPI.register.mockRejectedValue(mockError);

    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText('Full Name *');
    const emailInput = screen.getByLabelText('Email Address *');
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    // Fill form and submit to trigger error
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });

    // Make a change to clear the error
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    await waitFor(() => {
      expect(screen.queryByText('Registration failed')).not.toBeInTheDocument();
    });
  });

  test('redirects authenticated users to dashboard', () => {
    // Mock authenticated state
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <TestWrapper>
        <SignupForm />
      </TestWrapper>
    );

    // Should redirect to dashboard
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});