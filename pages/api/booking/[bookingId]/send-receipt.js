// pages/api/booking/[bookingId]/send-receipt.js
import dbConnect from '../../../../lib/db';
import Booking from '../../../../models/Booking';
import emailService from '../../../../lib/email'; // Ensure this path is correct

export default async function handler(req, res) {
  const { bookingId } = req.query;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`
    });
  }

  try {
    await dbConnect();

    const booking = await Booking.findOne({ bookingId });

    console.log('booking is', booking);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const email = booking.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address' 
      });
    }

    // Format booking date and time
    const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const bookingTime = booking.time
      ? new Date(`2000-01-01T${booking.time}`).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Time not specified';

    // Define contactData to be used in the email template
    const contactData = {
      name: booking.name,
      bookingId: booking.bookingId,
      bookingDate,
      bookingTime,
      totalAmount: booking.totalPrice,
      vehicle: booking.vehicleType,
      pickup: booking.pickupLocation,
      dropoff: booking.dropoffLocation
    };

    // Send the templated email
    const info = await emailService.sendTemplatedEmail(
      email,
      'bookingReceipt',
      contactData,
      { from: process.env.EMAIL_USER }
    );

    // Update booking to mark receipt as sent
    await Booking.findOneAndUpdate(
      { bookingId },
      { 
        receiptSent: true,
        receiptSentAt: new Date()
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Receipt sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending receipt:', error);

    if (error.code === 'EAUTH') {
      return res.status(500).json({
        success: false,
        message: 'Email authentication failed. Please check your email credentials.'
      });
    } else if (error.code === 'ENOTFOUND') {
      return res.status(500).json({
        success: false,
        message: 'Email service not found. Please check your email configuration.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to send receipt',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
