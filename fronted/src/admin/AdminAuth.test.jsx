import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import AdminAuth from './AdminAuth';

// Mock axios
jest.mock('axios');

describe('AdminAuth', () => {
  test('should register a new admin successfully', async () => {
    const mockOnAuthSuccess = jest.fn();
    const mockResponse = { data: { message: 'Admin account created successfully. You can now log in.' } };
    axios.post.mockResolvedValue(mockResponse);

    render(<AdminAuth onAuthSuccess={mockOnAuthSuccess} />);

    // Switch to register mode
    fireEvent.click(screen.getByText('Create New Account'));

    // Fill out the registration form
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your location'), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByPlaceholderText('Create a password (min 6 characters)'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByText('Create Account'));

    // Wait for the success message
    await waitFor(() => {
      expect(screen.getByText('Admin account created successfully. You can now log in.')).toBeInTheDocument();
    });

    // Check if axios was called with the correct data
    expect(axios.post).toHaveBeenCalledWith('/api/admin/register', {
      fullName: 'Test User',
      email: 'test@example.com',
      location: 'Test Location',
      password: 'password123',
      confirmPassword: 'password123',
    });
  });

  test('should show an error if passwords do not match', async () => {
    render(<AdminAuth onAuthSuccess={() => {}} />);

    // Switch to register mode
    fireEvent.click(screen.getByText('Create New Account'));

    // Fill out the registration form with mismatched passwords
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your location'), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByPlaceholderText('Create a password (min 6 characters)'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password456' } });

    // Submit the form
    fireEvent.click(screen.getByText('Create Account'));

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('should show an error if a required field is missing', async () => {
    const mockErrorResponse = { response: { data: { error: 'All fields are required' } } };
    axios.post.mockRejectedValue(mockErrorResponse);

    render(<AdminAuth onAuthSuccess={() => {}} />);

    // Switch to register mode
    fireEvent.click(screen.getByText('Create New Account'));

    // Fill out the registration form with a missing field
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your location'), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByPlaceholderText('Create a password (min 6 characters)'), { target: { value: 'password123' } });
    // confirmPassword is intentionally left empty

    // Submit the form
    fireEvent.click(screen.getByText('Create Account'));

    // Wait for the error message
    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/admin/register', {
            fullName: 'Test User',
            email: 'test@example.com',
            location: 'Test Location',
            password: 'password123',
            confirmPassword: '',
        });
    });
  });
});
