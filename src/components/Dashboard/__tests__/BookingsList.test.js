import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingsList from '../BookingsList';

// Mock window.location
delete window.location;
window.location = { href: '' };

describe('BookingsList', () => {
  const mockBookings = [
    {
      _id: 'booking1',
      totalAmount: 150.50,
      status: 'confirmed',
      createdAt: '2023-06-01T10:30:00.000Z',
      products: [
        {
          productId: { name: 'Product 1' },
          quantity: 2,
          price: 75.25
        }
      ]
    },
    {
      _id: 'booking2',
      totalAmount: 200,
      status: 'pending',
      createdAt: '2023-06-02T14:15:00.000Z',
      products: [
        {
          productId: { name: 'Product 2' },
          quantity: 1,
          price: 200
        }
      ]
    }
  ];

  const defaultProps = {
    bookings: mockBookings,
    loading: false,
    error: null,
    onUpdate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    render(<BookingsList {...defaultProps} loading={true} />);

    expect(screen.getByText('Loading your bookings...')).toBeInTheDocument();
    expect(screen.getByText('Loading your bookings...')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to load bookings';
    render(<BookingsList {...defaultProps} error={errorMessage} />);

    expect(screen.getByText('Error Loading Bookings')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls onUpdate when retry button is clicked', () => {
    const mockOnUpdate = jest.fn();
    render(<BookingsList {...defaultProps} error="Some error" onUpdate={mockOnUpdate} />);

    fireEvent.click(screen.getByText('Try Again'));
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when no bookings exist', () => {
    render(<BookingsList {...defaultProps} bookings={[]} />);

    expect(screen.getByText('No Bookings Yet')).toBeInTheDocument();
    expect(screen.getByText("You haven't made any bookings yet. Start exploring our products and services!")).toBeInTheDocument();
    expect(screen.getByText('Browse Products')).toBeInTheDocument();
  });

  it('navigates to products page when browse products button is clicked', () => {
    render(<BookingsList {...defaultProps} bookings={[]} />);

    fireEvent.click(screen.getByText('Browse Products'));
    expect(window.location.href).toBe('/products');
  });

  it('renders bookings list correctly', () => {
    render(<BookingsList {...defaultProps} />);

    expect(screen.getByText('My Bookings')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    
    // Check first booking
    expect(screen.getByText((content, element) => content.includes('booking1'))).toBeInTheDocument();
    expect(screen.getByText('$150.5')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    
    // Check second booking
    expect(screen.getByText((content, element) => content.includes('booking2'))).toBeInTheDocument();
    expect(screen.getAllByText('$200')).toHaveLength(2); // Total amount and product price
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<BookingsList {...defaultProps} />);

    expect(screen.getByText('June 1, 2023')).toBeInTheDocument();
    expect(screen.getByText('June 2, 2023')).toBeInTheDocument();
  });

  it('displays product information correctly', () => {
    render(<BookingsList {...defaultProps} />);

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Qty: 2')).toBeInTheDocument();
    expect(screen.getByText('$75.25')).toBeInTheDocument();
    
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('Qty: 1')).toBeInTheDocument();
    expect(screen.getAllByText('$200')).toHaveLength(2); // Total amount and product price
  });

  it('applies correct status styling', () => {
    render(<BookingsList {...defaultProps} />);

    const confirmedStatus = screen.getByText('Confirmed');
    const pendingStatus = screen.getByText('Pending');

    expect(confirmedStatus).toHaveClass('status-confirmed');
    expect(pendingStatus).toHaveClass('status-pending');
  });

  it('calls onUpdate when refresh button is clicked', () => {
    const mockOnUpdate = jest.fn();
    render(<BookingsList {...defaultProps} onUpdate={mockOnUpdate} />);

    fireEvent.click(screen.getByText('Refresh'));
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
  });

  it('handles bookings without products', () => {
    const bookingsWithoutProducts = [
      {
        _id: 'booking3',
        totalAmount: 100,
        status: 'completed',
        createdAt: '2023-06-03T12:00:00.000Z',
        products: []
      }
    ];

    render(<BookingsList {...defaultProps} bookings={bookingsWithoutProducts} />);

    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    // Should not show products section
    expect(screen.queryByText('Products:')).not.toBeInTheDocument();
  });

  it('handles products without productId name', () => {
    const bookingsWithUnnamedProducts = [
      {
        _id: 'booking4',
        totalAmount: 50,
        status: 'confirmed',
        createdAt: '2023-06-04T12:00:00.000Z',
        products: [
          {
            productId: null,
            quantity: 1,
            price: 50
          }
        ]
      }
    ];

    render(<BookingsList {...defaultProps} bookings={bookingsWithUnnamedProducts} />);

    expect(screen.getByText('Product')).toBeInTheDocument(); // Fallback name
    expect(screen.getByText('Qty: 1')).toBeInTheDocument();
    expect(screen.getAllByText('$50')).toHaveLength(2); // Total amount and product price
  });

  it('shows action buttons correctly', () => {
    render(<BookingsList {...defaultProps} />);

    // Should show cancel button for pending booking (but disabled)
    const cancelButtons = screen.getAllByText('Cancel Booking');
    expect(cancelButtons[0]).toBeDisabled();

    // Should show view details buttons
    const viewDetailsButtons = screen.getAllByText('View Details');
    expect(viewDetailsButtons).toHaveLength(2);
  });
});