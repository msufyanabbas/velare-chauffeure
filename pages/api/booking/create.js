import dbConnect from '../../../lib/db';
import Booking from '../../../models/Booking';
import { sendConfirmationEmail } from '../../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const bookingData = req.body;
    
    // Generate booking ID
    const bookingId = 'VEL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    console.log('bookingData in dust is ', bookingData);
    // Create booking record
    const booking = new Booking({
      ...bookingData,
      bookingId,
      status: 'pending',
      createdAt: new Date(),
    });
    
    await booking.save();
    
    // Send confirmation emails
    await sendConfirmationEmail(bookingData.email, booking, 'customer');
    await sendConfirmationEmail(process.env.ADMIN_EMAIL, booking, 'admin');
    
    res.status(201).json({
      success: true,
      bookingId,
      message: 'Booking created successfully'
    });
    
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}