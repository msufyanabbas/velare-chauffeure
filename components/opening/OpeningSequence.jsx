import React, { useState } from 'react';
import CinematicLoading from './CinematicLoading';
import VideoHero from './VideoHero';
import CarCarousel from './CarCarousel';
import MapAnimation from './MapAnimation';
import Head from 'next/head';

const OpeningSequence = ({ onComplete, skipToMain }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCar, setSelectedCar] = useState(null);

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

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="fixed top-4 right-4 z-50 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm md:text-base hover:bg-opacity-80 transition-all backdrop-blur-md"
      >
        Skip Intro
      </button>

      {/* Navigation Buttons (Visible only on md+ screens) */}
      <div className="fixed top-4 left-4 z-50 flex flex-wrap gap-2 max-w-[90vw]">
        {steps.map((step, index) => (
          <button
            key={step}
            onClick={() => setCurrentStep(index)}
            className={`px-3 py-1 rounded-full text-xs md:text-sm backdrop-blur-md transition-all ${
              index === currentStep
                ? 'bg-yellow-500 bg-opacity-80 text-black'
                : 'bg-black bg-opacity-60 text-white hover:bg-opacity-80'
            }`}
          >
            {step.charAt(0).toUpperCase() + step.slice(1)}
          </button>
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
