import React, { useState } from 'react';
import axios from 'axios';

const BookingPage = ({ house, selectedNights, setSelectedNights, onBookingSuccess, onBack }) => {
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const CURRENCY = 'KES';

  const totalCost = house.price * selectedNights;
  const fee = Math.round(totalCost * 0.05);
  const finalTotal = totalCost + fee;

  const validateInputs = () => {
    if (!name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!idNumber.trim()) {
      setError('ID number is required');
      return false;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (paymentMethod === 'mpesa' && !mpesaPhone.trim()) {
      setError('M-Pesa phone number is required');
      return false;
    }
    setError('');
    return true;
  };

  const handleBooking = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/bookings', {
        house_id: house.id,
        customer_name: name,
        customer_id_number: idNumber,
        customer_phone: phone,
        email,
        nights: selectedNights,
        total_cost: finalTotal,
        payment_method: paymentMethod,
        mpesa_phone: mpesaPhone,
      });

      onBookingSuccess(res.data.receipt);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 mb-6 font-semibold transition duration-150 flex items-center gap-2"
        >
          ← Back to home
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* House Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Details</h2>

            {/* House Image */}
            <img
              src={
                house.imageUrl?.startsWith('http')
                  ? house.imageUrl
                  : `/${house.imageUrl || 'placeholder.jpg'}`
              }
              alt={house.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
              onError={(e) => {
                e.target.src = 'https://placehold.co/400x300/D1D5DB/1F2937?text=Image+Unavailable';
              }}
            />

            <div className="space-y-3 text-gray-800 mb-6">
              <h3 className="text-xl font-semibold">{house.name}</h3>
              <p className="text-sm"><strong>Location:</strong> {house.location}</p>
              <p className="text-sm"><strong>Bedrooms:</strong> {house.beds}</p>
              <p className="text-sm"><strong>Bathrooms:</strong> {house.baths}</p>
              <p className="text-sm"><strong>Description:</strong> {house.description}</p>
            </div>

            {/* Nights Selector */}
            <div className="mb-6">
              <label htmlFor="nights" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Nights
              </label>
              <select
                id="nights"
                value={selectedNights}
                onChange={(e) => setSelectedNights(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} night{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Summary */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-indigo-800 mb-3">
                Booking Summary ({selectedNights} Night{selectedNights > 1 ? 's' : ''})
              </h3>
              <div className="space-y-2 text-gray-700 text-sm">
                <div className="flex justify-between">
                  <span>{CURRENCY} {house.price.toLocaleString()} x {selectedNights} night{selectedNights > 1 ? 's' : ''}</span>
                  <span>{CURRENCY} {totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Service Fee (5%)</span>
                  <span>{CURRENCY} {fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-indigo-600 pt-2">
                  <span>Total Payable</span>
                  <span>{CURRENCY} {finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Enter Your Details</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* ID Number */}
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  ID Number
                </label>
                <input
                  type="text"
                  id="idNumber"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="Enter your ID number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (for booking confirmation)
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., +254712345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email (to receive booking confirmation / receipt)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Credit Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              {/* M-Pesa Phone (conditional) */}
              {paymentMethod === 'mpesa' && (
                <div>
                  <label htmlFor="mpesaPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    M-Pesa Phone Number (for payment prompt)
                  </label>
                  <input
                    type="tel"
                    id="mpesaPhone"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="e.g., +254712345678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 mt-6"
              >
                {loading ? 'Processing...' : `Complete Booking (${CURRENCY} ${finalTotal.toLocaleString()})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
