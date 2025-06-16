import React, { useState, useEffect } from 'react';

const CarCarousel = ({ onNext }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const cars = [
    { type: 'sedan', name: 'Luxury Sedan', icon: '🚗' },
    { type: 'suv', name: 'Premium SUV', icon: '🚙' },
    { type: 'limo', name: 'Executive Limousine', icon: '🚐' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % cars.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [cars.length]);

  const handleCarSelect = (index, type) => {
    setSelectedIndex(index);
    setTimeout(() => onNext && onNext(type), 1000);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-radial-gradient from-gray-900 to-black">
      <div className="relative w-full max-w-4xl h-96">
        {cars.map((car, index) => {
          const isActive = index === selectedIndex;
          const isLeft = index === (selectedIndex - 1 + cars.length) % cars.length;
          const isRight = index === (selectedIndex + 1) % cars.length;
          
          let position = 'opacity-0 scale-50';
          if (isActive) position = 'transform translate-x-0 scale-110 z-30 opacity-100';
          else if (isLeft) position = 'transform -translate-x-40 scale-80 z-10 opacity-60';
          else if (isRight) position = 'transform translate-x-40 scale-80 z-10 opacity-60';

          return (
            <div
              key={car.type}
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-48 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-500 border-2 ${isActive ? 'border-yellow-500' : 'border-gray-600'} ${position}`}
              onClick={() => handleCarSelect(index, car.type)}
            >
              <div className="text-4xl mb-3">{car.icon}</div>
              <div className="text-lg font-light">{car.name}</div>
            </div>
          );
        })}
      </div>
      
      <button 
        onClick={() => onNext()}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors"
      >
        Continue
      </button>
    </div>
  );
};

export default CarCarousel;