import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Layout from './Display';
import AdminDashboard from '../admin/AdminDashboard';
import AdminAuth from '../admin/AdminAuth';
import HouseList from '../houselist';
import HeroSection from './HeroSection';
import KenyaMap from './KenyaMap';
import Testimonials from './Testimonials';
import NewsletterSignup from './NewsletterSignup';
import AboutUs from './AboutUs';
import { WishlistProvider } from './WishlistContext';
import BookingPage from '../pages/BookingPage';
import WishlistPage from './WishlistPage';
import PaymentPage from '../pages/PaymentPage';
import SuccessPage from '../pages/SuccessPage';
import Search from './Search';
import AdvancedFilters from './AdvancedFilters';
import SortOptions from './SortOptions';

const Home = ({ houses }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({});

  const filteredHouses = houses.filter((house) => {
    if (filters.location && house.location !== filters.location) return false;
    if (filters.bedrooms && house.bedrooms < filters.bedrooms) return false;
    if (filters.bathrooms && house.bathrooms < filters.bathrooms) return false;
    if (filters.minPrice && house.price < filters.minPrice) return false;
    if (filters.maxPrice && house.price > filters.maxPrice) return false;
    return true;
  });

  const handleFiltersChange = (newFilters) => setFilters(newFilters);
  const handleClearFilters = () => setFilters({});

  return (
    <div>
      <HeroSection />
      <AboutUs />
      <KenyaMap houses={houses} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Search />
        </div>
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          {showAdvanced ? 'Hide' : 'Advanced Filters'}
        </button>
        {showAdvanced && (
          <AdvancedFilters 
            filters={filters} 
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters} 
          />
        )}
        <SortOptions sortBy="" onSortChange={() => {}} />
        <HouseList houses={filteredHouses} />
      </div>
      <Testimonials />
      <NewsletterSignup />
    </div>
  );
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
};

const AppContent = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const url = searchQuery ? `/api/houses?search=${encodeURIComponent(searchQuery)}` : '/api/houses';
        const response = await axios.get(url);
        setHouses(response.data);
      } catch (error) {
        console.error('Failed to fetch houses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHouses();
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home houses={houses} />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        <Route path="/success/:id" element={<SuccessPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminDashboard onLogout={handleLogout} />
          </AdminRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <WishlistProvider>
    <AppContent />
  </WishlistProvider>
);

export default App;
