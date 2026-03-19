import React, { useState } from 'react';

const BookingDetailsPage = ({ house, selectedNights, setSelectedNights, onConfirm, onBack }) => {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const CURRENCY = 'KES';

  const totalCost = house.price * selectedNights;
  const fee = Math.round(totalCost * 0.05);
  const finalTotal = totalCost + fee;

  const validateInputs = () => {
    if (!fullName.trim()) {
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
    setError('');
    return true;
  };

  const handleContinue = () => {
    if (!validateInputs()) return;
    onConfirm({ fullName, idNumber, phone, email });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 mb-6 font-semibold transition duration-150 flex items-center gap-2"
        >
          ← Back to house details
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* House Summary & Pricing */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{house.name}</h2>

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

            <div className="space-y-2 text-gray-800 mb-6">
              <p className="text-sm"><strong>Location:</strong> {house.location}</p>
              <p className="text-sm"><strong>Bedrooms:</strong> {house.beds}</p>
              <p className="text-sm"><strong>Bathrooms:</strong> {house.baths}</p>
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
                Cost ({selectedNights} Night{selectedNights > 1 ? 's' : ''})
              </h3>
              <div className="space-y-2 text-gray-700 text-sm">
                <div className="flex justify-between">
                  <span>{CURRENCY} {house.price.toLocaleString()} x {selectedNights}</span>
                  <span>{CURRENCY} {totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Service Fee (5%)</span>
                  <span>{CURRENCY} {fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-indigo-600 pt-2">
                  <span>Total</span>
                  <span>{CURRENCY} {finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Details</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* ID Number */}
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  ID Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="idNumber"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g., 12345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
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
                <p className="text-xs text-gray-500 mt-1">We'll use this to contact you about your booking</p>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
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
                <p className="text-xs text-gray-500 mt-1">Booking confirmation and receipt will be sent here</p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-800">
                  <strong>Next Step:</strong> After confirming your details, you'll proceed to the payment page where you can choose your preferred payment method.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  onClick={onBack}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContinue}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
