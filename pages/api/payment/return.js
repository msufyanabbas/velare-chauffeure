// /pages/payment/return.js or /api/payment/return.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PaymentReturn() {
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const { payment_intent, payment_intent_client_secret, redirect_status, booking_id } = router.query;

    if (payment_intent && redirect_status) {
      handlePaymentReturn(payment_intent, redirect_status, booking_id);
    }
  }, [router.query]);

  const handlePaymentReturn = async (paymentIntentId, redirectStatus, bookingId) => {
    try {
      if (redirectStatus === 'succeeded') {
        setStatus('success');
        setMessage('Payment completed successfully!');
        
        // Redirect to booking confirmation page after 3 seconds
        setTimeout(() => {
          router.push(`/booking/confirmation?id=${bookingId}`);
        }, 3000);
        
      } else if (redirectStatus === 'processing') {
        setStatus('processing');
        setMessage('Your payment is still processing...');
        
        // You might want to poll for payment status here
        
      } else if (redirectStatus === 'requires_payment_method') {
        setStatus('failed');
        setMessage('Payment failed. Please try a different payment method.');
        
        setTimeout(() => {
          router.push(`/booking/payment?id=${bookingId}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Error handling payment return:', error);
      setStatus('error');
      setMessage('An error occurred while processing your payment.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        {status === 'processing' && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        )}
        
        {status === 'success' && (
          <div className="text-green-600 text-5xl mb-4">✓</div>
        )}
        
        {status === 'failed' && (
          <div className="text-red-600 text-5xl mb-4">✗</div>
        )}
        
        {status === 'error' && (
          <div className="text-yellow-600 text-5xl mb-4">⚠</div>
        )}
        
        <h2 className="text-xl font-semibold mb-2">
          {status === 'success' && 'Payment Successful'}
          {status === 'processing' && 'Processing Payment'}
          {status === 'failed' && 'Payment Failed'}
          {status === 'error' && 'Payment Error'}
        </h2>
        
        <p className="text-gray-600 mb-4">{message}</p>
        
        {status === 'success' && (
          <p className="text-sm text-gray-500">
            Redirecting to confirmation page...
          </p>
        )}
        
        {status === 'failed' && (
          <p className="text-sm text-gray-500">
            Redirecting to payment page...
          </p>
        )}
      </div>
    </div>
  );
}