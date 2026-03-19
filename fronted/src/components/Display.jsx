import React from 'react';
import './Layout.css'; // Import the CSS file

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="font-bold text-2xl text-gray-900">HouseKenya</span>
              </a>
            </div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-700 hover:text-indigo-600 font-medium transition duration-200">Home</a>
              <a href="/about" className="text-gray-700 hover:text-indigo-600 font-medium transition duration-200">About</a>
              <a href="/" className="text-gray-700 hover:text-indigo-600 font-medium transition duration-200">Listings</a>
              <a href="/wishlist" className="text-gray-700 hover:text-indigo-600 font-medium transition duration-200">Wishlist</a>
              <a href="#contact" className="text-gray-700 hover:text-indigo-600 font-medium transition duration-200">Contact</a>
              <a href="/admin/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition duration-200">Admin</a>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={toggleMenu} className="p-1 ml-1 mr-1 text-gray-500 rounded-lg hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <a href="/" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 font-medium">Home</a>
              <a href="/about" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 font-medium">About</a>
              <a href="/" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 font-medium">Listings</a>
              <a href="/wishlist" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 font-medium">Wishlist</a>
              <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 font-medium">Contact</a>
              <a href="/admin/login" className="block w-full text-center bg-indigo-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-indigo-700">Admin Login</a>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="footer bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="contact-info text-center mb-8">
            <h3 className="text-2xl font-bold mb-6">Contact Us</h3>
            <p className="mb-4">
              Email: <a href="mailto:contact@houseskenya.com" className="hover:text-indigo-400 transition">contact@houseskenya.com</a>
            </p>
            <p>
              Phone: <a href="https://wa.me/254742670824" className="hover:text-indigo-400 transition">(+254) 742670824</a>
            </p>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="copyright text-gray-400">&copy; {new Date().getFullYear()} HouseKenya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default Layout;