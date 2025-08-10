import React from 'react';
import CinematicLoading from './CinematicLoading';
import Head from 'next/head';

const OpeningSequence = ({ onComplete }) => {
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

      <CinematicLoading onComplete={onComplete} />
    </>
  );
};

export default OpeningSequence;