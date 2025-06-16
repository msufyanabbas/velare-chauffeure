// components/openings/VideoHero.js
import React, {useState, useEffect} from 'react';

const VideoHero = ({ onNext }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 500);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Animated luxury background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent animate-pulse"></div>
      </div>
      
      {/* Luxury car silhouette */}
      <div className="absolute w-4/5 max-w-3xl h-64 opacity-20">
        <div className="relative w-full h-full">
          {/* Car body */}
          <div 
            className="absolute bottom-8 left-0 w-full h-32 bg-gradient-to-b from-gray-400/30 to-gray-600/30 animate-[luxuryFloat_6s_ease-in-out_infinite]"
            style={{
              clipPath: 'polygon(8% 100%, 12% 60%, 18% 40%, 25% 30%, 35% 25%, 65% 25%, 75% 30%, 85% 40%, 90% 60%, 92% 100%)'
            }}
          ></div>
          {/* Car details */}
          <div className="absolute bottom-4 left-1/4 w-4 h-4 bg-yellow-500/40 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 right-1/4 w-4 h-4 bg-yellow-500/40 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Hero content */}
      <div className={`text-center z-10 text-white transition-all duration-2000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-thin mb-6 tracking-wide">
            Luxury <span className="text-yellow-500">Redefined</span>
          </h1>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mb-6"></div>
          <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wider">
            Where Elegance Meets Excellence
          </p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={onNext}
            className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-12 py-4 rounded-full text-lg font-medium tracking-wider hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 transform"
          >
            Reserve Your Experience
          </button>
          <div className="text-gray-500 text-sm tracking-widest">
            PREMIUM • PUNCTUAL • PRESTIGIOUS
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes luxuryFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
      `}</style>
    </div>
  );
};

export default VideoHero;