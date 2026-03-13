import React from 'react';
import './Layout.css'; // Import the CSS file

const Layout = ({ children }) => {
  return (
   <div className="layout-container">
      {/* Main Content Divisions */}
      <main className="content-area">
        {children}
      </main>

      {/* Footer Section with Contact Info */}
      <footer className="footer">
        <div className="contact-info">
          <h3>Contact Us</h3>
          <p>
            Email: <a href="mailto:contact@houseskenya.com">contact@houseskenya.com</a>
          </p>
          <p>Phone:<a href="https://wa.me/254742670824">(+254) 742670824 </a></p>
        </div>
        <p className="copyright">&copy; {new Date().getFullYear()} My Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;