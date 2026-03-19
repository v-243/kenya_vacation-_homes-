import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('houseWishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('houseWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (house) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === house.id)) {
        return prev; // Already in wishlist
      }
      return [...prev, house];
    });
  };

  const removeFromWishlist = (houseId) => {
    setWishlist(prev => prev.filter(item => item.id !== houseId));
  };

  const isInWishlist = (houseId) => {
    return wishlist.some(item => item.id === houseId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};