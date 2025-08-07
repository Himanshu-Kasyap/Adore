import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserDashboard from '../UserDashboard';
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

// Mock the child components
jest.mock('../BookingsList', () => {
  return function MockBookingsList({ bookings, loading, error, onUpdate }) {
    return (
      <div data-testid="bookings-list">
        <div>Bookings: {bookings.length}</div>
        <div>Loading: {loading.toString()}</div>
        <div>Error: {error || 'none'}</div>
        <button onClick={onUpdate}>Update</button>
      </div>
    );
  };
});

jest.mock('../ProfileEdit', () => {
  return function MockProfileEdit({ user }) {
    return (
      <div data-testid="profile-edit">
        Profile for: {user?.name || 'Unknown'}
      </div>
    );
  };
});

describe('UserDashboard', () => {
  const mockUser = {
    _id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2023-01-01T00:00:00.000Z'
  };

  const mockBookings = [
    {
      _id: 'booking1',
      totalAmount: 100,
      status: 'confirmed',
      createdAt: '2023-06-01T00:00:00.000Z',
      products: []
    },
    {
      _id: 'booking2',
      totalAmount: 200,
      status: 'pending',
      createdAt: '2023-06-02T00:00:00.000Z',
      products: []
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state when auth is loading', () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true
    });

    render(<UserDashboard />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('shows unauthorized message when user is not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false
    });

    render(<UserDashboard />);

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Please log in to access your dashboard.')).toBeInTheDocument();
  });

  it('renders dashboard with user welcome message when authenticated', async () => {
    useAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false
    });

    userAPI.getBookings.mockResolvedValue({
      data: { bookings: mockBookings }
    });

    render(<UserDashboard />);

    expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument();
    expect(screen.getByText('Manage your bookings and profile')).toBeInTheDocument();
  });

  it('displays correct stats in overview tab', async () => {
    useAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false
    });

    userAPI.getBookings.mockResolvedValue({
      data: { bookings: mockBookings }
    });

    render(<UserDashboard />);

    await waitFor(() => {
      expect(screen.getAllByText('2')).toHaveLength(2); // Total bookings and Active bookings
    });
  });

  it('switches between tabs correctly', async () => {
    useAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false
    });

    userAPI.getBookings.mockResolvedValue({
      data: { bookings: mockBookings }
    });

    render(<UserDashboard />);

    // Initially on overview tab
    expect(screen.getByText('Total Bookings')).toBeInTheDocument();

    // Switch to bookings tab
    fireEvent.click(screen.getByText('My Bookings'));
    await waitFor(() => {
      expect(screen.getByTestId('bookings-list')).toBeInTheDocument();
    });

    // Switch to profile tab
    fireEvent.click(screen.getByText('Profile'));
    await waitFor(() => {
      expect(screen.getByTestId('profile-edit')).toBeInTheDocument();
    });
  });

  it('handles bookings API error', async () => {
    useAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false
    });

    userAPI.getBookings.mockRejectedValue({
      response: { data: { error: { message: 'Failed to load bookings' } } }
    });

    render(<UserDashboard />);

    // Switch to bookings tab to see error
    fireEvent.click(screen.getByText('My Bookings'));
    
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load bookings')).toBeInTheDocument();
    });
  });

  it('refreshes bookings when update is called', async () => {
    useAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false
    });

    userAPI.getBookings
      .mockResolvedValueOnce({ data: { bookings: mockBookings } })
      .mockResolvedValueOnce({ data: { bookings: [...mockBookings, { _id: 'booking3', totalAmount: 300, status: 'completed', createdAt: '2023-06-03T00:00:00.000Z', products: [] }] } });

    render(<UserDashboard />);

    // Switch to bookings tab
    fireEvent.click(screen.getByText('My Bookings'));
    
    await waitFor(() => {
      expect(screen.getByText('Bookings: 2')).toBeInTheDocument();
    });

    // Trigger update
    fireEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(screen.getByText('Bookings: 3')).toBeInTheDocument();
    });

    expect(userAPI.getBookings).toHaveBeenCalledTimes(2);
  });

  it('displays fallback name when user name is not available', () => {
    useAuth.mockReturnValue({
      user: { ...mockUser, name: null },
      isAuthenticated: true,
      loading: false
    });

    userAPI.getBookings.mockResolvedValue({
      data: { bookings: [] }
    });

    render(<UserDashboard />);

    expect(screen.getByText('Welcome back, User!')).toBeInTheDocument();
  });

  it('shows no recent activity when no bookings exist', async () => {
    useAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false
    });

    userAPI.getBookings.mockResolvedValue({
      data: { bookings: [] }
    });

    render(<UserDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });
  });
});