import React from 'react';

const SortOptions = ({ sortBy, onSortChange }) => {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <span className="text-gray-700 font-medium">Sort by:</span>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
      >
        <option value="name">Name (A-Z)</option>
        <option value="price-low">Price (Low to High)</option>
        <option value="price-high">Price (High to Low)</option>
        <option value="location">Location</option>
        <option value="beds">Bedrooms</option>
      </select>
    </div>
  );
};

export default SortOptions;