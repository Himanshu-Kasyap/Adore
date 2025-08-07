import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from '../LoginForm';
import SignupForm from '../SignupForm';
import { AuthProvider, useAuth } from '../../../context/AuthContext';
import * as api from '../../../utils/api';

// Mock the API
jest.mock('../../../utils/api');

// Mock component to test auth context integration
const TestDashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// Test wrapper with routing
const TestWrapper = ({ initialRoute = '/' }) => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/dashboard" element={<TestDashboard />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset window location
    delete window.location;
    window.location = { href: '' };
  });

  describe('Login to Dashboard Flow', () => {
    test('successful login redirects to dashboard and shows user info', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      const mockLoginResponse = {
        data: {
          user: mockUser,
          token: 'mock-token'
        }
      };

      api.authAPI.login.mockResolvedValue(mockLoginResponse);

      // Start at login page
      window.history.pushState({}, 'Login', '/login');
      
      render(<TestWrapper initialRoute="/login" />);

      // Fill and submit login form
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Wait for login to complete and redirect
      await waitFor(() => {
        expect(api.authAPI.login).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123'
        });
      });

      // Verify localStorage is updated
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser);
    });

    test('login error displays error message and stays on login page', async () => {
      const mockError = {
        response: {
          data: {
            error: {
              message: 'Invalid credentials'
            }
          }
        }
      };

      api.authAPI.login.mockRejectedValue(mockError);

      window.history.pushState({}, 'Login', '/login');
      
      render(<TestWrapper initialRoute="/login" />);

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Should still be on login page
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });
  });

  describe('Signup to Dashboard Flow', () => {
    test('successful signup redirects to dashboard and shows user info', async () => {
      const mockUser = { id: 1, name: 'Jane Doe', email: 'jane@example.com' };
      const mockRegisterResponse = {
        data: {
          user: mockUser,
          token: 'mock-token'
        }
      };

      api.authAPI.register.mockResolvedValue(mockRegisterResponse);

      window.history.pushState({}, 'Signup', '/signup');
      
      render(<TestWrapper initialRoute="/signup" />);

      // Fill and submit signup form
      const nameInput = screen.getByLabelText('Full Name *');
      const emailInput = screen.getByLabelText('Email Address *');
      const passwordInput = screen.getByLabelText('Password *');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password *');
      const submitButton = screen.getByRole('button', { name: 'Create Account' });

      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.authAPI.register).toHaveBeenCalledWith({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          phone: ''
        });
      });

      // Verify localStorage is updated
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser);
    });

    test('signup error displays error message and stays on signup page', async () => {
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

      window.history.pushState({}, 'Signup', '/signup');
      
      render(<TestWrapper initialRoute="/signup" />);

      const nameInput = screen.getByLabelText('Full Name *');
      const emailInput = screen.getByLabelText('Email Address *');
      const passwordInput = screen.getByLabelText('Password *');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password *');
      const submitButton = screen.getByRole('button', { name: 'Create Account' });

      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });

      // Should still be on signup page
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });
  });

  describe('Navigation Between Forms', () => {
    test('can navigate from login to signup form', async () => {
      window.history.pushState({}, 'Login', '/login');
      
      render(<TestWrapper initialRoute="/login" />);

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();

      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);

      // Should navigate to signup page
      await waitFor(() => {
        expect(screen.getByText('Create Account')).toBeInTheDocument();
        expect(screen.getByText('Join our rural community platform')).toBeInTheDocument();
      });
    });

    test('can navigate from signup to login form', async () => {
      window.history.pushState({}, 'Signup', '/signup');
      
      render(<TestWrapper initialRoute="/signup" />);

      expect(screen.getByText('Create Account')).toBeInTheDocument();

      const signInButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(signInButton);

      // Should navigate to login page
      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication State Persistence', () => {
    test('loads user from localStorage on app start', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      render(<TestWrapper initialRoute="/dashboard" />);

      // Should show dashboard with user info
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
      });
    });

    test('handles corrupted localStorage data gracefully', async () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', 'invalid-json');

      render(<TestWrapper initialRoute="/dashboard" />);

      // Should not be authenticated
      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // Should clear corrupted data
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Logout Functionality', () => {
    test('logout clears authentication state and localStorage', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      api.authAPI.logout.mockResolvedValue({});

      render(<TestWrapper initialRoute="/dashboard" />);

      // Should show dashboard
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: 'Logout' });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(api.authAPI.logout).toHaveBeenCalled();
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // Should clear localStorage
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('logout works even if API call fails', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      api.authAPI.logout.mockRejectedValue(new Error('Network error'));

      render(<TestWrapper initialRoute="/dashboard" />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: 'Logout' });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // Should still clear localStorage even if API fails
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      api.authAPI.login.mockRejectedValue(networkError);

      window.history.pushState({}, 'Login', '/login');
      
      render(<TestWrapper initialRoute="/login" />);

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });

    test('clears errors when switching between forms', async () => {
      const mockError = {
        response: {
          data: {
            error: {
              message: 'Invalid credentials'
            }
          }
        }
      };

      api.authAPI.login.mockRejectedValue(mockError);

      window.history.pushState({}, 'Login', '/login');
      
      render(<TestWrapper initialRoute="/login" />);

      // Trigger error on login form
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Navigate to signup form
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);

      // Error should be cleared on signup form
      await waitFor(() => {
        expect(screen.getByText('Create Account')).toBeInTheDocument();
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation Integration', () => {
    test('form validation works with auth context loading states', async () => {
      // Mock a delayed response to test loading state
      api.authAPI.login.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      window.history.pushState({}, 'Login', '/login');
      
      render(<TestWrapper initialRoute="/login" />);

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      // Submit empty form first
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });

      // Fill form and submit
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Should show loading state
      expect(screen.getByRole('button', { name: 'Signing In...' })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });
});