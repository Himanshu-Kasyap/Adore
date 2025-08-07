import React, { useState, useEffect } from 'react';
import { SearchBar, ProductCard, Cart } from '../components/Products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../utils/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { addToCart, totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Extract unique categories when products change
  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category).filter(Boolean))];
    setCategories(uniqueCategories);
  }, [products]);

  const fetchProducts = async (searchParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsAPI.getAll(searchParams);
      const productsData = response.data.products || response.data;
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      // Fallback to dummy data if API fails
      const fallbackProducts = [
        {
          _id: '1',
          name: 'Organic Fertilizer',
          description: 'Premium organic fertilizer for healthy crop growth',
          price: 25.99,
          image: '🌱',
          category: 'agriculture',
          inStock: true
        },
        {
          _id: '2',
          name: 'Solar Water Pump',
          description: 'Efficient solar-powered water pump for irrigation',
          price: 299.99,
          image: '☀️',
          category: 'equipment',
          inStock: true
        },
        {
          _id: '3',
          name: 'First Aid Kit',
          description: 'Complete medical first aid kit for emergencies',
          price: 45.50,
          image: '🏥',
          category: 'health',
          inStock: true
        },
        {
          _id: '4',
          name: 'Educational Tablets',
          description: 'Pre-loaded tablets with educational content',
          price: 199.99,
          image: '📱',
          category: 'education',
          inStock: false
        },
        {
          _id: '5',
          name: 'Seed Varieties Pack',
          description: 'High-yield vegetable and grain seed collection',
          price: 35.75,
          image: '🌾',
          category: 'agriculture',
          inStock: true
        },
        {
          _id: '6',
          name: 'Water Purification Kit',
          description: 'Portable water purification system for clean drinking water',
          price: 89.99,
          image: '💧',
          category: 'health',
          inStock: true
        },
        {
          _id: '7',
          name: 'LED Solar Lights',
          description: 'Energy-efficient solar-powered LED lighting system',
          price: 65.00,
          image: '💡',
          category: 'equipment',
          inStock: true
        },
        {
          _id: '8',
          name: 'Livestock Feed',
          description: 'Nutritious feed supplement for cattle and poultry',
          price: 42.25,
          image: '🐄',
          category: 'agriculture',
          inStock: true
        }
      ];
      setProducts(fallbackProducts);
      setFilteredProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchParams) => {
    let filtered = [...products];

    // Filter by search term
    if (searchParams.search) {
      const searchTerm = searchParams.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by category
    if (searchParams.category) {
      filtered = filtered.filter(product => product.category === searchParams.category);
    }

    // Filter by price range
    if (searchParams.minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(searchParams.minPrice));
    }
    if (searchParams.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(searchParams.maxPrice));
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (product, quantity) => {
    try {
      addToCart(product, quantity);
      // Show success message or notification
      console.log(`Added ${quantity} ${product.name}(s) to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Available Products</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Discover quality products to support your daily needs and business growth
            </p>
          </div>
          
          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          categories={categories}
        />

        {/* Products Count */}
        <div className="mb-4 sm:mb-6">
          <p className="text-gray-600 text-sm sm:text-base">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}

        {/* Cart Component */}
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
      </div>
    </div>
  );
};

export default ProductsPage;