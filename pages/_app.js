import '../styles/globals.css'
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`}
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('Google Maps loaded globally');
        }}
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;