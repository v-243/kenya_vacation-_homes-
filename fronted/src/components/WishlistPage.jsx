import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from './WishlistContext';
import WishlistButton from './WishlistButton';

const WishlistPage = ({ onSelectHouse }) => {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const CURRENCY = 'KES';

  const getImageURL = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      return "https://placehold.co/600x400/D1D5DB/1F2937?text=Image+Unavailable";
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const path = imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;
    return encodeURI(path);
  };

  const handleHouseClick = (house) => {
    onSelectHouse(house);
    navigate(`/house/${house.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-150 mb-4"
          >
            &larr; Back to homes
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlist.length === 0 ? 'No saved properties yet' : `${wishlist.length} saved propert${wishlist.length === 1 ? 'y' : 'ies'}`}
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="w-24 h-24 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Start exploring and save your favorite properties!</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map(house => (
              <div
                key={house.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative group"
                onClick={() => handleHouseClick(house)}
              >
                <div className="absolute top-3 right-3 z-10">
                  <WishlistButton house={house} className="bg-white bg-opacity-80 backdrop-blur-sm" />
                </div>
                <img
                  src={getImageURL(house.imageUrl)}
                  alt={house.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/D1D5DB/1F2937?text=Image+Unavailable"; }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{house.name}</h3>
                  <p className="flex items-center text-gray-500 mb-3 text-sm">
                    <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {house.location}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{house.description}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-indigo-600">
                      {CURRENCY} {house.price.toLocaleString()}
                      <span className="text-sm font-normal text-gray-500"> / night</span>
                    </p>
                    <div className="flex space-x-2 text-gray-500 text-sm">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">{house.beds} Beds</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-full">{house.baths} Baths</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;