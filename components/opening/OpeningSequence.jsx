import React, { useState } from 'react';
import CinematicLoading from './CinematicLoading';
import VideoHero from './VideoHero';
import CarCarousel from './CarCarousel';
import MapAnimation from './MapAnimation';
import Head from 'next/head';

const OpeningSequence = ({ onComplete, skipToMain }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const steps = ['cinematic', 'video', 'carousel', 'map'];

  const handleNext = (data = null) => {
    if (currentStep === 2 && data) {
      setSelectedCar(data);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete && onComplete({ selectedCar });
    }
  };

  const handleSkip = () => {
    skipToMain && skipToMain();
  };

  const handleStepChange = (index) => {
    setCurrentStep(index);
    setShowMobileMenu(false); // Close mobile menu after selection
  };

  return (
    <>
      <Head>
        <title>Book Your Ride - Velaré Luxury Transportation</title>
        <meta
          name="description"
          content="Book your luxury transportation with Velaré. Premium vehicles, professional chauffeurs, and exceptional service."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Skip Button - Responsive */}
      <button
        onClick={handleSkip}
        className="fixed top-3 right-3 md:top-4 md:right-4 z-50 bg-black bg-opacity-60 text-white px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-base hover:bg-opacity-80 transition-all backdrop-blur-md"
      >
        Skip Intro
      </button>

      {/* Desktop Navigation Buttons */}
      <div className="hidden md:flex fixed top-4 left-4 z-50 gap-2 max-w-[90vw]">
        {steps.map((step, index) => (
          <button
            key={step}
            onClick={() => handleStepChange(index)}
            className={`px-3 py-1 rounded-full text-sm backdrop-blur-md transition-all ${
              index === currentStep
                ? 'bg-yellow-500 bg-opacity-80 text-black'
                : 'bg-black bg-opacity-60 text-white hover:bg-opacity-80'
            }`}
          >
            {step.charAt(0).toUpperCase() + step.slice(1)}
          </button>
        ))}
      </div>

      {/* Mobile Navigation - Hamburger Menu */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="bg-black bg-opacity-60 text-white p-2 rounded-full backdrop-blur-md hover:bg-opacity-80 transition-all"
          aria-label="Toggle navigation menu"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {showMobileMenu ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Dropdown Menu */}
        {showMobileMenu && (
          <div className="absolute top-12 left-0 bg-black bg-opacity-80 rounded-lg backdrop-blur-md overflow-hidden min-w-[140px]">
            {steps.map((step, index) => (
              <button
                key={step}
                onClick={() => handleStepChange(index)}
                className={`w-full text-left px-4 py-3 text-sm transition-all border-b border-gray-600 last:border-b-0 ${
                  index === currentStep
                    ? 'bg-yellow-500 bg-opacity-80 text-black'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Progress Indicator for Mobile */}
      <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentStep
                ? 'bg-yellow-500'
                : index < currentStep
                ? 'bg-green-500'
                : 'bg-white bg-opacity-40'
            }`}
          />
        ))}
      </div>

      {/* Responsive Container for Steps */}
      <div className="w-full h-full overflow-hidden">
        {currentStep === 0 && <CinematicLoading onComplete={() => handleNext()} />}
        {currentStep === 1 && <VideoHero onNext={() => handleNext()} />}
        {currentStep === 2 && <CarCarousel onNext={(car) => handleNext(car)} />}
        {currentStep === 3 && <MapAnimation onNext={() => handleNext()} />}
      </div>
    </>
  );
};

export default OpeningSequence;