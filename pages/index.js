import { useState } from 'react';
import Layout from '../components/layout/Layout';
import HeroSection from '../components/layout/HeroSection';
import InstantBooking from '../components/booking/InstantBooking';
import Services from './Services';
import About from './About';
import Testimonials from './Testimonials';
import Contact from './Contact-us';
import OpeningSequence from '../components/opening/OpeningSequence';

const LuxuryChauffeurApp = () => {
  const [showOpening, setShowOpening] = useState(true);
  const [openingData, setOpeningData] = useState(null);

  const handleOpeningComplete = (data) => {
    setOpeningData(data);
    setShowOpening(false);
  };

  const handleSkipOpening = () => {
    setShowOpening(false);
  };

  if (showOpening) {
    return (
      <OpeningSequence 
        onComplete={handleOpeningComplete}
        skipToMain={handleSkipOpening}
      />
    );
  }

  return (
    <Layout>
      <HeroSection selectedCar={openingData?.selectedCar} />
      <InstantBooking preSelectedCar={openingData?.selectedCar} />
      <Services />
      <About />
      <Testimonials />
      <Contact />
    </Layout>
  );
};

export default LuxuryChauffeurApp;
