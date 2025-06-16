import React, { useState, useEffect } from 'react';

const CinematicLoading = ({ onComplete, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    const phases = [
      { delay: 0, phase: 0 },
      { delay: 1000, phase: 1 },
      { delay: 2500, phase: 2 },
      { delay: 4000, phase: 3 }
    ];

    phases.forEach(({ delay, phase }) => {
      setTimeout(() => setCurrentPhase(phase), delay);
    });

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete && onComplete(), 800);
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col justify-center items-center overflow-hidden">
      {/* Geometric background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-yellow-500 rotate-45 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-yellow-500 rotate-12 animate-pulse delay-1000"></div>
      </div>

      {/* Main logo area */}
      <div className="relative mb-12 text-center">
        {/* Velaré logo */}
        <div className={`transition-all duration-1000 ${currentPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <div className="text-6xl md:text-7xl font-thin tracking-[0.3em] text-yellow-500 mb-4">
            VELARÉ
          </div>
          <div className="w-48 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto"></div>
        </div>

        {/* Subtitle */}
        <div className={`mt-6 transition-all duration-1000 delay-500 ${currentPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-lg md:text-xl text-gray-300 font-light tracking-widest">
            ARRIVE WITH INTENTION
          </p>
          <p className="text-sm md:text-base text-gray-400 mt-2 tracking-wider">
            TRAVEL IN ELEGANCE
          </p>
        </div>
      </div>

      {/* Elegant loading indicator */}
      <div className={`relative transition-all duration-1000 delay-1000 ${currentPhase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-80 h-px bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 animate-[elegantProgress_3s_ease-out_forwards] shadow-lg shadow-yellow-500/30"></div>
        </div>
        <div className="text-center mt-4 text-gray-500 text-sm tracking-wider">
          Preparing Your Experience
        </div>
      </div>

      <style jsx>{`
        @keyframes elegantProgress {
          0% { width: 0; transform: translateX(-100%); }
          100% { width: 100%; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default CinematicLoading;