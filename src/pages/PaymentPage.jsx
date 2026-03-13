import React, { useState } from 'react';
import axios from 'axios';

const PaymentPage = ({ house, selectedNights, bookingDetails, onPaymentSuccess, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const CURRENCY = 'KES';

  if (!house || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-8 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">
          {!house ? 'Loading payment details...' : 'Missing booking details. Please go back and fill in your information.'}
        </div>
      </div>
    );
  }

  const totalCost = house.price * selectedNights;
  const fee = Math.round(totalCost * 0.05);
  const finalTotal = totalCost + fee;

  const validatePaymentInputs = () => {
    if (paymentMethod === 'mpesa' && !mpesaPhone.trim()) {
      setError('M-Pesa phone number is required');
      return false;
    }
    if (paymentMethod === 'card' && (!cardNumber.trim() || !cardExpiry.trim() || !cardCVC.trim())) {
      setError('All card details are required');
      return false;
    }
    if (paymentMethod === 'bank' && !bankAccount.trim()) {
      setError('Bank account details are required');
      return false;
    }
    setError('');
    return true;
  };

  const handlePayment = async () => {
    if (!validatePaymentInputs()) return;

    console.log('Booking details:', bookingDetails);
    console.log('House:', house);
    console.log('Payment method:', paymentMethod);

    setLoading(true);
    try {
      console.log(`[Payment] Initiating ${paymentMethod} payment for house ${house.id}`);
      const res = await axios.post('/api/bookings', {
        house_id: house.id,
        customer_name: bookingDetails.fullName,
        customer_id_number: bookingDetails.idNumber,
        customer_phone: paymentMethod === 'mpesa' ? mpesaPhone : bookingDetails.phone,
        email: bookingDetails.email,
        nights: selectedNights,
        total_cost: finalTotal,
        payment_method: paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod,
      });

      console.log(`[Payment] Success:`, res.data);
      onPaymentSuccess(res.data.receipt || res.data);
    } catch (err) {
      console.error('[Payment] Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Payment failed. Please try again.';
      console.error('[Payment] Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 mb-6 font-semibold transition duration-150 flex items-center gap-2"
        >
          ← Back to booking details
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

            {/* House Info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">{house.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span>{house.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span>{selectedNights}</span>
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-medium text-gray-900">{bookingDetails.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>ID Number:</span>
                  <span className="font-medium text-gray-900">{bookingDetails.idNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="font-medium text-gray-900">{bookingDetails.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-medium text-gray-900">{bookingDetails.email}</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Amount Due</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{CURRENCY} {house.price.toLocaleString()} x {selectedNights} night{selectedNights > 1 ? 's' : ''}</span>
                  <span>{CURRENCY} {totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 pb-2 border-b">
                  <span>Service Fee (5%)</span>
                  <span>{CURRENCY} {fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-green-600 pt-2">
                  <span>Total</span>
                  <span>{CURRENCY} {finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Payment Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition" style={{ borderColor: paymentMethod === 'mpesa' ? '#4f46e5' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      value="mpesa"
                      checked={paymentMethod === 'mpesa'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 font-medium text-gray-900">M-Pesa</span>
                  </label>

                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition" style={{ borderColor: paymentMethod === 'card' ? '#4f46e5' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 font-medium text-gray-900">Credit / Debit Card</span>
                  </label>

                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition" style={{ borderColor: paymentMethod === 'bank' ? '#4f46e5' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 font-medium text-gray-900">Bank Transfer</span>
                  </label>
                </div>
              </div>

              {/* M-Pesa Payment */}
              {paymentMethod === 'mpesa' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">M-Pesa Payment</h3>
                  <div>
                    <label htmlFor="mpesaPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="mpesaPhone"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="e.g., +254712345678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      You'll receive an M-Pesa prompt on this number to complete the payment.
                    </p>
                  </div>
                </div>
              )}

              {/* Card Payment */}
              {paymentMethod === 'card' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Card Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))}
                        placeholder="1234 5678 9012 3456"
                        maxLength="16"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="cardExpiry"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="cardCVC" className="block text-sm font-medium text-gray-700 mb-1">
                          CVC <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="cardCVC"
                          value={cardCVC}
                          onChange={(e) => setCardCVC(e.target.value.slice(0, 4))}
                          placeholder="123"
                          maxLength="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer */}
              {paymentMethod === 'bank' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Bank Details</h3>
                  <div>
                    <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="bankAccount"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="Enter your bank account details"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      We'll send bank transfer details to your email.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  onClick={onBack}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {loading ? 'Processing...' : `Pay ${CURRENCY} ${finalTotal.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
