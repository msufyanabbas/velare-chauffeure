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

const PostRideChargesForm = ({ bookingId, paymentIntentId }) => {
  const [booking, setBooking] = useState(null);
  const [additionalCharges, setAdditionalCharges] = useState({
    extraStops: 0,
    waitingTime: 0,
    tolls: 0,
    extraServices: 0,
    other: 0,
  });
  const [customChargeDescription, setCustomChargeDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/booking/${bookingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setBooking(data.booking);
      } else {
        setError('Booking not found');
      }
    } catch (error) {
      setError('Failed to load booking details');
    }
  };

  const handleChargeChange = (type, value) => {
    setAdditionalCharges(prev => ({
      ...prev,
      [type]: parseFloat(value) || 0
    }));
  };

  const getTotalAdditionalCharges = () => {
    return Object.values(additionalCharges).reduce((sum, charge) => sum + charge, 0);
  };

  const getFinalTotal = () => {
    return booking ? booking.totalPrice + getTotalAdditionalCharges() : 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // First, capture the original payment intent
      const captureResponse = await fetch('/api/payment/capture-and-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          originalAmount: booking.totalPrice,
          additionalCharges,
          customChargeDescription,
          bookingId,
        }),
      });

      const captureResult = await captureResponse.json();

      if (captureResult.success) {
        // Update booking with final charges
        const updateResponse = await fetch(`/api/booking/${bookingId}/finalize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            additionalCharges,
            finalTotal: getFinalTotal(),
            paymentStatus: 'completed',
            customChargeDescription,
          }),
        });

        const updateResult = await updateResponse.json();

        if (updateResult.success) {
          setSuccess(true);
          // Send confirmation email
          await sendConfirmationEmail();
        } else {
          setError('Failed to update booking. Please contact support.');
        }
      } else {
        setError(captureResult.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Final charge error:', error);
      setError('Payment processing failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendConfirmationEmail = async () => {
    try {
      await fetch('/api/email/send-final-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          finalTotal: getFinalTotal(),
          additionalCharges,
          customerEmail: booking.email,
        }),
      });
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  };

  if (!booking) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <p className="text-white">Loading booking details...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <Card variant="luxury" className="p-6 text-center">
          <div className="text-green-400 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-serif text-white mb-4">Payment Complete!</h2>
          <p className="text-gray-300 mb-4">
            Final amount charged: {formatCurrency(getFinalTotal())}
          </p>
          <p className="text-sm text-gray-400">
            A receipt has been sent to your email address.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card variant="luxury" className="p-6">
        <h2 className="text-2xl font-serif text-white mb-6">Final Charges</h2>
        
        {/* Original Booking Summary */}
        <div className="mb-6 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-white font-medium mb-3">Original Booking</h3>
          <div className="flex justify-between text-gray-300 mb-2">
            <span>Base Fare:</span>
            <span>{formatCurrency(booking.basePrice)}</span>
          </div>
          {booking.serviceCharges > 0 && (
            <div className="flex justify-between text-gray-300 mb-2">
              <span>Services:</span>
              <span>{formatCurrency(booking.serviceCharges)}</span>
            </div>
          )}
          <div className="border-t border-gray-700 pt-2">
            <div className="flex justify-between text-white font-medium">
              <span>Original Total:</span>
              <span>{formatCurrency(booking.totalPrice)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Additional Charges */}
          <div>
            <h3 className="text-white font-medium mb-4">Additional Charges</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm mb-2">Extra Stops</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={additionalCharges.extraStops}
                  onChange={(e) => handleChargeChange('extraStops', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Waiting Time</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={additionalCharges.waitingTime}
                  onChange={(e) => handleChargeChange('waitingTime', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Tolls</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={additionalCharges.tolls}
                  onChange={(e) => handleChargeChange('tolls', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Extra Services</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={additionalCharges.extraServices}
                  onChange={(e) => handleChargeChange('extraServices', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Other Charges</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={additionalCharges.other}
                  onChange={(e) => handleChargeChange('other', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="0.00"
                />
                {additionalCharges.other > 0 && (
                  <input
                    type="text"
                    value={customChargeDescription}
                    onChange={(e) => setCustomChargeDescription(e.target.value)}
                    className="w-full mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="Description for other charges"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Final Total */}
          <div className="p-4 bg-gray-900 rounded-lg">
            {getTotalAdditionalCharges() > 0 && (
              <>
                <div className="flex justify-between text-gray-300 mb-2">
                  <span>Additional Charges:</span>
                  <span>{formatCurrency(getTotalAdditionalCharges())}</span>
                </div>
                <div className="border-t border-gray-700 pt-2">
                  <div className="flex justify-between text-white font-semibold">
                    <span>Final Total:</span>
                    <span className="text-gold-400">{formatCurrency(getFinalTotal())}</span>
                  </div>
                </div>
              </>
            )}
            {getTotalAdditionalCharges() === 0 && (
              <div className="flex justify-between text-white font-semibold">
                <span>Total to Charge:</span>
                <span className="text-gold-400">{formatCurrency(booking.totalPrice)}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-100 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Processing Final Payment...' : `Charge Final Amount ${formatCurrency(getFinalTotal())}`}
          </Button>
        </form>
      </Card>
    </div>
  );
};

const PostRideForm = ({ bookingId, paymentIntentId }) => {
  return (
    <PostRideChargesForm bookingId={bookingId} paymentIntentId={paymentIntentId} />
  );
};

export default PostRideForm;