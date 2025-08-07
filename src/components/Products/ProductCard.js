import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart, isAuthenticated }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add products to cart');
      return;
    }

    if (!product.inStock) {
      return;
    }

    setIsAdding(true);
    try {
      await onAddToCart(product, quantity);
      setQuantity(1); // Reset quantity after adding
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        {/* Product Image/Icon */}
        <div className="text-4xl mb-4 text-center">{product.image}</div>
        
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        
        {/* Product Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        
        {/* Category */}
        <div className="mb-3">
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
          </span>
        </div>
        
        {/* Price and Stock Status */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-green-600">
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
        
        {/* Quantity Selector and Add to Cart */}
        {product.inStock && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label htmlFor={`quantity-${product._id}`} className="text-sm font-medium text-gray-700">
                Qty:
              </label>
              <input
                type="number"
                id={`quantity-${product._id}`}
                min="1"
                max="99"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={isAdding || !product.inStock}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                product.inStock && !isAdding
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        )}
        
        {/* Out of Stock Button */}
        {!product.inStock && (
          <button 
            className="w-full py-2 px-4 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
            disabled
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;