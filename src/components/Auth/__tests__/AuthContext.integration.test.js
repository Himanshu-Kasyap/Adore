import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../../context/AuthContext';
import * as api from '../../../utils/api';

// Mock the API
jest.mock('../../../utils/api');

// Test component to interact with AuthContext
const TestAuthComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    error, 
    login, 
    register, 
    logout, 
    clearError 
  } = useAuth();

  return (
    <div>
      <div data-testid="auth-state">
        <span data-testid="loading">{loading ? 'loading' : 'not-loading'}</span>
        <span data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
        <span data-testid="user">{user ? user.name : 'no-user'}</span>
        <span data-testid="error">{error || 'no-error'}</span>
      </div>
      
      <div data-testid="auth-actions">
        <button 
          onClick={() => login({ email: 'test@example.com', password: 'password123' })}
          data-testid="login-btn"
        >
          Login
        </button>
        <button 
          onClick={() => register({ 
            name: 'Test User', 
            email: 'test@example.com', 
            password: 'password123',
            phone: ''
          })}
          data-testid="register-btn"
        >
          Register
        </button>
        <button onClick={logout} data-testid="logout-btn">Logout</button>
        <button onClick={clearError} data-testid="clear-error-btn">Clear Error</button>
      </div>
    </div>
  );
};

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('AuthContext Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    test('provides correct initial state when no user is stored', async () => {
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      });
    });

    test('loads user from localStorage on initialization', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('John Doe');
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      });
    });

    test('handles corrupted localStorage data gracefully', async () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', 'invalid-json');

      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });

      // Should clear corrupted data
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Login Functionality', () => {
    test('handles successful login', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      const mockResponse = {
        data: {
          user: mockUser,
          token: 'mock-token'
        }
      };

      api.authAPI.login.mockResolvedValue(mockResponse);

      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      const loginBtn = screen.getByTestId('login-btn');
      
      await act(async () => {
        fireEvent.click(loginBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('John Doe');
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      });

      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser);
    });

    test('handles login error', async () => {
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

      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      const loginBtn = screen.getByTestId('login-btn');
      
      await act(async () => {
        fireEvent.click(loginBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      });

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('shows loading state during login', async () => {
      api.authAPI.login.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: {
            user: { id: 1, name: 'John Doe', email: 'john@example.com' },
            token: 'mock-token'
          }
        }), 100))
      );

      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      const loginBtn = screen.getByTestId('login-btn');
      
      act(() => {
        fireEvent.click(loginBtn);
      });

      // Should show loading state
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });
    });
  });

  describe('Registration Functionality', () => {
    test('handles successful registration', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      const mockResponse = {
        data: {
          user: mockUser,
          token: 'mock-token'
        }
      };

      api.authAPI.register.mockResolvedValue(mockResponse);

      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      const registerBtn = screen.getByTestId('register-btn');
      
      await act(async () => {
        fireEvent.click(registerBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('Test User');
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      });

      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser);
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
          <TestAuthComponent />
        </TestWrapper>
      );

      const registerBtn = screen.getByTestId('register-btn');
      
      await act(async () => {
        fireEvent.click(registerBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
        expect(screen.getByTestId('error')).toHaveTextContent('Email already exists');
      });

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('shows loading state during registration', async () => {
      api.authAPI.register.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: {
            user: { id: 1, name: 'Test User', email: 'test@example.com' },
            token: 'mock-token'
          }
        }), 100))
      );

      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      const registerBtn = screen.getByTestId('register-btn');
      
      act(() => {
        fireEvent.click(registerBtn);
      });

      // Should show loading state
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });
    });
  });

  describe('Logout Functionality', () => {
    test('handles successful logout', async () => {
      // Set up authenticated state
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      api.authAPI.logout.mockResolvedValue({});

      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });

      const logoutBtn = screen.getByTestId('logout-btn');
      
      await act(async () => {
        fireEvent.click(logoutBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      });

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('handles logout even when API call fails', async () => {
      // Set up authenticated state
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      api.authAPI.logout.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });

      const logoutBtn = screen.getByTestId('logout-btn');
      
      await act(async () => {
        fireEvent.click(logoutBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });

      // Should still clear localStorage even if API fails
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Error Management', () => {
    test('clears errors when clearError is called', async () => {
      const mockError = {
        response: {
          data: {
            error: {
              message: 'Login failed'
            }
          }
        }
      };

      api.authAPI.login.mockRejectedValue(mockError);

      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      const loginBtn = screen.getByTestId('login-btn');
      const clearErrorBtn = screen.getByTestId('clear-error-btn');
      
      // Trigger error
      await act(async () => {
        fireEvent.click(loginBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Login failed');
      });

      // Clear error
      act(() => {
        fireEvent.click(clearErrorBtn);
      });

      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    test('handles network errors with fallback message', async () => {
      const networkError = new Error('Network Error');
      api.authAPI.login.mockRejectedValue(networkError);

      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      const loginBtn = screen.getByTestId('login-btn');
      
      await act(async () => {
        fireEvent.click(loginBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Login failed');
      });
    });
  });

  describe('Context Provider Error Handling', () => {
    test('throws error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      const TestComponent = () => {
        useAuth();
        return <div>Test</div>;
      };

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });
  });

  describe('State Transitions', () => {
    test('maintains correct state during login -> logout -> login cycle', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      const mockResponse = {
        data: {
          user: mockUser,
          token: 'mock-token'
        }
      };

      api.authAPI.login.mockResolvedValue(mockResponse);
      api.authAPI.logout.mockResolvedValue({});

      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      const loginBtn = screen.getByTestId('login-btn');
      const logoutBtn = screen.getByTestId('logout-btn');

      // Initial state
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      });

      // Login
      await act(async () => {
        fireEvent.click(loginBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('John Doe');
      });

      // Logout
      await act(async () => {
        fireEvent.click(logoutBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });

      // Login again
      await act(async () => {
        fireEvent.click(loginBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('John Doe');
      });
    });
  });
});