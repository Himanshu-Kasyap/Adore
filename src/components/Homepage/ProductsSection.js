import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const ProductsSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const products = [
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
    }
  ];

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      alert('Please login to add products to cart');
      navigate('/login');
      return;
    }
    addToCart(product, 1);
  };

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Available Products
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Quality products to support your daily needs and business growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
            <div 
              key={product._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-center">{product.image}</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    ${product.price}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <button 
                  onClick={() => handleAddToCart(product)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
                    product.inStock
                      ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <button 
            onClick={() => navigate('/products')}
            className="w-full sm:w-auto bg-green-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;