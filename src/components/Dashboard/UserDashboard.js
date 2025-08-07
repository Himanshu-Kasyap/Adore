import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';
import BookingsList from './BookingsList';
import ProfileEdit from './ProfileEdit';

const UserDashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBookings();
    }
  }, [isAuthenticated, user]);

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError(null);
      const response = await userAPI.getBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      setBookingsError(error.response?.data?.error?.message || 'Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleBookingUpdate = () => {
    fetchBookings();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Dashboard Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your bookings and profile</p>
        </div>

        {/* Dashboard Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 sm:px-8" aria-label="Tabs">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'bookings'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('bookings')}
              >
                My Bookings
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
            </nav>
          </div>

          {/* Dashboard Content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <h3 className="text-sm font-medium text-green-100 mb-2">Total Bookings</h3>
                    <p className="text-3xl font-bold">{bookings.length}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <h3 className="text-sm font-medium text-blue-100 mb-2">Active Bookings</h3>
                    <p className="text-3xl font-bold">
                      {bookings.filter(booking => booking.status === 'confirmed' || booking.status === 'pending').length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white sm:col-span-2 lg:col-span-1">
                    <h3 className="text-sm font-medium text-purple-100 mb-2">Member Since</h3>
                    <p className="text-lg sm:text-xl font-semibold">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  {bookingsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-3">
                      {bookings.slice(0, 3).map(booking => (
                        <div key={booking._id} className="bg-white rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              Booking on {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                            <p className="font-semibold text-gray-900">${booking.totalAmount}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <BookingsList
                bookings={bookings}
                loading={bookingsLoading}
                error={bookingsError}
                onUpdate={handleBookingUpdate}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileEdit user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;