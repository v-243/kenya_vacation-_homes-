import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1); // eslint-disable-line no-unused-vars
  const [limit] = useState(20);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  const fetchBookings = async (p = 1) => {
    try {
      setLoading(true);
      const authHeader = getAuthHeader();
      if (!authHeader) return;

      const res = await axios.get(`/api/bookings?page=${p}&limit=${limit}`, { headers: authHeader });
      setBookings(res.data.bookings);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const viewReceipt = async (id) => {
    try {
      setLoading(true);
      const authHeader = getAuthHeader();
      if (!authHeader) return;

      const res = await axios.get(`/api/bookings/${id}`, { headers: authHeader });
      setSelected(res.data.receipt);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load receipt.');
    } finally {
      setLoading(false);
    }
  };

  const checkoutBooking = async (id) => {
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) return;

      await axios.put(`/api/bookings/${id}/checkout`, {}, { headers: authHeader });
      // Refresh bookings list after checkout
      await fetchBookings(page);
      setSelected(null);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to checkout booking.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Admin — Bookings</h2>
      {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <button
            onClick={() => fetchBookings(1)}
            disabled={loading}
            className="mb-4 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <div className="space-y-2">
            {bookings.length === 0 ? (
              <p className="text-gray-500">No bookings found.</p>
            ) : (
              bookings.map(b => (
                <div key={b.bookingId} className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{b.houseName || 'Unknown'}</div>
                      <div className="text-sm text-gray-600">{b.location}</div>
                      <div className="text-sm">{b.customerPhone}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">KES {parseFloat(b.amountPaid).toFixed(2)}</div>
                      <button
                        onClick={() => viewReceipt(b.bookingId)}
                        disabled={loading}
                        className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          {selected ? (
            <div className="p-4 border rounded bg-white">
              <div className="space-y-1 text-sm text-gray-800">
                <div><strong>Receipt — {selected.bookingId}</strong></div>
                <div><strong>House:</strong> {selected.houseName}</div>
                <div><strong>Location:</strong> {selected.location}</div>
                <div><strong>Nights:</strong> {selected.nights}</div>
                <div><strong>Amount:</strong> KES {parseFloat(selected.amountPaid).toFixed(2)}</div>
                <div><strong>Name:</strong> {selected.customerName}</div>
                <div><strong>ID Number:</strong> {selected.customerIdNumber}</div>
                <div><strong>Phone:</strong> {selected.customerPhone}</div>
                <div><strong>Method:</strong> {selected.paymentMethod}</div>
                <div><strong>Email:</strong> {selected.email || 'N/A'}</div>
                <div><strong>Created:</strong> {new Date(selected.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })}</div>
                <div><strong>Checked Out:</strong> {selected.checkedOut ? '✓ Yes' : '✗ No'}</div>
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => window.print()} 
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Print Receipt
                </button>
                {!selected.checkedOut && (
                  <button 
                    onClick={() => checkoutBooking(selected.bookingId)}
                    disabled={loading}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Checkout Guest'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-gray-600">Select a booking to view receipt</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
