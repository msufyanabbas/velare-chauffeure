import React from 'react';
import Header from './Header';
import Footer from './Footer';

// Main Layout Component
const Layout = ({ children, showOpening = false }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      {!showOpening && <Header />}
      {children}
      {!showOpening && <Footer />}
    </div>
  );
};

export default Layout;