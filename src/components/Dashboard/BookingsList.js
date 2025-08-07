import React from 'react';

const BookingsList = ({ bookings, loading, error, onUpdate }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Bookings</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={onUpdate} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
          <p className="text-gray-600 mb-6">You haven't made any bookings yet. Start exploring our products and services!</p>
          <button 
            onClick={() => window.location.href = '/products'} 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
        <button 
          onClick={onUpdate} 
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Booking Header */}
            <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Booking ID:</span>
                <span className="font-mono text-sm font-medium text-gray-900">#{booking._id.slice(-8)}</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>

            {/* Booking Details */}
            <div className="px-4 sm:px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Date:</span>
                  <p className="font-medium text-gray-900">{formatDate(booking.createdAt)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <p className="font-bold text-green-600 text-lg">${booking.totalAmount}</p>
                </div>
              </div>

              {/* Products List */}
              {booking.products && booking.products.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Products:</h4>
                  <div className="space-y-2">
                    {booking.products.map((product, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {product.productId?.name || 'Product'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Qty: {product.quantity}</span>
                          <span className="font-medium text-gray-900">${product.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {booking.status === 'pending' && (
                  <button 
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm cursor-not-allowed opacity-50"
                    disabled
                  >
                    Cancel Booking
                  </button>
                )}
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingsList;