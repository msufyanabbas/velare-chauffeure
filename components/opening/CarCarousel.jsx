import React, { useState, useEffect } from 'react';

const CarCarousel = ({ onNext }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  
  const cars = [
    { 
      type: 'luxury_sedan', 
      name: 'Luxury Sedans', 
      icon: '🚗',
      description: 'Comfortable and elegant for business trips',
      capacity: '1-4 passengers'
    },
    { 
      type: 'suv', 
      name: 'SUV', 
      icon: '🚙',
      description: 'Spacious and luxurious for family travels',
      capacity: '1-6 passengers'
    },
    { 
      type: 'premium_luxury_sedan', 
      name: 'Premium Luxury Sedans', 
      icon: '🚐',
      description: 'Ultimate luxury for special occasions',
      capacity: '1-8 passengers'
    },
    {
      type: 'people_mover_11_seater',
      name: 'People mover 11 seater',
      icon: '🚌',
      description: 'Perfect for group transportation',
      capacity: '8-11 passengers'
    },
    {
      type: '7_seater',
      name: '7 seater',
      icon: '🚗',
      description: 'Ideal for medium groups',
      capacity: '5-7 passengers'
    }
  ];

  // Auto-rotation effect
  useEffect(() => {
    if (hoveredIndex !== null) return;
    
    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % cars.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [cars.length, hoveredIndex]);

  const handleCarClick = (index, car) => {
    setSelectedIndex(index);
    setSelectedCar(car);
    
    // Pass the car.type (not car.name) to match BookingForm values
    if (onNext) {
      onNext(car.type); // FIXED: Use car.type instead of car.name
    }
    
    // Auto-advance after 1 second
    setTimeout(() => {
      if (onNext) {
        onNext(car.type); // FIXED: Use car.type here too
      }
    }, 1000);
  };

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
    setSelectedIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4 md:p-8 lg:p-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Choose Your <span className="text-yellow-500">Premium</span> Ride
        </h1>
        <p className="text-gray-300 text-lg">
          Select the perfect vehicle for your journey
        </p>
      </div>

      {/* Car Carousel */}
      <div className={`absolute w-72 sm:w-80 md:w-96 lg:w-[400px] h-56 sm:h-64 md:h-72 lg:h-[300px]`}>
        <div className="absolute inset-0 flex items-center justify-center">
          {cars.map((car, index) => {
            const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
            const isActive = index === activeIndex;
            const isSelected = selectedCar?.type === car.type; // FIXED: Compare car.type
            
            return (
              <div
                key={car.type} // FIXED: Use car.type as key
                className={`absolute w-80 h-64 bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-700 ease-in-out border-3 shadow-2xl hover:shadow-yellow-500/20 ${
                  isSelected 
                    ? 'border-green-500 ring-4 ring-green-500/30' 
                    : isActive 
                      ? 'border-yellow-500 ring-2 ring-yellow-500/30' 
                      : 'border-gray-600'
                }`}
                onClick={() => handleCarClick(index, car)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: (() => {
                    const offset = index - activeIndex;
                    const normalizedOffset = offset > cars.length / 2 ? offset - cars.length : 
                                           offset < -cars.length / 2 ? offset + cars.length : offset;
                    const translateX = normalizedOffset * 200;
                    const scale = isActive ? 1.1 : Math.max(0.7, 1 - Math.abs(normalizedOffset) * 0.15);
                    return `translateX(${translateX}px) scale(${scale})`;
                  })(),
                  opacity: isActive ? 1 : Math.max(0.3, 1 - Math.abs(index - activeIndex) * 0.25),
                  zIndex: isActive ? 30 : 20 - Math.abs(index - activeIndex)
                }}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-pulse">
                    ✓
                  </div>
                )}
                
                {/* Car icon */}
                <div className="text-6xl mb-4 transform transition-transform duration-300 hover:scale-110">
                  {car.icon}
                </div>
                
                {/* Car details */}
                <div className="text-center px-4">
                  <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
                  <p className="text-gray-300 text-sm mb-2">{car.description}</p>
                  <div className="flex items-center justify-center text-yellow-400 text-xs">
                    <span className="mr-1">👥</span>
                    <span>{car.capacity}</span>
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent rounded-3xl transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex space-x-2 sm:space-x-3 md:space-x-4">
        {cars.map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-lg text-md sm:text-lg md:text-xl  ${
              index === (hoveredIndex !== null ? hoveredIndex : selectedIndex)
                ? 'bg-yellow-500 scale-125'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <button 
          onClick={() => onNext()}
          className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-lg text-md sm:text-lg md:text-xl px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/25"
        >
          Continue Manually
        </button>
        
        {selectedCar && (
          <button
            onClick={() => {
              setSelectedCar(null);
              if (onNext) onNext(null);
            }}
            className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-lg text-md sm:text-lg md:text-xl px-6 py-2 text-gray-400 hover:text-white transition-colors duration-300 underline"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-gray-500 text-sm mt-8 max-w-md">
        <p>Click any car to select and auto-advance • Hover to preview • Use dots to browse</p>
      </div>
    </div>
  );
};


export default CarCarousel;