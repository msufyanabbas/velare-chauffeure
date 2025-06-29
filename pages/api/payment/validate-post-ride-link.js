// /api/payment/validate-post-ride-link.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { bookingId, paymentIntentId } = req.body;

    if (!bookingId || !paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing booking ID or payment intent ID'
      });
    }

    // Validate the payment intent exists and is in the correct state
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(404).json({
        success: false,
        error: 'Payment intent not found'
      });
    }
    // Check if the payment intent belongs to this booking
    if (paymentIntent.metadata.bookingId !== bookingId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent does not match booking'
      });
    }

    // Check if payment intent is in the correct state for capture
    if (paymentIntent.status === 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'This payment has already been processed'
      });
    }

    if (paymentIntent.status !== 'requires_capture') {
      return res.status(400).json({
        success: false,
        error: 'Payment authorization has expired or is invalid'
      });
    }

    // Here you might also want to check your database to ensure:
    // 1. The booking exists
    // 2. The booking hasn't already been finalized
    // 3. The link hasn't expired (if you implement expiration)
    
    // For now, we'll just validate the Stripe payment intent
    res.status(200).json({
      success: true,
      message: 'Link is valid',
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      }
    });

  } catch (error) {
    console.error('Link validation error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment intent ID'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to validate link'
    });
  }
}