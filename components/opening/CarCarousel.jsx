import React, { useState, useEffect } from 'react';
import { Car, Crown, Truck, Users, Bus } from 'lucide-react';

const CarCarousel = ({ onNext }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const cars = [
    {
      type: 'luxury_sedan',
      name: 'Luxury Sedans',
      icon: Car,
      description: 'Comfortable and elegant for business trips',
      capacity: '1-3 passengers',
    },
    {
      type: 'premium_luxury_sedan',
      name: 'Premium Luxury Sedans',
      icon: Crown,
      description: 'Ultimate luxury for special occasions',
      capacity: '1-3 passengers',
    },
    {
      type: 'suv',
      name: 'SUV',
      icon: Car,
      description: 'Spacious and luxurious for family travels',
      capacity: '1-3 passengers',
    },
    {
      type: '7_seater',
      name: '7 seater',
      icon: Users,
      description: 'Ideal for medium groups',
      capacity: '5-7 passengers',
    },
    {
      type: 'people_mover_11_seater',
      name: 'People mover 11 seater',
      icon: Bus,
      description: 'Perfect for group transportation',
      capacity: '8-11 passengers',
    },
  ];

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-rotation (slower on mobile)
  useEffect(() => {
    if (hoveredIndex !== null) return;

    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % cars.length);
    }, isMobile ? 5000 : 4000);

    return () => clearInterval(interval);
  }, [hoveredIndex, isMobile]);

  const handleCarClick = (index, car) => {
    setSelectedIndex(index);
    setSelectedCar(car);

    if (onNext) {
      onNext(car.type);
    }

    // Auto-advance after selection
    setTimeout(() => {
      if (onNext) {
        onNext(car.type);
      }
    }, 1000);
  };

  const handleMouseEnter = (index) => {
    if (!isMobile) {
      setHoveredIndex(index);
      setSelectedIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHoveredIndex(null);
    }
  };

  const handleTouchStart = (index) => {
    if (isMobile) {
      setSelectedIndex(index);
    }
  };

  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;

  // Navigation functions for mobile
  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + cars.length) % cars.length);
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev + 1) % cars.length);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-2 sm:p-4">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-12 px-4">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">
          Choose Your <span className="text-yellow-500">Premium</span> Ride
        </h1>
        <p className="text-gray-300 text-sm sm:text-lg">Select the perfect vehicle for your journey</p>
      </div>

      {/* Mobile Navigation Arrows */}
      {isMobile && (
        <>
          <button
            onClick={goToPrevious}
            className="fixed left-2 top-1/2 transform -translate-y-1/2 z-40 bg-black bg-opacity-60 text-white p-3 rounded-full backdrop-blur-md hover:bg-opacity-80 transition-all"
            aria-label="Previous car"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="fixed right-2 top-1/2 transform -translate-y-1/2 z-40 bg-black bg-opacity-60 text-white p-3 rounded-full backdrop-blur-md hover:bg-opacity-80 transition-all"
            aria-label="Next car"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Car Carousel */}
      <div className={`relative w-full ${isMobile ? 'max-w-sm h-64' : 'max-w-6xl h-80'} mb-4 sm:mb-8`}>
        <div className="absolute inset-0 flex items-center justify-center">
          {cars.map((car, index) => {
            const isActive = index === activeIndex;
            const isSelected = selectedCar?.type === car.type;

            let translateX = 0;
            let scale = 1;
            let opacity = 1;
            let zIndex = 10;

            if (isMobile) {
              // Mobile: Only show active card centered
              if (isActive) {
                translateX = 0;
                scale = 1;
                opacity = 1;
                zIndex = 30;
              } else {
                // Hide non-active cards on mobile
                opacity = 0;
                scale = 0.8;
                zIndex = 1;
              }
            } else {
              // Desktop: Carousel layout
              const offset = index - activeIndex;
              const normalizedOffset =
                offset > cars.length / 2
                  ? offset - cars.length
                  : offset < -cars.length / 2
                  ? offset + cars.length
                  : offset;

              translateX = normalizedOffset * 200;
              scale = isActive ? 1.1 : Math.max(0.7, 1 - Math.abs(normalizedOffset) * 0.15);
              opacity = isActive ? 1 : Math.max(0.3, 1 - Math.abs(index - activeIndex) * 0.25);
              zIndex = isActive ? 30 : 20 - Math.abs(index - activeIndex);
            }

            const IconComponent = car.icon;

            return (
              <div
                key={car.type}
                className={`absolute ${
                  isMobile ? 'w-full h-full max-w-xs' : 'w-80 h-64'
                } bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-700 ease-in-out border-2 sm:border-3 shadow-2xl hover:shadow-yellow-500/20 ${
                  isSelected
                    ? 'border-green-500 ring-2 sm:ring-4 ring-green-500/30'
                    : isActive
                    ? 'border-yellow-500 ring-1 sm:ring-2 ring-yellow-500/30'
                    : 'border-gray-600'
                }`}
                onClick={() => handleCarClick(index, car)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onTouchStart={() => handleTouchStart(index)}
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  opacity,
                  zIndex,
                }}
              >
                {isSelected && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold animate-pulse">
                    ✓
                  </div>
                )}

                <div className="text-4xl sm:text-6xl mb-2 sm:mb-4 transform transition-transform duration-300 hover:scale-110">
                  <IconComponent size={isMobile ? 48 : 64} className="text-yellow-500" />
                </div>

                <div className="text-center px-3 sm:px-4">
                  <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 leading-tight">
                    {car.name}
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm mb-1 sm:mb-2 leading-tight">
                    {car.description}
                  </p>
                  <div className="flex items-center justify-center text-yellow-400 text-xs">
                    <span className="mr-1">👥</span>
                    <span>{car.capacity}</span>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent rounded-2xl sm:rounded-3xl transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex space-x-2 sm:space-x-3 mb-6 sm:mb-8">
        {cars.map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'bg-yellow-500 scale-125' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            aria-label={`Select car ${index + 1}`}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:gap-4 items-center w-full max-w-sm sm:max-w-none px-4">
        <button
          onClick={() => onNext && onNext()}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/25"
        >
          Continue Manually
        </button>

        {selectedCar && (
          <button
            onClick={() => {
              setSelectedCar(null);
              if (onNext) onNext(null);
            }}
            className="px-4 sm:px-6 py-2 text-gray-400 hover:text-white transition-colors duration-300 underline text-sm sm:text-base"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-gray-500 text-xs sm:text-sm mt-4 sm:mt-8 max-w-xs sm:max-w-md px-4">
        <p>
          {isMobile 
            ? 'Tap car to select • Use arrows or dots to browse'
            : 'Click any car to select and auto-advance • Hover to preview • Use dots to browse'
          }
        </p>
      </div>

      {/* Mobile swipe indicator */}
      {isMobile && (
        <div className="flex items-center justify-center mt-2 text-gray-600 text-xs">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          <span>Swipe or use arrows</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default CarCarousel;