// /api/booking/[id]/finalize.js
import dbConnect from '../../../../lib/db'; // Adjust path to your DB connection
import Booking from '../../../../models/Booking'; // Adjust path to your Booking model
import { sendCustomEmail, sendEmail, sendTemplatedEmail } from '../../../../lib/email'; // Add this import
import { emailTemplates } from '../../../../pages/api/email/templates'; // Add this import
import PDFDocument from 'pdfkit';

// Helper function to generate PDF receipt
async function generateReceiptPDF(booking) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });
      
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Define colors with better contrast
      const colors = {
        darkGray: '#2c2c2c',
        mediumGray: '#4a4a4a',
        gold: '#d4af37',
        white: '#ffffff',
        lightGray: '#f5f5f5',
        textGray: '#555555',
        black: '#000000',
        border: '#e0e0e0'
      };

      // Page dimensions
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 50;
      const contentWidth = pageWidth - (margin * 2);

      // Track current Y position throughout document
      let currentY = 0;

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredSpace = 100) => {
        if (currentY + requiredSpace > pageHeight - 100) {
          doc.addPage();
          currentY = 50;
          return true;
        }
        return false;
      };

      // Helper function to create professional header
      const createHeader = () => {
        // Header background
        doc.rect(0, 0, pageWidth, 120)
           .fillColor(colors.darkGray)
           .fill();
        
        // Company name in gold
        doc.fillColor(colors.gold)
           .fontSize(32)
           .font('Helvetica-Bold')
           .text('Velaré', margin, 30);
        
        // Tagline in white
        doc.fillColor(colors.white)
           .fontSize(14)
           .font('Helvetica-Oblique')
           .text('Arrive with intention, travel in elegance', margin, 70);
        
        // Add ABN info on the right
        const receiptInfoX = pageWidth - 250;
        doc.fillColor(colors.white)
           .fontSize(10)
           .font('Helvetica')
           .text(`ABN #: 60647254420`, receiptInfoX, 45, { width: 200 })
        
        // Add bottom border
        doc.rect(0, 120, pageWidth, 3)
           .fillColor(colors.gold)
           .fill();
        
        return 140; // Return Y position after header
      };

      // Helper function to add section with proper spacing
      const addSection = (title, items, startY) => {
        let y = startY;
        
        // Check if we need a new page for the section
        checkPageBreak(100);
        y = currentY;
        
        // Section title
        doc.fillColor(colors.darkGray)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text(title, margin, y);
        
        y += 25;
        
        // Underline
        doc.rect(margin, y, 150, 2)
           .fillColor(colors.gold)
           .fill();
        
        y += 20;
        
        // Items
        items.forEach(item => {
          // Check for page break before each item
          if (y + 25 > pageHeight - 100) {
            doc.addPage();
            y = 50;
          }
          
          // Label - Fixed width and positioning
          doc.fillColor(colors.textGray)
             .fontSize(11)
             .font('Helvetica')
             .text(item.label, margin, y, { width: 130 });
          
          // Value - Fixed positioning and width
          doc.fillColor(colors.black)
             .fontSize(11)
             .font('Helvetica-Bold')
             .text(item.value, margin + 140, y, { width: contentWidth - 140 });
          
          y += 20;
        });
        
        return y + 15; // Return next Y position with spacing
      };

      // Create header and get starting Y position
      currentY = createHeader();

      // Receipt title
      doc.fillColor(colors.darkGray)
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('Final Receipt', margin, currentY);
      
      currentY += 40;

      // Customer greeting
      const customerName = booking.customerName || booking.email.split('@')[0];
      doc.fillColor(colors.black)
         .fontSize(12)
         .font('Helvetica')
         .text(`Dear Customer,`, margin, currentY);
      
      currentY += 25;

      doc.fillColor(colors.textGray)
         .fontSize(11)
         .text('Thank you for choosing Velaré. Here is your final receipt with completed service details:', margin, currentY, { width: contentWidth });
      
      currentY += 35;

      // Booking Details Section
      const bookingDetails = [
        { label: 'Booking ID:', value: booking.bookingId || booking._id },
        { label: 'Service Date:', value: new Date(booking.date).toLocaleDateString('en-AU') },
        { label: 'Pickup Time:', value: booking.time },
        { label: 'Pickup Location:', value: booking.pickupAddress },
        { label: 'Drop-off Location:', value: booking.dropoffAddress },
        { label: 'Vehicle Type:', value: booking.vehicleType },
        { label: 'Passengers:', value: booking.passengers.toString() },
        { label: 'Service Completed:', value: new Date(booking.completedAt).toLocaleString('en-AU') }
      ];

      currentY = addSection('Service Details', bookingDetails, currentY);

      // Payment Breakdown Section
      const paymentDetails = [
        { label: 'Base Fare:', value: `$${booking.totalPrice}` }
      ];

      // Add additional charges if any exist
      if (booking.additionalCharges) {
        if (booking.additionalCharges.extraStops > 0) {
          paymentDetails.push({ label: 'Extra Stops:', value: `$${booking.additionalCharges.extraStops}` });
        }
        if (booking.additionalCharges.waitingTime > 0) {
          paymentDetails.push({ label: 'Waiting Time:', value: `$${booking.additionalCharges.waitingTime}` });
        }
        if (booking.additionalCharges.tolls > 0) {
          paymentDetails.push({ label: 'Tolls:', value: `$${booking.additionalCharges.tolls}` });
        }
        if (booking.additionalCharges.extraServices > 0) {
          paymentDetails.push({ label: 'Extra Services:', value: `$${booking.additionalCharges.extraServices}` });
        }
        if (booking.additionalCharges.other > 0) {
          paymentDetails.push({ label: 'Other Charges:', value: `$${booking.additionalCharges.other}` });
        }
      }

      // Add custom charge description if exists
      if (booking.customChargeDescription) {
        paymentDetails.push({ label: 'Additional Details:', value: booking.customChargeDescription });
      }

      // Add final total and payment status
      paymentDetails.push(
        { label: 'TOTAL AMOUNT:', value: `$${booking.finalTotal}` },
        { label: 'Payment Status:', value: booking.paymentStatus || 'Completed' }
      );

      currentY = addSection('Payment Breakdown', paymentDetails, currentY);

      // Contact Details Section
      const contactDetails = [
        { label: 'Email Address:', value: booking.email },
        { label: 'Phone Number:', value: booking.phoneNumber }
      ];

      currentY = addSection('Contact Information', contactDetails, currentY);

      // Thank you message
      checkPageBreak(80);
      currentY = Math.max(currentY, currentY);

      doc.fillColor(colors.textGray)
         .fontSize(11)
         .font('Helvetica')
         .text('Thank you for choosing Velaré for your transportation needs. We hope you enjoyed our service and look forward to serving you again.', 
                margin, currentY, { width: contentWidth });
      
      currentY += 25;

      doc.fillColor(colors.black)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('We appreciate your business!', 
                margin, currentY, { width: contentWidth });
      
      currentY += 30;

      // Signature
      doc.fillColor(colors.textGray)
         .fontSize(11)
         .font('Helvetica')
         .text('Best regards,', margin, currentY);
      
      currentY += 15;
      
      doc.fillColor(colors.darkGray)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('The Velaré Team', margin, currentY);

      // Footer - always at bottom of current page
      const footerY = Math.max(currentY + 50, pageHeight - 80);
      
      // Footer separator line
      doc.rect(margin, footerY - 20, contentWidth, 1)
         .fillColor(colors.border)
         .fill();

      // Footer content
      doc.fillColor(colors.darkGray)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Velaré Luxury Chauffeur Service', margin, footerY, { 
           align: 'center', 
           width: contentWidth 
         });

      doc.fillColor(colors.textGray)
         .fontSize(10)
         .font('Helvetica')
         .text('Email: info@velarechauffeurs.com.au  •  Phone: 1300 650 677', 
                margin, footerY + 15, { 
                  align: 'center', 
                  width: contentWidth 
                });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

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
      
      // Send receipt email to customer with PDF attachment
      if (updatedBooking.email) {
        console.log('📄 Generating PDF receipt...');
        
        // Generate PDF receipt
        const pdfBuffer = await generateReceiptPDF(updatedBooking);
        console.log('✅ PDF receipt generated successfully');

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
        
        // Send email with PDF attachment
        await sendCustomEmail(
          updatedBooking.email, 
          customerEmail.subject, 
          customerEmail.html,
          {
            attachments: [
              {
                filename: `velare-receipt-${updatedBooking.bookingId}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ]
          }
        );
        console.log('✅ Customer receipt email sent with PDF attachment to:', updatedBooking.email);
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