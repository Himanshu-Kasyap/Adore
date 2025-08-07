import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cart from '../Cart';
import { CartProvider } from '../../../context/CartContext';
import { AuthProvider } from '../../../context/AuthContext';

// Mock the API
jest.mock('../../../utils/api', () => ({
  userAPI: {
    createBooking: jest.fn()
  }
}));

const MockedCart = ({ isOpen, onClose, cartItems = [], isAuthenticated = false }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <div>
          {/* Mock cart state by directly rendering with props */}
          <Cart isOpen={isOpen} onClose={onClose} />
        </div>
      </CartProvider>
    </AuthProvider>
  );
};

describe('Cart Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test('does not render when isOpen is false', () => {
    render(<MockedCart isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText(/shopping cart/i)).not.toBeInTheDocument();
  });

  test('renders cart header when open', () => {
    render(<MockedCart isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText(/shopping cart/i)).toBeInTheDocument();
  });

  test('shows empty cart message when no items', () => {
    render(<MockedCart isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  test('closes cart when close button is clicked', () => {
    render(<MockedCart isOpen={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: '' }); // Close button with X icon
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('closes cart when backdrop is clicked', () => {
    render(<MockedCart isOpen={true} onClose={mockOnClose} />);
    
    const backdrop = screen.getByRole('generic', { hidden: true });
    fireEvent.click(backdrop);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('shows empty cart when no items', () => {
    render(<MockedCart isOpen={true} onClose={mockOnClose} isAuthenticated={false} />);
    
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });
});

// Integration test with actual CartProvider
describe('Cart Integration', () => {
  test('cart functionality works with CartProvider', async () => {
    const TestComponent = () => {
      const [isCartOpen, setIsCartOpen] = React.useState(true);
      
      return (
        <AuthProvider>
          <CartProvider>
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </CartProvider>
        </AuthProvider>
      );
    };

    render(<TestComponent />);
    
    expect(screen.getByText(/shopping cart \(0\)/i)).toBeInTheDocument();
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });
});