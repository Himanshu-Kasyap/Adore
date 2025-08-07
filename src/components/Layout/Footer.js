import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 sm:py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">Rural Community Platform</h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Connecting rural communities with essential services and products for a better tomorrow.
            </p>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">Contact Info</h3>
            <div className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
              <p>123 Rural Road, Village Center</p>
              <p>
                <a href="tel:+15551234567" className="hover:text-white transition-colors">
                  Phone: (555) 123-4567
                </a>
              </p>
              <p>
                <a href="mailto:info@ruralcommunity.com" className="hover:text-white transition-colors break-all">
                  Email: info@ruralcommunity.com
                </a>
              </p>
            </div>
          </div>
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-300">
          <p className="text-sm sm:text-base">
            &copy; 2024 Rural Community Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;