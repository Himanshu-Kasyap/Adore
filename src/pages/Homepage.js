import React from 'react';
import HeroSection from '../components/Homepage/HeroSection';
import ServicesSection from '../components/Homepage/ServicesSection';
import ProductsSection from '../components/Homepage/ProductsSection';
import NewsSection from '../components/Homepage/NewsSection';
import ContactSection from '../components/Homepage/ContactSection';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <ServicesSection />
      <ProductsSection />
      <NewsSection />
      <ContactSection />
    </div>
  );
};

export default HomePage;