import React from 'react';

const SuccessPage = ({ receipt, onBackHome }) => {
  console.log('SuccessPage received receipt:', receipt);

  if (!receipt) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Booking Receipt Found</h1>
          <p className="text-gray-600 mb-6">It looks like you've landed on the success page without completing a booking. Please return to the homepage to start a new booking.</p>
          <button
            onClick={onBackHome}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <svg className="w-16 h-16 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">Your booking has been successfully created. Check your email for confirmation.</p>
        </div>

        {/* Receipt */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="space-y-2 text-sm text-gray-800">
            <div><strong>Receipt — {receipt.bookingId}</strong></div>
            <div><strong>House:</strong> {receipt.houseName}</div>
            <div><strong>Location:</strong> {receipt.location}</div>
            <div><strong>Nights:</strong> {receipt.nights}</div>
            <div><strong>Amount:</strong> KES {(receipt.total_cost || 0).toFixed(2)}</div>
            <div><strong>Name:</strong> {receipt.customerName}</div>
            <div><strong>ID Number:</strong> {receipt.customerIdNumber}</div>
            <div><strong>Phone:</strong> {receipt.customerPhone}</div>
            <div><strong>Method:</strong> {receipt.paymentMethod}</div>
            <div><strong>Email:</strong> {receipt.email || 'N/A'}</div>
            <div><strong>Created:</strong> {(() => {
              try {
                const date = new Date(receipt.createdAt);
                return isNaN(date.getTime()) ? 'Date not available' : date.toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                });
              } catch (e) {
                return 'Date not available';
              }
            })()}</div>
            <div><strong>Checked Out:</strong> {receipt.checkedOut ? '✓ Yes' : '✗ No'}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition duration-200"
          >
            Print Receipt
          </button>
          <button
            onClick={onBackHome}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
