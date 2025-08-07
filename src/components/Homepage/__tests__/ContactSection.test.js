import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactSection from '../ContactSection';
import { contactAPI } from '../../../utils/api';

// Mock the API module
jest.mock('../../../utils/api', () => ({
  contactAPI: {
    submit: jest.fn()
  }
}));

describe('ContactSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders contact section with all elements', () => {
      render(<ContactSection />);
      
      // Check main heading
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      
      // Check contact information
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByText('Helpline')).toBeInTheDocument();
      expect(screen.getByText('Office Hours')).toBeInTheDocument();
      
      // Check form elements
      expect(screen.getByText('Send us a Message')).toBeInTheDocument();
      expect(screen.getByLabelText('Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Message *')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument();
    });

    test('renders form fields with correct attributes', () => {
      render(<ContactSection />);
      
      const nameInput = screen.getByLabelText('Name *');
      const emailInput = screen.getByLabelText('Email');
      const messageInput = screen.getByLabelText('Message *');
      
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(nameInput).toHaveAttribute('required');
      expect(nameInput).toHaveAttribute('placeholder', 'Your full name');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).not.toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('placeholder', 'your.email@example.com');
      
      expect(messageInput).toHaveAttribute('required');
      expect(messageInput).toHaveAttribute('placeholder', 'How can we help you?');
    });
  });

  describe('Form Validation', () => {
    test('shows validation error for empty name', () => {
      render(<ContactSection />);
      
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    test('shows validation error for short name', () => {
      render(<ContactSection />);
      
      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: 'A' } });
      
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Name must be at least 2 characters long')).toBeInTheDocument();
    });

    test('shows validation error for invalid email', () => {
      render(<ContactSection />);
      
      const nameInput = screen.getByLabelText('Name *');
      const emailInput = screen.getByLabelText('Email');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    test('shows validation error for empty message', () => {
      render(<ContactSection />);
      
      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });

    test('shows validation error for short message', () => {
      render(<ContactSection />);
      
      const nameInput = screen.getByLabelText('Name *');
      const messageInput = screen.getByLabelText('Message *');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(messageInput, { target: { value: 'Short' } });
      
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Message must be at least 10 characters long')).toBeInTheDocument();
    });

    test('clears validation errors when user starts typing', () => {
      render(<ContactSection />);
      
      const nameInput = screen.getByLabelText('Name *');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      
      // Trigger validation error
      fireEvent.click(submitButton);
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      
      // Start typing to clear error
      fireEvent.change(nameInput, { target: { value: 'J' } });
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('submits form with valid data', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Contact form submitted successfully',
          data: { id: '123', name: 'John Doe', createdAt: new Date() }
        }
      };
      contactAPI.submit.mockResolvedValue(mockResponse);
      
      render(<ContactSection />);
      
      const nameInput = screen.getByLabelText('Name *');
      const emailInput = screen.getByLabelText('Email');
      const messageInput = screen.getByLabelText('Message *');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with enough characters.' } });
      
      fireEvent.click(submitButton);
      
      expect(contactAPI.submit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john.doe@example.com',
        message: 'This is a test message with enough characters.'
      });
      
      await waitFor(() => {
        expect(screen.getByText('Thank you for your message! We will get back to you soon.')).toBeInTheDocument();
      });
    });

    test('submits form without email', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Contact form submitted successfully',
          data: { id: '123', name: 'John Doe', createdAt: new Date() }
        }
      };
      contactAPI.submit.mockResolvedValue(mockResponse);
      
      render(<ContactSection />);
      
      const nameInput = screen.getByLabelText('Name *');
      const messageInput = screen.getByLabelText('Message *');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with enough characters.' } });
      
      fireEvent.click(submitButton);
      
      expect(contactAPI.submit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: undefined,
        message: 'This is a test message with enough characters.'
      });
    });

    test('clears form after successful submission', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Contact form submitted successfully',
          data: { id: '123', name: 'John Doe', createdAt: new Date() }
        }
      };
      contactAPI.submit.mockResolvedValue(mockResponse);
      
      render(<ContactSection />);
      
      const nameInput = screen.getByLabelText('Name *');
      const emailInput = screen.getByLabelText('Email');
      const messageInput = screen.getByLabelText('Message *');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with enough characters.' } });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(messageInput).toHaveValue('');
      });
    });

    test('shows loading state during submission', async () => {
      let resolvePromise;
      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      contactAPI.submit.mockReturnValue(mockPromise);
      
      render(<ContactSection />);
      
      const nameInput = screen.getByLabelText('Name *');
      const messageInput = screen.getByLabelText('Message *');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with enough characters.' } });
      
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Sending...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      // Resolve the promise
      resolvePromise({
        data: {
          success: true,
          message: 'Contact form submitted successfully',
          data: { id: '123', name: 'John Doe', createdAt: new Date() }
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText('Send Message')).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles validation errors from backend', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              details: [
                { path: 'name', msg: 'Name is too short' },
                { path: 'message', msg: 'Message is required' }
              ]
            }
          }
        }
      };
      contactAPI.submit.mockRejectedValue(mockError);
      
      render(<ContactSection />);
      
      const nameInput = screen.getByLabelText('Name *');
      const messageInput = screen.getByLabelText('Message *');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with enough characters.' } });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name is too short')).toBeInTheDocument();
        expect(screen.getByText('Message is required')).toBeInTheDocument();
        expect(screen.getByText('Please correct the errors below and try again.')).toBeInTheDocument();
      });
    });

    test('handles server error', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { success: false }
        }
      };
      contactAPI.submit.mockRejectedValue(mockError);
      
      render(<ContactSection />);
      
      const nameInput = screen.getByLabelText('Name *');
      const messageInput = screen.getByLabelText('Message *');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with enough characters.' } });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Server error. Please try again later.')).toBeInTheDocument();
      });
    });

    test('handles generic network error', async () => {
      const mockError = new Error('Network error');
      contactAPI.submit.mockRejectedValue(mockError);
      
      render(<ContactSection />);
      
      const nameInput = screen.getByLabelText('Name *');
      const messageInput = screen.getByLabelText('Message *');
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with enough characters.' } });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Sorry, there was an error sending your message. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(<ContactSection />);
      
      expect(screen.getByLabelText('Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Message *')).toBeInTheDocument();
    });

    test('shows validation errors with proper styling', () => {
      render(<ContactSection />);
      
      const submitButton = screen.getByRole('button', { name: 'Send Message' });
      fireEvent.click(submitButton);
      
      const nameError = screen.getByText('Name is required');
      expect(nameError).toHaveClass('text-red-600');
      
      const nameInput = screen.getByLabelText('Name *');
      expect(nameInput).toHaveClass('border-red-300');
    });
  });
});