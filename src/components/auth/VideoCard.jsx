import React, { useState, useEffect } from 'react';

/**
 * A component for displaying a single advertisement video.
 * It fetches the list of available videos and cycles through them automatically.
 * The styling is done using Tailwind CSS to match the admin portal's video cards.
 *
 * @returns {JSX.Element} The video card component.
 */
const VideoCard = () => {
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch('/api/videos');
                const data = await response.json();
                setVideos(data.videos || []);
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };

        fetchVideos();
    }, []);

    const handleVideoEnded = () => {
        if (videos.length > 1) {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
        }
        // If only 1 video, it will loop automatically due to the loop attribute
    };

    if (videos.length === 0) {
        return (
            <div className="border rounded-lg p-4 text-center">
                <p className="text-gray-500">No advertisement videos available.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg">
            <video
                src={videos[currentIndex]}
                autoPlay
                muted
                loop={videos.length === 1}
                playsInline
                onEnded={handleVideoEnded}
                className="w-full h-[60vh] object-cover rounded mb-2"
                // Adding a key to re-mount the component when the video src changes
                // This is important for the `onEnded` event to be reliably triggered
                key={videos[currentIndex]}
            />
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                    Advertisement
                </span>
            </div>
        </div>
    );
};

export default VideoCard;