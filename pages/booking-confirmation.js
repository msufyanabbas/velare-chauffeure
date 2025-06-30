// pages/booking-confirmation.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';

const BookingConfirmation = () => {
  const router = useRouter();
  const { bookingId, paymentIntentId } = router.query;
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/booking/${bookingId}`);
      const data = await response.json();
      
      if (data.success) {
        setBookingDetails(data.booking);
      } else {
        setError('Could not fetch booking details');
      }
    } catch (error) {
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      const response = await fetch(`/api/booking/${bookingId}/receipt`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `velari-receipt-${bookingId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download receipt:', error);
    }
  };

  const sendEmailReceipt = async () => {
    try {
      await fetch(`/api/booking/${bookingId}/send-receipt`, {
        method: 'POST',
      });
      alert('Receipt sent to your email!');
    } catch (error) {
      console.error('Failed to send email receipt:', error);
    }
  };

  // Helper function to safely get booking data with fallbacks
  const getBookingValue = (key, fallback = 'Not provided') => {
    return bookingDetails?.[key] || fallback;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
              <div className="absolute inset-0 rounded-full border-4 border-gold-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-white text-lg">Loading your booking details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <Card variant="luxury" className="p-8 max-w-md w-full">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-serif text-white mb-4">Booking Error</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <div className="space-y-3">
                <Button onClick={() => router.push('/')} className="w-full">
                  Go Home
                </Button>
                <Button variant="outline" onClick={() => router.push('/contact')} className="w-full">
                  Contact Support
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Booking Confirmed - Velaré Luxury Transportation</title>
        <meta name="description" content="Your luxury transportation booking has been confirmed." />
      </Head>

      <Layout>
        <div className="min-h-screen bg-black py-24 sm:py-24 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8 sm:mb-12">
  {/* Success Icon with better visibility */}
  <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6">
    {/* Outer glow ring */}
    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
    {/* Main background circle */}
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
      {/* Check mark with better contrast */}
      <svg 
        className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-sm" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        strokeWidth={3}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M5 13l4 4L19 7" 
        />
      </svg>
    </div>
  </div>
  
  <h1 className="text-2xl sm:text-4xl font-serif text-white mb-4">
    Booking Confirmed!
  </h1>
  <p className="text-lg sm:text-xl text-gray-300 mb-2">
    Thank you for choosing Velaré Luxury Transportation
  </p>
  <p className="text-gray-400 text-sm sm:text-base">
    Your booking confirmation has been sent to your email
  </p>
</div>

            {bookingDetails && (
              <div className="space-y-6 sm:space-y-8">
                {/* Booking Details */}
                <Card variant="luxury" className="p-6 sm:p-8">
                  <div className="border-b border-gray-700 pb-6 mb-6">
                    <h2 className="text-xl sm:text-2xl font-serif text-white mb-4 sm:mb-6">Trip Details</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Booking ID</label>
                          <p className="text-white font-mono text-base sm:text-lg break-all">
                            {getBookingValue('id', bookingId)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Vehicle Type</label>
                          <p className="text-white text-base sm:text-lg">
                            {getBookingValue('vehicleType', 'Luxury Vehicle')}
                          </p>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Trip Type</label>
                          <p className="text-white text-base sm:text-lg capitalize">
                            {getBookingValue('tripType', 'One Way')}
                          </p>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Passengers</label>
                          <p className="text-white text-base sm:text-lg">
                            {getBookingValue('passengers', '1')} passenger{getBookingValue('passengers', '1') !== '1' ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Date & Time</label>
                          <p className="text-white text-base sm:text-lg">
                            {getBookingValue('date', 'TBD')} at {getBookingValue('time', 'TBD')}
                          </p>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Status</label>
                          <div className="flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></span>
                            <p className="text-green-400 text-base sm:text-lg">
                              Confirmed
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Information */}
                  <div className="border-b border-gray-700 pb-6 mb-6">
                    <h3 className="text-lg sm:text-xl font-serif text-white mb-4">Route</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-400 text-sm mb-1">Pickup Location</p>
                          <p className="text-white text-base sm:text-lg break-words">
                            {getBookingValue('pickupAddress', 'Pickup location to be confirmed')}
                          </p>
                        </div>
                      </div>
                      <div className="ml-6 border-l-2 border-dashed border-gray-600 h-6 sm:h-8"></div>
                      <div className="flex items-start space-x-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-400 text-sm mb-1">Drop-off Location</p>
                          <p className="text-white text-base sm:text-lg break-words">
                            {getBookingValue('dropoffAddress', 'Drop-off location to be confirmed')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="border-b border-gray-700 pb-6 mb-6">
                    <h3 className="text-lg sm:text-xl font-serif text-white mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Email</label>
                        <p className="text-white text-base break-words">
                          {getBookingValue('email', 'Not provided')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Phone</label>
                        <p className="text-white text-base">
                          {getBookingValue('phoneNumber', 'Not provided')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Services - Only show if exists */}
                  {getBookingValue('extraServices', null) && (
                    <div className="border-b border-gray-700 pb-6 mb-6">
                      <h3 className="text-lg sm:text-xl font-serif text-white mb-4">Additional Services</h3>
                      <p className="text-white text-base">
                        {getBookingValue('extraServices')}
                      </p>
                    </div>
                  )}

                  {/* Special Requests - Only show if exists */}
                  {getBookingValue('specialRequests', null) && (
                    <div className="border-b border-gray-700 pb-6 mb-6">
                      <h3 className="text-lg sm:text-xl font-serif text-white mb-4">Special Requests</h3>
                      <p className="text-white text-base">
                        {getBookingValue('specialRequests')}
                      </p>
                    </div>
                  )}

                  {/* Payment Summary */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-serif text-white mb-4">Payment Summary</h3>
                    <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-gray-300">
                          <span className="text-sm sm:text-base">Base Price:</span>
                          <span className="text-sm sm:text-base font-mono">
                            {formatCurrency(getBookingValue('basePrice', 0))}
                          </span>
                        </div>
                        {(getBookingValue('serviceCharges', 0) > 0) && (
                          <div className="flex justify-between items-center text-gray-300">
                            <span className="text-sm sm:text-base">Service Charges:</span>
                            <span className="text-sm sm:text-base font-mono">
                              {formatCurrency(getBookingValue('serviceCharges', 0))}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-gray-700 pt-3">
                          <div className="flex justify-between items-center text-white font-semibold">
                            <span className="text-base sm:text-lg">Total Paid:</span>
                            <span className="text-gold-400 text-base sm:text-lg font-mono">
                              {formatCurrency(getBookingValue('totalPrice', getBookingValue('basePrice', 0)))}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-green-400 text-sm">
                          <span>Payment Status:</span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Button 
                    variant="outline" 
                    onClick={downloadReceipt}
                    className="flex items-center justify-center space-x-2 py-3 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download Receipt</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={sendEmailReceipt}
                    className="flex items-center justify-center space-x-2 py-3 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.267a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Email Receipt</span>
                  </Button>
                  
                  {/* <Button 
                    variant="outline"
                    onClick={() => router.push('/my-bookings')}
                    className="flex items-center justify-center space-x-2 py-3 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>My Bookings</span>
                  </Button> */}
                  
                  <Button 
                    onClick={() => router.push('/')}
                    className="flex items-center justify-center space-x-2 bg-gold-500 hover:bg-gold-600 text-black py-3 text-sm sm:text-base font-medium"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Back to Home</span>
                  </Button>
                </div>

                {/* Contact Support */}
                {/* <Card variant="luxury" className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-serif text-white mb-4">Need Assistance?</h3>
                    <p className="text-gray-300 mb-6 text-sm sm:text-base">
                      Our concierge team is available 24/7 to assist with your luxury transportation needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
                      <Button variant="outline" className="flex items-center justify-center space-x-2 py-3">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>Call Concierge</span>
                      </Button>
                      <Button variant="outline" className="flex items-center justify-center space-x-2 py-3">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Live Chat</span>
                      </Button>
                    </div>
                  </div>
                </Card> */}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default BookingConfirmation;