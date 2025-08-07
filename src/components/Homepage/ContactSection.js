import React, { useState } from 'react';
import { contactAPI } from '../../utils/api';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }
    
    // Email validation (optional but must be valid if provided)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = 'Message cannot exceed 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setErrors({});

    // Validate form before submission
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit form data to backend API
      const response = await contactAPI.submit({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        message: formData.message.trim()
      });
      
      if (response.data.success) {
        setSubmitMessage('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitMessage('Sorry, there was an error sending your message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      
      if (error.response?.data?.error?.code === 'VALIDATION_ERROR') {
        // Handle validation errors from backend
        const backendErrors = {};
        error.response.data.error.details.forEach(detail => {
          if (detail.path) {
            backendErrors[detail.path] = detail.msg || detail.message;
          }
        });
        setErrors(backendErrors);
        setSubmitMessage('Please correct the errors below and try again.');
      } else if (error.response?.status === 400) {
        setSubmitMessage('Please check your input and try again.');
      } else if (error.response?.status >= 500) {
        setSubmitMessage('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        setSubmitMessage('Request timeout. Please check your connection and try again.');
      } else {
        setSubmitMessage('Sorry, there was an error sending your message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Contact Us
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Get in touch with us for any questions, support, or feedback
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Get in Touch
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="text-xl sm:text-2xl flex-shrink-0">📍</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Address</h4>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      123 Rural Community Center<br />
                      Main Street, Village Center<br />
                      Rural County, State 12345
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="text-xl sm:text-2xl flex-shrink-0">📞</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Helpline</h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <a href="tel:+1-800-RURAL-HELP" className="hover:text-green-600 transition-colors">
                        +1 (800) RURAL-HELP
                      </a>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">Available 24/7 for emergencies</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="text-xl sm:text-2xl flex-shrink-0">✉️</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Email</h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <a href="mailto:support@ruralcommunity.org" className="hover:text-green-600 transition-colors break-all">
                        support@ruralcommunity.org
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="text-xl sm:text-2xl flex-shrink-0">🕒</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Office Hours</h4>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      Monday - Friday: 8:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Send us a Message
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm sm:text-base ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-green-500'
                  }`}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm sm:text-base ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-green-500'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-vertical text-sm sm:text-base ${
                    errors.message 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-green-500'
                  }`}
                  placeholder="How can we help you?"
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
                } text-white`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              
              {submitMessage && (
                <div className={`p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                  submitMessage.includes('Thank you') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {submitMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;