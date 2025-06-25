// /api/payment/capture-and-charge.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      paymentIntentId, 
      originalAmount, 
      additionalCharges, 
      bookingId 
    } = req.body;

    // Validate required fields
    if (!paymentIntentId || !originalAmount || !bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: paymentIntentId, originalAmount, bookingId'
      });
    }

    // Calculate total additional charges
    const totalAdditionalCharges = Object.values(additionalCharges || {})
      .reduce((sum, charge) => sum + (parseFloat(charge) || 0), 0);

    const finalAmount = originalAmount + totalAdditionalCharges;
    const finalAmountCents = Math.round(finalAmount * 100);

    // Retrieve the payment intent to check its current state
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'requires_capture') {
      return res.status(400).json({
        success: false,
        error: `Payment intent cannot be captured. Current status: ${paymentIntent.status}`
      });
    }

    // Check if we need to update the amount
    let updatedPaymentIntent = paymentIntent;
    if (finalAmountCents !== paymentIntent.amount) {
      // Update the payment intent amount if additional charges were added
      updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        amount: finalAmountCents,
      });
    }

    // Capture the payment
    const capturedPaymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    res.status(200).json({
      success: true,
      paymentIntent: capturedPaymentIntent,
      finalAmount: finalAmount,
      additionalCharges: totalAdditionalCharges
    });

  } catch (error) {
    console.error('Payment capture error:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(402).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Payment processing failed. Please try again.'
    });
  }
}