import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyHouses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  const fetchHouses = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await axios.get('/api/houses');
      setHouses(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load houses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const deleteHouse = async (id, name) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const authHeader = getAuthHeader();
      if (!authHeader) return;

      await axios.delete(`/api/houses/${id}`, { headers: authHeader });
      
      setHouses(houses.filter(h => h.id !== id));
      setSuccess(`House "${name}" has been deleted successfully.`);
      setDeleteConfirm(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete house.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id, name) => {
    setDeleteConfirm({ id, name });
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Houses</h2>
        <button
          onClick={fetchHouses}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-600">
          {success}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-4">Delete House?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={loading}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteHouse(deleteConfirm.id, deleteConfirm.name)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {houses.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-lg">No houses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map(house => (
            <div
              key={house.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              {/* House Image */}
              {house.imageUrl && (
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={house.imageUrl}
                    alt={house.name}
                    className="w-full h-full object-cover hover:scale-105 transition"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                </div>
              )}

              {/* House Details */}
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{house.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{house.location}</p>

                {house.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{house.description}</p>
                )}

                {/* House Features */}
                <div className="flex gap-4 mb-4 text-sm text-gray-700">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">🛏️ {house.beds}</span>
                    <span>Beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">🚿 {house.baths}</span>
                    <span>Baths</span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <p className="text-2xl font-bold text-indigo-600">
                    KES {house.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">per night</p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => confirmDelete(house.id, house.name)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition disabled:opacity-50"
                >
                  Delete House
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyHouses;
