import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductCard from '../ProductCard';

describe('ProductCard Component', () => {
  const mockProduct = {
    _id: '1',
    name: 'Test Product',
    description: 'Test product description',
    price: 29.99,
    image: '🧪',
    category: 'test',
    inStock: true
  };

  const mockOnAddToCart = jest.fn();

  beforeEach(() => {
    mockOnAddToCart.mockClear();
  });

  test('renders product information correctly', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
        isAuthenticated={true} 
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test product description')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('🧪')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  test('shows out of stock status for unavailable products', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false };
    
    render(
      <ProductCard 
        product={outOfStockProduct} 
        onAddToCart={mockOnAddToCart} 
        isAuthenticated={true} 
      />
    );

    expect(screen.getAllByText('Out of Stock')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled();
  });

  test('allows quantity selection for in-stock products', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
        isAuthenticated={true} 
      />
    );

    const quantityInput = screen.getByLabelText(/qty/i);
    expect(quantityInput).toBeInTheDocument();
    expect(quantityInput.value).toBe('1');

    fireEvent.change(quantityInput, { target: { value: '3' } });
    expect(quantityInput.value).toBe('3');
  });

  test('calls onAddToCart with correct parameters when add to cart is clicked', async () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
        isAuthenticated={true} 
      />
    );

    const quantityInput = screen.getByLabelText(/qty/i);
    const addButton = screen.getByRole('button', { name: /add to cart/i });

    fireEvent.change(quantityInput, { target: { value: '2' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct, 2);
    });
  });

  test('shows login prompt for unauthenticated users', async () => {
    // Mock window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
        isAuthenticated={false} 
      />
    );

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please login to add products to cart');
      expect(mockOnAddToCart).not.toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });

  test('disables add to cart button while adding', async () => {
    // Mock a slow onAddToCart function
    const slowOnAddToCart = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={slowOnAddToCart} 
        isAuthenticated={true} 
      />
    );

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);

    // Button should show "Adding..." and be disabled
    expect(screen.getByRole('button', { name: /adding.../i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add to cart/i })).not.toBeDisabled();
    });
  });

  test('resets quantity to 1 after successful add to cart', async () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
        isAuthenticated={true} 
      />
    );

    const quantityInput = screen.getByLabelText(/qty/i);
    const addButton = screen.getByRole('button', { name: /add to cart/i });

    fireEvent.change(quantityInput, { target: { value: '5' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(quantityInput.value).toBe('1');
    });
  });
});