import React from 'react';
import { getCarDisplayName } from '../../lib/utils';

const HeroSection = ({ selectedCar }) => {
  const handleBookNowClick = () => {
    const bookNowElement = document.getElementById('bookNow');
    if (bookNowElement) {
      bookNowElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section id="home" className="relative h-screen flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%), url('https://images.unsplash.com/photo-1610099610040-ab19f3a5ec35?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          {/* Optional notification for selected car from opening */}
          {selectedCar && (
            <div className="mb-6 p-4 bg-gold-500/20 backdrop-blur-sm rounded-lg border border-gold-400/30 animate-fade-in">
              <p className="text-gold-400 text-lg">
                Excellent choice! Your <span className="font-semibold">{getCarDisplayName(selectedCar)}</span> is ready to be reserved.
              </p>
            </div>
          )}
          
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
            Arrive with Intention.<br />
            Travel in Elegance<br />
            <span className="text-gold-400">with Velaré.</span>
          </h1>
          
          <button
            onClick={handleBookNowClick}
            className="bg-gold-500 hover:bg-gold-600 text-black font-semibold px-8 py-3 rounded transition-all duration-300 transform hover:scale-105"
          >
            {selectedCar ? `Book Your ${getCarDisplayName(selectedCar)}` : 'Book Your Ride Now'}
          </button>
        </div>
      </div>

      {/* Demo section to show scrolling works */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce text-white opacity-70">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Example content to demonstrate scrolling */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      
      <style jsx>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;