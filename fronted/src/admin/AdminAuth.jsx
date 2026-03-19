import React, { useState } from 'react';
import axios from 'axios';

const AdminAuth = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    location: '',
    password: '',
    confirmPassword: '',
    resetToken: '',
    newPassword: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/admin/register', {
        fullName: form.fullName,
        email: form.email,
        location: form.location,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setMessage(res.data.message || 'Admin account created successfully. You can now log in.');
      setForm({
        fullName: '',
        email: '',
        location: '',
        password: '',
        confirmPassword: '',
        resetToken: '',
        newPassword: '',
      });
      setTimeout(() => setMode('login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    console.log('Login attempt started');
    try {
      console.log('Sending login request to /api/admin/login');
      const res = await axios.post('/api/admin/login', {
        email: form.email,
        password: form.password,
      });
      console.log('Login response:', res.data);
      setMessage('Login successful!');
      localStorage.setItem('adminToken', res.data.token);
      onAuthSuccess(res.data.token, res.data.admin);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
      console.log('Login attempt finished, loading reset');
    }
  };

  const handleForgot = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/forgot-password', {
        email: form.email,
      });
      setMessage(res.data.message || 'Reset token sent. Use it to create a new password.');
      setForm({ ...form, email: '' });
      setTimeout(() => setMode('reset'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/reset-password', {
        resetToken: form.resetToken,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setMessage(res.data.message || 'Password reset successfully. You can now log in.');
      setForm({
        fullName: '',
        email: '',
        location: '',
        password: '',
        confirmPassword: '',
        resetToken: '',
        newPassword: '',
      });
      setTimeout(() => setMode('login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {mode === 'login' && 'Admin Login'}
          {mode === 'register' && 'Create Admin Account'}
          {mode === 'forgot' && 'Forgot Password'}
          {mode === 'reset' && 'Reset Password'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="flex justify-between mt-4 text-sm">
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-800"
                onClick={() => setMode('register')}
                disabled={loading}
              >
                Create New Account
              </button>
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-800"
                onClick={() => setMode('forgot')}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location/City</label>
              <input
                name="location"
                type="text"
                placeholder="Enter your location"
                value={form.location}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <button
              type="button"
              className="w-full text-indigo-600 hover:text-indigo-800 mt-2 text-sm"
              onClick={() => setMode('login')}
              disabled={loading}
            >
              Already have an account? Login
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Processing...' : 'Request Reset Token'}
            </button>
            <button
              type="button"
              className="w-full text-indigo-600 hover:text-indigo-800 mt-2 text-sm"
              onClick={() => setMode('login')}
              disabled={loading}
            >
              Back to Login
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
              <input
                name="resetToken"
                type="text"
                placeholder="Enter the reset token from the previous step"
                value={form.resetToken}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                name="newPassword"
                type="password"
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              type="button"
              className="w-full text-indigo-600 hover:text-indigo-800 mt-2 text-sm"
              onClick={() => setMode('login')}
              disabled={loading}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminAuth;
