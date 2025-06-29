// /api/booking/[id]/finalize.js
import dbConnect from '../../../../lib/db'; // Adjust path to your DB connection
import Booking from '../../../../models/Booking'; // Adjust path to your Booking model
import { sendCustomEmail, sendEmail, sendTemplatedEmail } from '../../../../lib/email'; // Add this import
import { emailTemplates } from '../../../../pages/api/email/templates'; // Add this import

export default async function handler(req, res) {
  console.log('=== FINALIZE ENDPOINT CALLED ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    await dbConnect();
    console.log('✅ Database connected');

    const { bookingId: bookingId } = req.query;
    const {
      additionalCharges,
      finalTotal,
      paymentStatus,
      customChargeDescription
    } = req.body;

    console.log('📋 Extracted data:');
    console.log('  bookingId:', bookingId);
    console.log('  additionalCharges:', additionalCharges);
    console.log('  finalTotal:', finalTotal);
    console.log('  paymentStatus:', paymentStatus);
    console.log('  customChargeDescription:', customChargeDescription);

    // Validation
    if (!bookingId) {
      console.log('❌ Missing bookingId');
      return res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
    }

    if (!finalTotal || isNaN(finalTotal)) {
      console.log('❌ Invalid finalTotal:', finalTotal);
      return res.status(400).json({
        success: false,
        error: 'Invalid final total amount'
      });
    }

    if (!additionalCharges || typeof additionalCharges !== 'object') {
      console.log('❌ Invalid additionalCharges:', additionalCharges);
      return res.status(400).json({
        success: false,
        error: 'Invalid additional charges data'
      });
    }

    console.log('✅ Validation passed');

    // Find booking by MongoDB _id (not bookingId field)
    // Your frontend is passing the MongoDB _id as the bookingId parameter
    let existingBooking = await Booking.findOne({bookingId: bookingId});
    if (!existingBooking) {
      console.log('❌ Booking not found with _id:', bookingId);
      
      // If not found by _id, try finding by bookingId field
      const bookingByBookingId = await Booking.findOne({ bookingId: bookingId });
      if (!bookingByBookingId) {
        console.log('❌ Booking not found with bookingId field either:', bookingId);
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
      }
      
      // Update the booking reference
      existingBooking = bookingByBookingId;
      console.log('✅ Booking found by bookingId field:', existingBooking._id);
    } else {
      console.log('✅ Booking found by _id:', existingBooking._id);
    }

    // Prepare update data
    const updateData = {
      additionalCharges: {
        extraStops: additionalCharges.extraStops || 0,
        waitingTime: additionalCharges.waitingTime || 0,
        tolls: additionalCharges.tolls || 0,
        extraServices: additionalCharges.extraServices || 0,
        other: additionalCharges.other || 0
      },
      finalTotal,
      paymentStatus,
      customChargeDescription: customChargeDescription || '',
      completedAt: new Date(),
      status: 'completed' // Update the booking status to completed
    };

    console.log('💾 Updating booking with data:', updateData);

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      existingBooking._id,
      updateData,
      { 
        new: true, // Return the updated document
        runValidators: true // Run mongoose validators
      }
    );

    if (!updatedBooking) {
      console.log('❌ Failed to update booking');
      return res.status(500).json({
        success: false,
        error: 'Failed to update booking in database'
      });
    }

    console.log('✅ Booking updated successfully:', updatedBooking._id);
    console.log('Updated booking data:', {
      _id: updatedBooking._id,
      bookingId: updatedBooking.bookingId,
      finalTotal: updatedBooking.finalTotal,
      paymentStatus: updatedBooking.paymentStatus,
      status: updatedBooking.status,
      additionalCharges: updatedBooking.additionalCharges
    });

    // Send completion emails after successful payment
    try {
      console.log('📧 Sending completion emails...');
      
      // Send receipt email to customer
      if (updatedBooking.email) {
        const receiptEmailData = {
          bookingId: updatedBooking.bookingId,
          customerName: updatedBooking.customerName || updatedBooking.email.split('@')[0],
          bookingDate: updatedBooking.date ? new Date(updatedBooking.date).toLocaleDateString() : 'N/A',
          bookingTime: updatedBooking.time || 'N/A',
          pickupLocation: updatedBooking.pickupAddress || 'N/A',
          dropoffLocation: updatedBooking.dropoffAddress || 'N/A',
          vehicleType: updatedBooking.vehicleType || 'N/A',
          passengers: updatedBooking.passengers || 'N/A',
          totalAmount: updatedBooking.finalTotal,
          additionalCharges: updatedBooking.additionalCharges,
          customChargeDescription: updatedBooking.customChargeDescription,
          paymentStatus: updatedBooking.paymentStatus
        };

        const customerEmail = emailTemplates.bookingReceipt(receiptEmailData);
        await sendCustomEmail(updatedBooking.email, customerEmail.subject, customerEmail.html);
        console.log('✅ Customer receipt email sent to:', updatedBooking.email);
      }

      // Send notification to admin
      if (process.env.ADMIN_EMAIL) {
        const adminNotificationData = {
          bookingId: updatedBooking.bookingId,
          customerEmail: updatedBooking.email,
          customerName: updatedBooking.customerName || updatedBooking.email?.split('@')[0] || 'N/A',
          finalTotal: updatedBooking.finalTotal,
          paymentStatus: updatedBooking.paymentStatus,
          additionalCharges: updatedBooking.additionalCharges,
          customChargeDescription: updatedBooking.customChargeDescription,
          completedAt: updatedBooking.completedAt
        };

        // Create a custom admin notification for booking completion
        const adminEmail = {
          subject: `Booking Completed & Paid - ${updatedBooking.bookingId}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffc107; font-size: 28px; margin: 0;">Velaré</h1>
                <p style="color: white; font-size: 18px; margin: 10px 0 0 0;">Luxury Chauffeur Service</p>
              </div>
              
              <div style="padding: 30px; background: white;">
                <h2 style="color: #1a1a1a; margin-bottom: 20px;">Booking Completed & Payment Finalized</h2>
                
                <p>A booking has been completed and final payment has been processed.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1a1a1a; margin-top: 0;">Booking Details</h3>
                  <p><strong>Booking ID:</strong> ${adminNotificationData.bookingId}</p>
                  <p><strong>Customer:</strong> ${adminNotificationData.customerName}</p>
                  <p><strong>Customer Email:</strong> ${adminNotificationData.customerEmail}</p>
                  <p><strong>Final Total:</strong> $${adminNotificationData.finalTotal}</p>
                  <p><strong>Payment Status:</strong> ${adminNotificationData.paymentStatus}</p>
                  <p><strong>Completed At:</strong> ${new Date(adminNotificationData.completedAt).toLocaleString()}</p>
                </div>
                
                ${adminNotificationData.additionalCharges && (
                  Object.values(adminNotificationData.additionalCharges).some(charge => charge > 0) ||
                  adminNotificationData.customChargeDescription
                ) ? `
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="color: #856404; margin-top: 0;">Additional Charges Applied</h3>
                  ${adminNotificationData.additionalCharges.extraStops > 0 ? `<p><strong>Extra Stops:</strong> $${adminNotificationData.additionalCharges.extraStops}</p>` : ''}
                  ${adminNotificationData.additionalCharges.waitingTime > 0 ? `<p><strong>Waiting Time:</strong> $${adminNotificationData.additionalCharges.waitingTime}</p>` : ''}
                  ${adminNotificationData.additionalCharges.tolls > 0 ? `<p><strong>Tolls:</strong> $${adminNotificationData.additionalCharges.tolls}</p>` : ''}
                  ${adminNotificationData.additionalCharges.extraServices > 0 ? `<p><strong>Extra Services:</strong> $${adminNotificationData.additionalCharges.extraServices}</p>` : ''}
                  ${adminNotificationData.additionalCharges.other > 0 ? `<p><strong>Other:</strong> $${adminNotificationData.additionalCharges.other}</p>` : ''}
                  ${adminNotificationData.customChargeDescription ? `<p><strong>Description:</strong> ${adminNotificationData.customChargeDescription}</p>` : ''}
                </div>
                ` : ''}
                
                <p style="margin-top: 30px; color: #666;">
                  Best regards,<br>
                  The Velaré System
                </p>
              </div>
            </div>
          `
        };

        await sendCustomEmail(process.env.ADMIN_EMAIL, adminEmail.subject, adminEmail.html);
        console.log('✅ Admin notification email sent to:', process.env.ADMIN_EMAIL);
      }

    } catch (emailError) {
      console.error('❌ Error sending completion emails:', emailError);
      // Don't fail the entire request if email sending fails
      // The booking update was successful, so we still return success
      console.log('⚠️ Booking finalized successfully but email sending failed');
    }

    const successResponse = {
      success: true,
      message: 'Booking finalized successfully',
      bookingId: updatedBooking._id,
      finalTotal: updatedBooking.finalTotal,
      booking: updatedBooking
    };

    console.log('📤 Sending success response');

    res.status(200).json(successResponse);

  } catch (error) {
    console.error('❌ Booking finalization error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific MongoDB/Mongoose errors
    let errorMessage = 'Failed to finalize booking';
    let statusCode = 500;

    if (error.name === 'ValidationError') {
      errorMessage = 'Validation failed: ' + Object.values(error.errors).map(e => e.message).join(', ');
      statusCode = 400;
      console.log('Validation errors:', error.errors);
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid booking ID format';
      statusCode = 400;
      console.log('Cast error details:', error);
    } else if (error.code === 11000) {
      errorMessage = 'Duplicate key error';
      statusCode = 409;
      console.log('Duplicate key error:', error);
    }
    
    const errorResponse = {
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 Sending error response:', errorResponse);
    
    res.status(statusCode).json(errorResponse);
  }
}