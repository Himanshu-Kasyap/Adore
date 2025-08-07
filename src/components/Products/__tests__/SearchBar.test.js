import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from '../SearchBar';

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();
  const mockCategories = ['agriculture', 'equipment', 'health'];

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  test('renders search bar with all form elements', () => {
    render(<SearchBar onSearch={mockOnSearch} categories={mockCategories} />);
    
    expect(screen.getByLabelText(/search products/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByText(/price range/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  test('displays categories in dropdown', () => {
    render(<SearchBar onSearch={mockOnSearch} categories={mockCategories} />);
    
    const categorySelect = screen.getByLabelText(/category/i);
    expect(categorySelect).toBeInTheDocument();
    
    // Check if categories are rendered as options
    mockCategories.forEach(category => {
      expect(screen.getByRole('option', { name: new RegExp(category, 'i') })).toBeInTheDocument();
    });
  });

  test('calls onSearch with correct parameters when form is submitted', async () => {
    render(<SearchBar onSearch={mockOnSearch} categories={mockCategories} />);
    
    const searchInput = screen.getByLabelText(/search products/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const minPriceInput = screen.getByPlaceholderText(/min/i);
    const maxPriceInput = screen.getByPlaceholderText(/max/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    // Fill in form
    fireEvent.change(searchInput, { target: { value: 'fertilizer' } });
    fireEvent.change(categorySelect, { target: { value: 'agriculture' } });
    fireEvent.change(minPriceInput, { target: { value: '10' } });
    fireEvent.change(maxPriceInput, { target: { value: '50' } });

    // Submit form
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        search: 'fertilizer',
        category: 'agriculture',
        minPrice: '10',
        maxPrice: '50'
      });
    });
  });

  test('clears all filters when clear button is clicked', async () => {
    render(<SearchBar onSearch={mockOnSearch} categories={mockCategories} />);
    
    const searchInput = screen.getByLabelText(/search products/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const minPriceInput = screen.getByPlaceholderText(/min/i);
    const clearButton = screen.getByRole('button', { name: /clear/i });

    // Fill in some values
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.change(categorySelect, { target: { value: 'agriculture' } });
    fireEvent.change(minPriceInput, { target: { value: '10' } });

    // Clear filters
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(searchInput.value).toBe('');
      expect(categorySelect.value).toBe('');
      expect(minPriceInput.value).toBe('');
      expect(mockOnSearch).toHaveBeenCalledWith({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: ''
      });
    });
  });

  test('handles form submission with enter key', async () => {
    render(<SearchBar onSearch={mockOnSearch} categories={mockCategories} />);
    
    const searchInput = screen.getByLabelText(/search products/i);
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    fireEvent.submit(searchInput.closest('form'));

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        search: 'test search',
        category: '',
        minPrice: '',
        maxPrice: ''
      });
    });
  });
});