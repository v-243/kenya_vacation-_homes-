import React, { useState, useEffect } from 'react';

const AdvertisementVideos = () => {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isStaticMode, setIsStaticMode] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      // For static builds, adjust paths since files are in root directory
      const adjustedVideos = (data.videos || []).map(url => {
        // Convert /uploads/filename.mp4 to /filename.mp4 for static serving
        return url.replace('/uploads/', '/');
      });
      setVideos(adjustedVideos);
      setIsStaticMode(false);
    } catch (err) {
      // Fallback for static builds - use known video files
      console.log('API not available, using static video list');
      const staticVideos = [
        '/uploads/file-1765293778332-417560287.mp4',
        '/uploads/file-1773416779744-989233161.mp4'
      ];
      setVideos(staticVideos);
      setIsStaticMode(true);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    // Validate file size (150MB limit)
    if (file.size > 150 * 1024 * 1024) {
      setError('File size must be less than 150MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('video', file);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setSuccess('Video uploaded successfully!');
        fetchVideos(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload video');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (videoUrl) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      // Extract filename from URL
      const filename = videoUrl.split('/').pop();
      const response = await fetch(`/api/videos/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Video deleted successfully!');
        fetchVideos(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete video');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete video. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Advertisement Videos</h2>

        {/* Upload Section - Hide in static mode */}
        {!isStaticMode && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Video
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {uploading && (
              <p className="mt-2 text-sm text-gray-600">Uploading video...</p>
            )}
          </div>
        )}

        {/* Static mode notice */}
        {isStaticMode && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            <strong>Static Mode:</strong> Video management is disabled. Upload videos through the admin panel when the backend is running.
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Videos List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Videos ({videos.length})</h3>
          {videos.length === 0 ? (
            <p className="text-gray-500">No videos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((videoUrl, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Video {index + 1}
                    </span>
                    {!isStaticMode && (
                      <button
                        onClick={() => handleDeleteVideo(videoUrl)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold text-blue-800">How it works:</h4>
          <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
            <li>Upload video files (MP4, AVI, MOV, etc.) up to 150MB</li>
            <li>Videos are displayed sequentially in the frontend video card</li>
            <li>Each video plays automatically when the previous one ends</li>
            <li>Delete videos you no longer need</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementVideos;
