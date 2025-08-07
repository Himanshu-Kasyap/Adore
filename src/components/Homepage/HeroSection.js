import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-12 sm:py-16 lg:py-20 min-h-[500px] sm:min-h-[600px] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Welcome to Rural Community Platform
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-2">
            Connecting rural communities with essential services and products. 
            Your gateway to healthcare, education, agriculture, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
            <button 
              onClick={() => navigate('/services')}
              className="w-full sm:w-auto bg-white text-green-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Explore Services
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105"
            >
              View Products
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;