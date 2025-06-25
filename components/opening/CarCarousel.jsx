import React, { useState, useEffect } from 'react';
import { Car, Crown, Truck, Users, Bus } from 'lucide-react';

const CarCarousel = ({ onNext }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);

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
      icon: Truck,
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

  // Auto-rotation
  useEffect(() => {
    if (hoveredIndex !== null) return;

    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % cars.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [hoveredIndex]);

  const handleCarClick = (index, car) => {
    setSelectedIndex(index);
    setSelectedCar(car);

    if (onNext) {
      onNext(car.type);
    }

    // Auto-advance after 1 second
    setTimeout(() => {
      if (onNext) {
        onNext(car.type);
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

  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Choose Your <span className="text-yellow-500">Premium</span> Ride
        </h1>
        <p className="text-gray-300 text-lg">Select the perfect vehicle for your journey</p>
      </div>

      {/* Car Carousel */}
      <div className="relative w-full max-w-6xl h-80 mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          {cars.map((car, index) => {
            const isActive = index === activeIndex;
            const isSelected = selectedCar?.type === car.type;

            const offset = index - activeIndex;
            const normalizedOffset =
              offset > cars.length / 2
                ? offset - cars.length
                : offset < -cars.length / 2
                ? offset + cars.length
                : offset;

            const translateX = normalizedOffset * 200;
            const scale = isActive ? 1.1 : Math.max(0.7, 1 - Math.abs(normalizedOffset) * 0.15);
            const opacity = isActive ? 1 : Math.max(0.3, 1 - Math.abs(index - activeIndex) * 0.25);
            const zIndex = isActive ? 30 : 20 - Math.abs(index - activeIndex);

            const IconComponent = car.icon;

            return (
              <div
                key={car.type}
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
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  opacity,
                  zIndex,
                }}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-pulse">
                    ✓
                  </div>
                )}

                <div className="text-6xl mb-4 transform transition-transform duration-300 hover:scale-110">
                  <IconComponent size={64} className="text-yellow-500" />
                </div>

                <div className="text-center px-4">
                  <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
                  <p className="text-gray-300 text-sm mb-2">{car.description}</p>
                  <div className="flex items-center justify-center text-yellow-400 text-xs">
                    <span className="mr-1">👥</span>
                    <span>{car.capacity}</span>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent rounded-3xl transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex space-x-3 mb-8">
        {cars.map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'bg-yellow-500 scale-125' : 'bg-gray-600 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <button
          onClick={() => onNext && onNext()}
          className="px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/25"
        >
          Continue Manually
        </button>

        {selectedCar && (
          <button
            onClick={() => {
              setSelectedCar(null);
              if (onNext) onNext(null);
            }}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors duration-300 underline"
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