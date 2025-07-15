import '../styles/globals.css'
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-L2DYR057LF"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-L2DYR057LF');
        `}
      </Script>

      {/* Your existing Google Maps code */}
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