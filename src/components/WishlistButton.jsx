import React from 'react';
import { useWishlist } from './WishlistContext';

const WishlistButton = ({ house, className = "" }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(house.id);

  const handleClick = async (e) => {
    e.stopPropagation(); // Prevent triggering parent onClick
    if (isWishlisted) {
      removeFromWishlist(house.id);
    } else {
      try {
        // Call the API to record the like
        const response = await fetch(`/api/houses/${house.id}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          addToWishlist(house);
        } else {
          const data = await response.json();
          console.error('Failed to like house:', data.error);
          // Still add to local wishlist even if API fails
          addToWishlist(house);
        }
      } catch (error) {
        console.error('Error liking house:', error);
        // Still add to local wishlist even if API fails
        addToWishlist(house);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${className}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        className={`w-5 h-5 transition-colors duration-200 ${
          isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-400'
        }`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={isWishlisted ? 0 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};

export default WishlistButton;