import React from 'react';

const HouseList = ({ houses }) => {
    const encodeImageURL = (image) => {
        if (!image || typeof image !== 'string' || image.trim() === '') {
            return 'https://via.placeholder.com/300';
        }

        if (!image.startsWith('http')) {
            const cleanPath = image.replace(/^\//, '');
            return `/${cleanPath}`;
        }
        return image;
    };

    if (!houses || houses.length === 0) {
        return <div className="text-center p-8">No houses match your search.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-8">
            {houses.map((house) => (
                <div key={house.id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                        src={encodeImageURL(house.imageUrl)} 
                        alt={house.name} 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src='https://via.placeholder.com/300';
                        }}
                    />
                    <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{house.name}</h3>
                        <p className="text-gray-700 text-base mb-2">{house.location}</p>
                        <p className="text-gray-900 font-semibold text-xl">KES {house.price.toLocaleString()}</p>
                        <p className="text-gray-600 text-sm mt-2">{house.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HouseList;