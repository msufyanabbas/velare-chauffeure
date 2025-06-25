// pages/post-ride.js or components/PostRidePage.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PostRideForm from '../components/payment/PostRideChargesForm';
import Card from '../components/ui/Card';

const PostRidePage = () => {
  const router = useRouter();
  const { booking: bookingId, payment: paymentIntentId } = router.query;
  const [isValidLink, setIsValidLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId && paymentIntentId) {
      validateLink();
    }
  }, [bookingId, paymentIntentId]);

  const validateLink = async () => {
    try {
      const response = await fetch('/api/payment/validate-post-ride-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          paymentIntentId,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsValidLink(true);
      } else {
        setError(data.error || 'Invalid or expired link');
      }
    } catch (error) {
      setError('Failed to validate link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-400 mx-auto mb-4"></div>
          <p>Validating your payment link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card variant="luxury" className="p-6 text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-serif text-white mb-4">Link Invalid</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <p className="text-sm text-gray-400">
            Please check your email for the correct link or contact support if you continue to have issues.
          </p>
        </Card>
      </div>
    );
  }

  if (isValidLink) {
    return (
      <div className="min-h-screen bg-black py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-white mb-2">Complete Your Payment</h1>
            <p className="text-gray-400">Add any additional charges from your ride and finalize payment</p>
          </div>
          
          <PostRideForm 
            bookingId={bookingId} 
            paymentIntentId={paymentIntentId}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default PostRidePage;