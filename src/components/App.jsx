import React, { useState, useMemo, StrictMode, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import VideoCard from './auth/VideoCard';

import axios from 'axios';
import Layout from './Display';
import KenyaMap from './KenyaMap';
import AdminDashboard from '../admin/AdminDashboard';
import AdminAuth from '../admin/AdminAuth';
import BookingDetailsPage from '../pages/BookingDetailsPage';
import PaymentPage from '../pages/PaymentPage';
import SuccessPage from '../pages/SuccessPage';
import AdvancedFilters from './AdvancedFilters';
import SortOptions from './SortOptions';
import HeroSection from './HeroSection';
import Testimonials from './Testimonials';
import WishlistButton from './WishlistButton';
import { WishlistProvider, useWishlist } from './WishlistContext';
import WishlistPage from './WishlistPage';
import NewsletterSignup from './NewsletterSignup';

// Default backend API base URL (change via env var in production if needed)
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// --- Placeholder Icons ---
const MapPin = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12m-3 0a3 3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path><path d="M12 12v9"></path><path d="M10.5 4h3a9 9 0 0 1 9 9v3l-2 2"></path><path d="M12 12l-2 2"></path><path d="M12 3c-3 0-6 3-6 7s6 11 6 11s6-7 6-11c0-4-3-7-6-7z"></path></svg>;
const Search = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

// --- Mock Data ---
const CURRENCY = 'KES';

// --- Components ---

const Header = ({ searchQuery, setSearchQuery, onAdminClick }) => {
  const navigate = useNavigate();
  const { wishlist } = useWishlist();

  return (
    <div className="p-4 sm:p-6 bg-white shadow-lg sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <img
                src="/kenya.svg"
                alt="Kenya House Logo"
                className="h-12 w-auto cursor-pointer"
                onClick={() => navigate('/')}
            />
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Search by location (e.g., Tsavo)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-inner"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/wishlist')}
                        className="relative p-2 text-gray-600 hover:text-red-500 transition duration-200"
                        aria-label="View wishlist"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {wishlist.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {wishlist.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={onAdminClick}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                        Admin
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
const HouseCard = ({ house, onSelect }) => {
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

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative group"
            onClick={() => onSelect(house)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onSelect(house);
                }
            }}
            role="button"
            tabIndex="0"
        >
            <div className="absolute top-3 right-3 z-10">
                <WishlistButton house={house} className="bg-white bg-opacity-80 backdrop-blur-sm" />
            </div>
            <img
                src={getImageURL(house.imageUrl)}
                alt={house.name}
                className="w-full h-32 object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/D1D5DB/1F2937?text=Image+Unavailable"; }}
            />
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{house.name}</h3>
                <p className="flex items-center text-gray-500 mb-3 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                    {house.location}
                </p>
                <p className="text-gray-600 text-sm mb-4 truncate">{house.description}</p>
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
    );
};

const ListingView = ({ houses, onSelect, searchQuery, filters, onFiltersChange, sortBy, onSortChange, onClearFilters }) => {
    
    const filteredAndSortedHouses = useMemo(() => {
        let filtered = houses;

        // Text search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(house => 
                house.location.toLowerCase().includes(query) || 
                house.name.toLowerCase().includes(query) ||
                house.description.toLowerCase().includes(query)
            );
        }

        // Advanced filters
        if (filters.minPrice) {
            filtered = filtered.filter(house => house.price >= filters.minPrice);
        }
        if (filters.maxPrice) {
            filtered = filtered.filter(house => house.price <= filters.maxPrice);
        }
        if (filters.bedrooms) {
            filtered = filtered.filter(house => house.beds >= filters.bedrooms);
        }
        if (filters.bathrooms) {
            filtered = filtered.filter(house => house.baths >= filters.bathrooms);
        }
        if (filters.location) {
            filtered = filtered.filter(house => house.location.toLowerCase().includes(filters.location.toLowerCase()));
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'location':
                    return a.location.localeCompare(b.location);
                case 'beds':
                    return b.beds - a.beds;
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        return filtered;
    }, [houses, searchQuery, filters, sortBy]);

    return (<>
        <main className="max-w-7xl mx-auto p-4 sm:p-6 pb-20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    {searchQuery || Object.keys(filters).some(key => filters[key]) ? 
                        `Found ${filteredAndSortedHouses.length} propert${filteredAndSortedHouses.length !== 1 ? 'ies' : 'y'}` : 
                        "Featured Properties"}
                </h2>
                <SortOptions sortBy={sortBy} onSortChange={onSortChange} />
            </div>
            
            <AdvancedFilters 
                filters={filters} 
                onFiltersChange={onFiltersChange} 
                onClearFilters={onClearFilters} 
            />
            
            {filteredAndSortedHouses.length === 0 ? (
                <div className="text-center p-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner">
                    <div className="mb-6">
                        <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search criteria or filters</p>
                    <button
                        onClick={onClearFilters}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                    >
                        Clear All Filters
                    </button>
                </div>
                
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredAndSortedHouses.map(house => (
                        <HouseCard key={house.id} house={house} onSelect={onSelect} />
                    ))}
                </div>
            )}
        </main>
        </>
    );
};

const HouseDetailView = ({ houses, setSelectedHouse, selectedNights, setSelectedNights }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const house = houses.find(h => h.id === parseInt(id));

    useEffect(() => {
        if (house) {
            setSelectedHouse(house);
        }
    }, [house, setSelectedHouse]);

    if (!house) {
        return <div>House not found</div>;
    }

    const totalCost = house.price * selectedNights;
    const fee = totalCost * 0.05; // 5% service fee
    const finalTotal = totalCost + fee;

    const getImageURL = (imageUrl) => {
        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
            return "https://placehold.co/1024x400/374151/F9FAFB?text=Detailed+Image+Unavailable";
        }
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        const path = imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;
        return encodeURI(path);
    };

    return (<>
        <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
            <button
                onClick={() => navigate('/')}
                className="text-indigo-600 hover:text-indigo-800 mb-6 font-semibold transition duration-150"
            >
                &larr; Back to houses
            </button>

            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <img
                    src={getImageURL(house.imageUrl)}
                    alt={house.name}
                    className="w-full h-80 object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/1024x400/374151/F9FAFB?text=Detailed+Image+Unavailable"; }}
                />

                <div className="p-6 sm:p-8">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-3">{house.name}</h2>
                    <p className="flex items-center text-lg text-gray-500 mb-6">
                        <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                        {house.location}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-lg text-gray-700 border-t pt-4">
                        <p><strong>Beds:</strong> {house.beds}</p>
                        <p><strong>Baths:</strong> {house.baths}</p>
                        <p><strong>Capacity:</strong> {house.beds * 2} Guests</p>
                        <p><strong>Description:</strong> {house.description}</p>
                    </div>

                    <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
                        <div className="mb-4">
                            <label htmlFor="nights" className="block text-sm font-medium text-gray-700 mb-2">
                                Number of Nights
                            </label>
                            <select
                                id="nights"
                                value={selectedNights}
                                onChange={(e) => setSelectedNights(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                                    <option key={num} value={num}>{num} night{num > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>

                        <h3 className="text-xl font-bold text-indigo-800 mb-4">Booking Summary ({selectedNights} Night{selectedNights > 1 ? 's' : ''})</h3>
                        <div className="space-y-2 text-gray-700">
                            <div className="flex justify-between">
                                <span>{house.price.toLocaleString()} x {selectedNights} night{selectedNights > 1 ? 's' : ''}</span>
                                <span>{CURRENCY} {totalCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>Service Fee (5%)</span>
                                <span>{CURRENCY} {fee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-extrabold text-indigo-600 pt-2">
                                <span>Total Payable</span>
                                <span>{CURRENCY} {finalTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/book')}
                        className="mt-8 w-full py-4 text-xl bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition duration-200 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-green-300"
                    >
                        Proceed to Booking & Payment
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

const HomePage = ({ houses, searchQuery, handleSelectHouse, filters, onFiltersChange, sortBy, onSortChange, onClearFilters }) => (
    <>
      <HeroSection />
      <Layout>
        <ListingView
            houses={houses}
            onSelect={handleSelectHouse}
            searchQuery={searchQuery}
            filters={filters}
            onFiltersChange={onFiltersChange}
            sortBy={sortBy}
            onSortChange={onSortChange}
            onClearFilters={onClearFilters}
        />
        <VideoCard />
        <Testimonials />
        <NewsletterSignup />
        <>
          <header className="header">
            <h1>KNOW MORE ABOUT US </h1>
          </header>
          <div className="text-division division-1">
            <h2>ABOUT US</h2>
            <p>
              We own several rental houses within Nairobi, Mombasa, Thika, and Kisumu. In areas where we don't have our own properties, we work with trusted landlords so
              you can rent confidently and conveniently.
            </p>
          </div>
          <div className="text-division division-2">
            <h2>OUR WORKING</h2>
            <p>
             Our platform connects tenants and property owners seamlessly, offering secure payments, real-time availability, and 24/7 support. Feel secure to find a place of your choice with us.
            </p>
          </div>
          <div className="text-division division-3">
            <h2>TERMS AND POLICY</h2>
            <ul>
                <li>Make payments to secure the bookings.</li>
                <li>In case the client does not show up for personal reasons, no refund of payments will be issued.</li>
                <li>If a client makes a payment but does not get the accommodation due to company issues, the money is fully refundable.</li>
                <li>If hosted, keep the company's property secure. In case of any loss of items, the person responsible will be held accountable.</li>
            </ul>
          </div>
          <div className="text-division division-4">
            <h2>OUR VISION</h2>
            <p>
              To be the leading and most trusted house and vacation rental booking platform in Kenya,
              providing seamless, secure, and memorable stays for every traveler.
            </p>
          </div>
        </>
        <KenyaMap houses={houses} />
      </Layout>
    </>
);

const AdminPage = ({ token, setToken }) => {
    const navigate = useNavigate();
    return (
        <>
            {token ? (
                <AdminDashboard
                  onLogout={() => {
                    setToken(null);
                    localStorage.removeItem('adminToken');
                    navigate('/');
                  }}
                />
            ) : (
                <AdminAuth onAuthSuccess={(token) => {
                    setToken(token);
                    localStorage.setItem('adminToken', token);
                    navigate('/admin');
                }} />
            )}
        </>
    );
}

const App = () => {
    const [houses, setHouses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [selectedNights, setSelectedNights] = useState(3);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [bookingReceipt, setBookingReceipt] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('adminToken'));
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('name');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        axios.get('/api/houses')
            .then(response => setHouses(response.data))
            .catch(error => {
                console.error('Error fetching houses:', error);
            });
    }, []);

    const handleSelectHouse = (house) => {
        setSelectedHouse(house);
        navigate(`/house/${house.id}`);
    };

    const handleBookingSuccess = (receipt) => {
        setBookingReceipt(receipt);
        navigate('/success');
    };

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearchQuery('');
    };

    const showHeader = !location.pathname.startsWith('/admin');

    const handleAdminClick = () => {
        navigate('/admin');
    };

    return (
        <StrictMode>
            <WishlistProvider>
                {showHeader && <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} onAdminClick={handleAdminClick} />}
                <Routes>
                    <Route path="/" element={<HomePage 
                        houses={houses} 
                        searchQuery={searchQuery} 
                        handleSelectHouse={handleSelectHouse}
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        sortBy={sortBy}
                        onSortChange={handleSortChange}
                        onClearFilters={handleClearFilters}
                    />} />
                    <Route path="/house/:id" element={<HouseDetailView houses={houses} setSelectedHouse={setSelectedHouse} selectedNights={selectedNights} setSelectedNights={setSelectedNights} />} />
                    <Route path="/book" element={<BookingDetailsPage 
                        house={selectedHouse}
                        selectedNights={selectedNights}
                        setSelectedNights={setSelectedNights}
                        onConfirm={(details) => {
                          setBookingDetails(details);
                          navigate('/payment');
                        }}
                        onBack={() => navigate(`/house/${selectedHouse.id}`)}
                      />} />
                    <Route path="/payment" element={<PaymentPage 
                        house={selectedHouse}
                        selectedNights={selectedNights}
                        bookingDetails={bookingDetails}
                        onPaymentSuccess={handleBookingSuccess}
                        onBack={() => navigate('/book')}
                      />} />
                    <Route path="/success" element={<SuccessPage
                        receipt={bookingReceipt}
                        onBackHome={() => {
                          setSelectedHouse(null);
                          setBookingReceipt(null);
                          setBookingDetails(null);
                          navigate('/');
                        }}
                      />} />
                    <Route path="/wishlist" element={<WishlistPage onSelectHouse={handleSelectHouse} />} />
                    <Route path="/admin" element={<AdminPage token={token} setToken={setToken} />} />
                </Routes>
            </WishlistProvider>
        </StrictMode>
    );
};

export default App;