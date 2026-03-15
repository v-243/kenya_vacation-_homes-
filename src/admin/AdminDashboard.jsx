import React, { useState } from 'react';
import AdminBookings from './Bookings';
import AddHousePage from './AddHousePage';
import MyHouses from './MyHouses';
import AdminStats from './AdminStats';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('bookings');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={onLogout}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-150 ${
                activeTab === 'bookings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('my-houses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-150 ${
                activeTab === 'my-houses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              My Houses
            </button>
            <button
              onClick={() => setActiveTab('add-house')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-150 ${
                activeTab === 'add-house'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Add House
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-150 ${
                activeTab === 'stats'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Stats
            </button>
            <button
              onClick={() => setActiveTab('advertisement-videos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-150 ${
                activeTab === 'advertisement-videos'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Advertisement Videos
            </button>
          </div>
      </div>
    </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'bookings' && <AdminBookings />}
        {activeTab === 'my-houses' && <MyHouses />}
        {activeTab === 'add-house' && (
          <AddHousePage 
            onHouseAdded={() => {
              // Optionally refresh or show success
            }}
            onBack={() => setActiveTab('bookings')}
          />
        )}
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'advertisement-videos' && <AdvertisementVideos />}
      </div>
    </div>
  );
};

export default AdminDashboard;
