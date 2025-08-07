import React from 'react';

const ServicesSection = () => {
  const services = [
    {
      id: 1,
      name: 'Healthcare Services',
      description: 'Access to medical consultations, health checkups, and emergency care',
      icon: '🏥',
      category: 'health'
    },
    {
      id: 2,
      name: 'Agricultural Support',
      description: 'Farming guidance, crop consultation, and agricultural equipment',
      icon: '🌾',
      category: 'agriculture'
    },
    {
      id: 3,
      name: 'Education & Training',
      description: 'Online courses, skill development, and educational resources',
      icon: '📚',
      category: 'education'
    },
    {
      id: 4,
      name: 'Financial Services',
      description: 'Banking, loans, insurance, and financial planning assistance',
      icon: '💰',
      category: 'finance'
    },
    {
      id: 5,
      name: 'Transportation',
      description: 'Local transport, delivery services, and logistics support',
      icon: '🚛',
      category: 'transport'
    },
    {
      id: 6,
      name: 'Technology Support',
      description: 'IT services, internet connectivity, and digital literacy',
      icon: '💻',
      category: 'technology'
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Our Services
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Comprehensive services designed to meet the unique needs of rural communities
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {services.map((service) => (
            <div 
              key={service.id}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-center">{service.icon}</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 text-center">
                {service.name}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-4 leading-relaxed">
                {service.description}
              </p>
              <div className="text-center">
                <button className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 font-medium text-sm sm:text-base">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;