// pages/api/booking/[bookingId]/receipt.js
import  dbConnect  from '../../../../lib/db';
import Booking from '../../../../models/Booking';
// You may need to install: npm install pdfkit
import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
  const { bookingId } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`
    });
  }

  try {
    await dbConnect();
    
    const booking = await Booking.findOne({bookingId: bookingId});
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Create PDF receipt
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=velari-receipt-${bookingId}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    console.log('booking is ', booking);
    // Add content to PDF
    doc.fontSize(20).text('Velaré Luxury Transportation', 50, 50);
    doc.fontSize(16).text('Booking Receipt', 50, 80);
    
    doc.fontSize(12).text(`Booking ID: ${booking._id}`, 50, 120);
    doc.text(`Date: ${new Date(booking.date).toLocaleDateString()}`, 50, 140);
    doc.text(`Time: ${booking.time}`, 50, 160);
    doc.text(`Vehicle: ${booking.vehicleType}`, 50, 180);
    doc.text(`Passengers: ${booking.passengers}`, 50, 200);
    
    doc.text(`Pickup: ${booking.pickupAddress}`, 50, 240);
    doc.text(`Drop-off: ${booking.dropoffAddress}`, 50, 260);
    
    doc.text(`Email: ${booking.email}`, 50, 300);
    doc.text(`Phone: ${booking.phoneNumber}`, 50, 320);
    
    doc.text(`Total Amount: $${booking.totalPrice}`, 50, 360);
    doc.text(`Payment Status: ${booking.paymentStatus}`, 50, 380);
    
    doc.end();

  } catch (error) {
    console.error('Error generating receipt:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate receipt'
    });
  }
}