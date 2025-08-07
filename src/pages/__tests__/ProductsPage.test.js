import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProductsPage from '../ProductsPage';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';

// Mock the API
jest.mock('../../utils/api', () => ({
  productsAPI: {
    getAll: jest.fn()
  }
}));

import { productsAPI } from '../../utils/api';

const MockedProductsPage = ({ isAuthenticated = false }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ProductsPage />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ProductsPage', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Test Product 1',
      description: 'Description 1',
      price: 10.99,
      image: '🧪',
      category: 'test',
      inStock: true
    },
    {
      _id: '2',
      name: 'Test Product 2',
      description: 'Description 2',
      price: 20.99,
      image: '🔬',
      category: 'science',
      inStock: false
    }
  ];

  beforeEach(() => {
    productsAPI.getAll.mockClear();
  });

  test('renders page header and cart button', async () => {
    productsAPI.getAll.mockResolvedValue({ data: { products: mockProducts } });
    
    render(<MockedProductsPage />);

    expect(screen.getByText('Available Products')).toBeInTheDocument();
    expect(screen.getByText(/discover quality products/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cart/i })).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    productsAPI.getAll.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<MockedProductsPage />);

    expect(screen.getByRole('generic')).toHaveClass('animate-spin');
  });

  test('fetches and displays products', async () => {
    productsAPI.getAll.mockResolvedValue({ data: { products: mockProducts } });
    
    render(<MockedProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });

    expect(screen.getByText('Showing 2 of 2 products')).toBeInTheDocument();
  });

  test('falls back to dummy data when API fails', async () => {
    productsAPI.getAll.mockRejectedValue(new Error('API Error'));
    
    render(<MockedProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load products. Please try again.')).toBeInTheDocument();
      // Should still show fallback products
      expect(screen.getByText('Organic Fertilizer')).toBeInTheDocument();
    });
  });

  test('search functionality filters products', async () => {
    productsAPI.getAll.mockResolvedValue({ data: { products: mockProducts } });
    
    render(<MockedProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    // Use search
    const searchInput = screen.getByLabelText(/search products/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'Product 1' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument();
      expect(screen.getByText('Showing 1 of 2 products')).toBeInTheDocument();
    });
  });

  test('category filter works correctly', async () => {
    productsAPI.getAll.mockResolvedValue({ data: { products: mockProducts } });
    
    render(<MockedProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    // Filter by category
    const categorySelect = screen.getByLabelText(/category/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(categorySelect, { target: { value: 'science' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      expect(screen.getByText('Showing 1 of 2 products')).toBeInTheDocument();
    });
  });

  test('price range filter works correctly', async () => {
    productsAPI.getAll.mockResolvedValue({ data: { products: mockProducts } });
    
    render(<MockedProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    // Filter by price range
    const minPriceInput = screen.getByPlaceholderText(/min/i);
    const maxPriceInput = screen.getByPlaceholderText(/max/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(minPriceInput, { target: { value: '15' } });
    fireEvent.change(maxPriceInput, { target: { value: '25' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      expect(screen.getByText('Showing 1 of 2 products')).toBeInTheDocument();
    });
  });

  test('shows no products found message when no results', async () => {
    productsAPI.getAll.mockResolvedValue({ data: { products: mockProducts } });
    
    render(<MockedProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    // Search for non-existent product
    const searchInput = screen.getByLabelText(/search products/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'Non-existent Product' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
    });
  });

  test('opens cart when cart button is clicked', async () => {
    productsAPI.getAll.mockResolvedValue({ data: { products: mockProducts } });
    
    render(<MockedProductsPage />);

    const cartButton = screen.getByRole('button', { name: /cart/i });
    fireEvent.click(cartButton);

    await waitFor(() => {
      expect(screen.getByText(/shopping cart/i)).toBeInTheDocument();
    });
  });
});