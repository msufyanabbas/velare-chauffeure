import React, { useState, useEffect } from 'react';

const LuxuryMapAnimation = ({ onNext }) => {
  const [activeRoute, setActiveRoute] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const routeInterval = setInterval(() => {
      setActiveRoute(prev => (prev + 1) % 4);
    }, 3000);

    const pulseInterval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 3);
    }, 800);

    return () => {
      clearInterval(routeInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  const locations = [
    { x: '20%', y: '30%', name: 'Downtown', type: 'premium' },
    { x: '70%', y: '25%', name: 'Financial District', type: 'executive' },
    { x: '45%', y: '60%', name: 'Airport', type: 'transport' },
    { x: '75%', y: '70%', name: 'Marina', type: 'premium' },
    { x: '25%', y: '75%', name: 'Resort Area', type: 'luxury' },
    { x: '60%', y: '45%', name: 'Shopping Center', type: 'executive' }
  ];

  const routes = [
    { from: 0, to: 1, active: activeRoute === 0 },
    { from: 1, to: 2, active: activeRoute === 1 },
    { from: 2, to: 3, active: activeRoute === 2 },
    { from: 3, to: 4, active: activeRoute === 3 }
  ];

  const getLocationStyle = (location) => ({
    left: location.x,
    top: location.y,
    transform: 'translate(-50%, -50%)'
  });

  const getRoutePathData = (route) => {
    const from = locations[route.from];
    const to = locations[route.to];
    
    const fromX = parseFloat(from.x);
    const fromY = parseFloat(from.y);
    const toX = parseFloat(to.x);
    const toY = parseFloat(to.y);
    
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2 - 5; // Slight curve
    
    return `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_var(--tw-gradient-stops))] from-transparent via-amber-500/3 to-transparent animate-spin" style={{animationDuration: '20s'}}></div>
      </div>

      {/* Main map container */}
      <div className="relative w-11/12 max-w-6xl h-5/6 bg-gradient-to-br from-slate-900/90 to-black/90 backdrop-blur-xl rounded-3xl border border-amber-500/20 shadow-2xl shadow-amber-500/10 overflow-hidden">
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgb(245 158 11)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Routes */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="activeRoute" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(245 158 11)" stopOpacity="0.3"/>
              <stop offset="50%" stopColor="rgb(245 158 11)" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="rgb(245 158 11)" stopOpacity="0.3"/>
            </linearGradient>
            <linearGradient id="inactiveRoute" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(245 158 11)" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="rgb(245 158 11)" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          {routes.map((route, index) => (
            <path
              key={index}
              d={getRoutePathData(route)}
              stroke={route.active ? "url(#activeRoute)" : "url(#inactiveRoute)"}
              strokeWidth={route.active ? "0.8" : "0.3"}
              fill="none"
              className={route.active ? "animate-pulse" : ""}
              style={{
                filter: route.active ? 'drop-shadow(0 0 8px rgb(245 158 11 / 0.6))' : 'none',
                transition: 'all 0.5s ease-in-out'
              }}
            />
          ))}
        </svg>

        {/* Location pins */}
        {locations.map((location, index) => (
          <div
            key={index}
            className="absolute"
            style={getLocationStyle(location)}
          >
            <div className="relative">
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" style={{animationDelay: `${index * 0.2}s`}}></div>
              <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" style={{animationDelay: `${index * 0.2 + 0.5}s`, animationDuration: '2s'}}></div>
              
              {/* Main pin */}
              <div className={`relative w-4 h-4 rounded-full border-2 border-amber-400 shadow-lg transition-all duration-300 ${
                location.type === 'premium' ? 'bg-amber-500' :
                location.type === 'executive' ? 'bg-amber-400' :
                location.type === 'luxury' ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                'bg-amber-300'
              }`} style={{
                boxShadow: '0 0 20px rgb(245 158 11 / 0.4), inset 0 0 10px rgb(245 158 11 / 0.2)'
              }}></div>
              
              {/* Location label */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-amber-500/30">
                  <span className="text-amber-400 text-xs font-medium">{location.name}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Moving vehicles */}
        {routes.map((route, index) => (
          route.active && (
            <div
              key={`vehicle-${index}`}
              className="absolute"
              style={{
                left: locations[route.from].x,
                top: locations[route.from].y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-2 h-2 bg-amber-400 rounded-full shadow-lg animate-ping"></div>
              <div className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full shadow-lg" 
                   style={{
                     animation: `moveVehicle${index} 3s ease-in-out infinite`,
                     boxShadow: '0 0 15px rgb(245 158 11 / 0.8)'
                   }}></div>
            </div>
          )
        ))}

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="text-center">
            <div className="bg-gradient-to-r from-black/80 via-black/60 to-black/80 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/20 shadow-2xl shadow-amber-500/10">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H3zM6 4a1 1 0 00-1 1v1a1 1 0 001 1h7a1 1 0 001-1V5a1 1 0 00-1-1H6zM3 9a1 1 0 00-1 1v5a2 2 0 002 2h1a1 1 0 001-1v-1h6v1a1 1 0 001 1h1a2 2 0 002-2v-5a1 1 0 00-1-1H3z"/>
                  </svg>
                </div>
              </div>
              
              <h2 className="text-4xl font-light text-amber-400 mb-3 tracking-wide">
                Elite Transportation Network
              </h2>
              <p className="text-slate-300 mb-6 text-lg font-light max-w-2xl mx-auto">
                Experience seamless luxury travel across premium destinations with our exclusive fleet
              </p>
              
              <div className="flex justify-center items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-amber-400 text-sm">Premium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  <span className="text-amber-400 text-sm">Executive</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"></div>
                  <span className="text-amber-400 text-sm">Luxury</span>
                </div>
              </div>
              
              <button 
                onClick={onNext}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-8 py-3 rounded-full font-medium tracking-wider hover:shadow-2xl hover:shadow-amber-500/30 transform hover:-translate-y-1 transition-all duration-300 hover:scale-105"
              >
                Discover Our Fleet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes moveVehicle0 {
          0% { left: 20%; top: 30%; }
          100% { left: 70%; top: 25%; }
        }
        @keyframes moveVehicle1 {
          0% { left: 70%; top: 25%; }
          100% { left: 45%; top: 60%; }
        }
        @keyframes moveVehicle2 {
          0% { left: 45%; top: 60%; }
          100% { left: 75%; top: 70%; }
        }
        @keyframes moveVehicle3 {
          0% { left: 75%; top: 70%; }
          100% { left: 25%; top: 75%; }
        }
      `}</style>
    </div>
  );
};

export default LuxuryMapAnimation;