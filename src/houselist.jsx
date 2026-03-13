import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HouseList = () => {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHouses = async () => {
            try {
                const response = await axios.get('/api/houses');
                setHouses(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch houses. Please try again later.');
                setLoading(false);
                console.error('Error fetching houses:', err);
            }
        };

        fetchHouses();
    }, []);

    const encodeImageURL = (image) => {
        if (!image || typeof image !== 'string' || image.trim() === '') {
            return 'https://via.placeholder.com/300';
        }

        // For static builds, serve images from the current domain
        if (!image.startsWith('http')) {
            // Remove any leading slash and serve from root
            const cleanPath = image.replace(/^\//, '');
            return `/${cleanPath}`;
        }
        return image;
    };

    if (loading) {
        return <div className="text-center p-8">Loading houses...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    if (houses.length === 0) {
        return <div className="text-center p-8">No houses available at the moment.</div>;
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