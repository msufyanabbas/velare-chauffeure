import dbConnect from '../../../lib/db';
import Booking from '../../../models/Booking';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { paymentIntentId, bookingId } = req.body;
    
    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update booking status
      await Booking.findOneAndUpdate(
        { bookingId },
        { 
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentIntentId,
          confirmedAt: new Date()
        }
      );
      
      res.status(200).json({
        success: true,
        message: 'Payment confirmed and booking updated'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not successful'
      });
    }
    
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}