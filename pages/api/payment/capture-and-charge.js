// /api/payment/capture-and-charge.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to get the return URL
function getReturnUrl(req, bookingId) {
  // Get the host from the request headers
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  
  // Fallback URLs based on environment
  const fallbackUrl = process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : 'http://localhost:3000';
  
  // Use environment variable, or construct from request, or use fallback
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                  (host ? `${protocol}://${host}` : fallbackUrl);
  
  return `${baseUrl}/payment/return?booking_id=${bookingId}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      paymentIntentId, 
      originalAmount, 
      additionalCharges, 
      bookingId,
      customerEmail, // We'll need this to create/find customer
      customerName // Optional but helpful
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
    const originalAmountCents = Math.round(originalAmount * 100);
    const additionalChargesCents = Math.round(totalAdditionalCharges * 100);

    // Retrieve the payment intent to check its current state
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'requires_capture') {
      return res.status(400).json({
        success: false,
        error: `Payment intent cannot be captured. Current status: ${paymentIntent.status}`
      });
    }

    let capturedPaymentIntent;
    let additionalPaymentIntent = null;

    // If there are additional charges, handle them separately
    if (additionalChargesCents > 0) {
      // Capture the original payment intent for the original amount
      capturedPaymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
        amount_to_capture: Math.min(originalAmountCents, paymentIntent.amount)
      });

      // Handle additional charges with proper customer and payment method setup
      if (paymentIntent.payment_method && customerEmail) {
        try {
          // First, find or create a customer
          let customer;
          const existingCustomers = await stripe.customers.list({
            email: customerEmail,
            limit: 1
          });

          if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
          } else {
            customer = await stripe.customers.create({
              email: customerEmail,
              name: customerName,
              metadata: {
                bookingId: bookingId
              }
            });
          }

          // Retrieve the payment method to check if it's already attached
          const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
          
          // Attach payment method to customer if not already attached
          if (!paymentMethod.customer) {
            await stripe.paymentMethods.attach(paymentIntent.payment_method, {
              customer: customer.id
            });
          }

          // Create and immediately capture a new PaymentIntent for additional charges
          additionalPaymentIntent = await stripe.paymentIntents.create({
            amount: additionalChargesCents,
            currency: paymentIntent.currency,
            customer: customer.id,
            payment_method: paymentIntent.payment_method,
            payment_method_types: ['card'], // Only allow cards to avoid redirect
            confirm: true,
            capture_method: 'automatic',
            metadata: {
              bookingId: bookingId,
              type: 'additional_charges',
              originalPaymentIntent: paymentIntentId
            }
          });

        } catch (pmError) {
          console.error('Error processing additional charges:', pmError);
          
          // If payment method reuse fails, we can still return success for the original capture
          // but inform about the additional charges failure
          return res.status(200).json({
            success: true,
            originalPaymentIntent: capturedPaymentIntent,
            additionalPaymentIntent: null,
            finalAmount: originalAmount, // Only original amount was captured
            originalAmount: originalAmount,
            additionalCharges: 0,
            totalCaptured: capturedPaymentIntent.amount_received / 100,
            warning: 'Original payment captured successfully, but additional charges could not be processed. Please process additional charges manually.',
            additionalChargesError: pmError.message
          });
        }
      }
    } else {
      // No additional charges, just capture the original amount
      capturedPaymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    }

    res.status(200).json({
      success: true,
      originalPaymentIntent: capturedPaymentIntent,
      additionalPaymentIntent: additionalPaymentIntent,
      finalAmount: finalAmount,
      originalAmount: originalAmount,
      additionalCharges: totalAdditionalCharges,
      totalCaptured: (capturedPaymentIntent.amount_received + (additionalPaymentIntent?.amount_received || 0)) / 100
    });

  } catch (error) {
    console.error('Payment capture error:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(402).json({
        success: false,
        error: error.message,
        decline_code: error.decline_code
      });
    }

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      error: 'Payment processing failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}