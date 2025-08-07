import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-lg sm:text-xl font-bold hover:text-green-200 transition-colors"
              onClick={closeMobileMenu}
            >
              <span className="hidden sm:inline">Rural Community Platform</span>
              <span className="sm:hidden">RCP</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link to="/" className="hover:text-green-200 transition-colors font-medium">
              Home
            </Link>
            <Link to="/services" className="hover:text-green-200 transition-colors font-medium">
              Services
            </Link>
            <Link to="/products" className="hover:text-green-200 transition-colors font-medium">
              Products
            </Link>
            <Link to="/contact" className="hover:text-green-200 transition-colors font-medium">
              Contact
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="hover:text-green-200 transition-colors font-medium">
                  Dashboard
                </Link>
                <span className="text-green-200 text-sm hidden lg:inline">
                  Welcome, {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-green-700 px-3 py-1.5 lg:px-4 lg:py-2 rounded text-sm font-medium hover:bg-green-800 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="hover:text-green-200 transition-colors font-medium">
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-green-700 px-3 py-1.5 lg:px-4 lg:py-2 rounded text-sm font-medium hover:bg-green-800 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-green-200 focus:outline-none focus:text-green-200 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-green-700 rounded-b-lg">
              <Link 
                to="/" 
                className="block px-3 py-2 text-white hover:text-green-200 hover:bg-green-800 rounded transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link 
                to="/services" 
                className="block px-3 py-2 text-white hover:text-green-200 hover:bg-green-800 rounded transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Services
              </Link>
              <Link 
                to="/products" 
                className="block px-3 py-2 text-white hover:text-green-200 hover:bg-green-800 rounded transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Products
              </Link>
              <Link 
                to="/contact" 
                className="block px-3 py-2 text-white hover:text-green-200 hover:bg-green-800 rounded transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="block px-3 py-2 text-white hover:text-green-200 hover:bg-green-800 rounded transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <div className="px-3 py-2 text-green-200 text-sm">
                    Welcome, {user?.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-white hover:text-green-200 hover:bg-green-800 rounded transition-colors font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block px-3 py-2 text-white hover:text-green-200 hover:bg-green-800 rounded transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block px-3 py-2 bg-green-800 text-white hover:bg-green-900 rounded transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;