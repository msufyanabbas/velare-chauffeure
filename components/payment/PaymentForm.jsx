import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatCurrency } from '../../lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ bookingData, priceData, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: priceData.totalPrice,
          bookingId: bookingData.bookingId,
        }),
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      setPaymentError('Failed to initialize payment. Please try again.');
    }
  };

const handleSubmit = async (event) => {
  event.preventDefault();

  if (!stripe || !elements) {
    return;
  }

  setIsLoading(true);
  setPaymentError(null);

  const cardElement = elements.getElement(CardElement);

  try {
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: bookingData.email.split('@')[0],
          email: bookingData.email,
          phone: bookingData.phoneNumber,
        },
      },
    });

    if (error) {
      setPaymentError(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      console.log('booking is ', bookingData);
      // Create booking in database with correct price structure
      const bookingResponse = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          totalPrice: priceData.totalPrice, // Extract totalPrice correctly
          basePrice: priceData.basePrice,   // Optional: include base price
          serviceCharges: priceData.serviceCharges, // Optional: include service charges
          paymentIntentId: paymentIntent.id,
        }),
      });

      const bookingResult = await bookingResponse.json();
      console.log('booking result is ', bookingResult);

      if (bookingResult.success) {
        onSuccess({
          paymentIntent,
          bookingId: bookingResult.bookingId, // Updated to match typical response structure
        });
      } else {
        console.error('Booking creation failed:', bookingResult.error);
        setPaymentError('Booking creation failed. Please contact support.');
      }
    }
  } catch (error) {
    console.error('Payment error:', error);
    setPaymentError('Payment failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  return (
    <div className="max-w-md mx-auto">
      <Card variant="luxury" className="p-6">
        <h3 className="text-xl font-serif text-white mb-6">Payment Details</h3>
        
        {/* Payment Summary */}
        <div className="mb-6 p-4 bg-gray-900 rounded-lg">
          <div className="flex justify-between text-gray-300 mb-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(priceData.basePrice)}</span>
          </div>
          {priceData.serviceCharges > 0 && (
            <div className="flex justify-between text-gray-300 mb-2">
              <span>Services:</span>
              <span>{formatCurrency(priceData.serviceCharges)}</span>
            </div>
          )}
          <div className="border-t border-gray-700 pt-2">
            <div className="flex justify-between text-white font-semibold">
              <span>Total:</span>
              <span className="text-gold-400">{formatCurrency(priceData.totalPrice)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Card Information
            </label>
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {paymentError && (
            <div className="text-red-500 text-sm bg-red-100 p-3 rounded-lg">
              {paymentError}
            </div>
          )}

          <Button
            type="submit"
            disabled={!stripe || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Processing...' : `Pay ${formatCurrency(priceData.totalPrice)}`}
          </Button>
        </form>

        {/* Payment Methods */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm text-center mb-4">We accept</p>
          <div className="flex justify-center space-x-4">
            <div className="text-white text-sm">💳 Visa</div>
            <div className="text-white text-sm">💳 Mastercard</div>
            <div className="text-white text-sm">🍎 Apple Pay</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const PaymentForm = ({ bookingData, priceData, onSuccess, onError }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        bookingData={bookingData}
        priceData={priceData}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default PaymentForm;