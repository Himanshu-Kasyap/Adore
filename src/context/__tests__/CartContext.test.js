import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CartProvider, useCart } from '../CartContext';

// Mock the API
jest.mock('../../utils/api', () => ({
  userAPI: {
    createBooking: jest.fn()
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Test component to interact with cart context
const TestComponent = () => {
  const { 
    items, 
    totalItems, 
    totalAmount, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    createBooking,
    loading,
    error 
  } = useCart();

  const mockProduct = {
    _id: '1',
    name: 'Test Product',
    price: 10.00,
    image: '🧪',
    category: 'test'
  };

  return (
    <div>
      <div data-testid="total-items">{totalItems}</div>
      <div data-testid="total-amount">{totalAmount}</div>
      <div data-testid="items-count">{items.length}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      
      <button onClick={() => addToCart(mockProduct, 2)}>Add to Cart</button>
      <button onClick={() => removeFromCart('1')}>Remove from Cart</button>
      <button onClick={() => updateQuantity('1', 5)}>Update Quantity</button>
      <button onClick={clearCart}>Clear Cart</button>
      <button onClick={createBooking}>Create Booking</button>
      
      {items.map(item => (
        <div key={item.product._id} data-testid={`item-${item.product._id}`}>
          {item.product.name} - Qty: {item.quantity} - Price: ${item.price}
        </div>
      ))}
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  test('provides initial cart state', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('total-items')).toHaveTextContent('0');
    expect(screen.getByTestId('total-amount')).toHaveTextContent('0');
    expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  test('adds items to cart correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('2');
      expect(screen.getByTestId('total-amount')).toHaveTextContent('20');
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('Test Product - Qty: 2 - Price: $10');
    });
  });

  test('updates existing item quantity when adding same product', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add to Cart');
    
    // Add item twice
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('2');
    });
    
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('4');
      expect(screen.getByTestId('total-amount')).toHaveTextContent('40');
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('Test Product - Qty: 4 - Price: $10');
    });
  });

  test('removes items from cart', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add to Cart');
    const removeButton = screen.getByText('Remove from Cart');
    
    // Add then remove
    fireEvent.click(addButton);
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('0');
      expect(screen.getByTestId('total-amount')).toHaveTextContent('0');
      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    });
  });

  test('updates item quantity', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add to Cart');
    const updateButton = screen.getByText('Update Quantity');
    
    // Add item then update quantity
    fireEvent.click(addButton);
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('5');
      expect(screen.getByTestId('total-amount')).toHaveTextContent('50');
      expect(screen.getByTestId('item-1')).toHaveTextContent('Test Product - Qty: 5 - Price: $10');
    });
  });

  test('clears entire cart', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add to Cart');
    const clearButton = screen.getByText('Clear Cart');
    
    // Add item then clear
    fireEvent.click(addButton);
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('0');
      expect(screen.getByTestId('total-amount')).toHaveTextContent('0');
      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    });
  });

  test('loads cart from localStorage on initialization', async () => {
    const savedCart = {
      items: [{
        product: { _id: '1', name: 'Saved Product', price: 15.00 },
        quantity: 3,
        price: 15.00
      }],
      totalItems: 3,
      totalAmount: 45.00,
      loading: false,
      error: null
    };
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedCart));
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('3');
      expect(screen.getByTestId('total-amount')).toHaveTextContent('45');
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    });
  });

  test('saves cart to localStorage when cart changes', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('2');
    });

    // localStorage.setItem should be called multiple times due to useEffect
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('throws error when useCart is used outside CartProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCart must be used within a CartProvider');
    
    consoleSpy.mockRestore();
  });
});