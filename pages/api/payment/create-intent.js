import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  console.log('testing here .................');
  console.log('req body is ', req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'usd', bookingId } = req.body;
    
    // Validate required fields
    if (!amount || !bookingId) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['amount', 'bookingId'],
        received: { amount, bookingId }
      });
    }

    // Validate amount is a valid number
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        message: 'Amount must be a valid positive number',
        received: amount
      });
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        bookingId: bookingId.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
    
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}