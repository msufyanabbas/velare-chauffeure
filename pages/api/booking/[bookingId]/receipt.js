// pages/api/booking/[bookingId]/receipt.js
import dbConnect from '../../../../lib/db';
import Booking from '../../../../models/Booking';
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
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=velare-receipt-${bookingId}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
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
         .fontSize(16)
         .font('Helvetica')
         .text('Luxury Chauffeur Service', margin, 70);
      
      // Add receipt info on the right - Fixed positioning
      const receiptInfoX = pageWidth - 250;
      doc.fillColor(colors.white)
         .fontSize(10)
         .font('Helvetica')
         .text(`Receipt #: ${booking.bookingId || booking._id}`, receiptInfoX, 45, { width: 200 })
      
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

    // Helper function to add bullet points
    const addBulletPoints = (title, points, startY) => {
      let y = startY;
      
      // Check if we need a new page for the section
      checkPageBreak(150);
      y = currentY;
      
      // Title
      doc.fillColor(colors.darkGray)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(title, margin, y);
      
      y += 25;
      
      // Underline
      doc.rect(margin, y, 180, 2)
         .fillColor(colors.gold)
         .fill();
      
      y += 20;
      
      // Bullet points
      points.forEach(point => {
        // Check for page break
        if (y + 40 > pageHeight - 100) {
          doc.addPage();
          y = 50;
        }
        
        // Calculate text height properly
        const textHeight = doc.heightOfString(point, { 
          width: contentWidth - 30, 
          fontSize: 11 
        });
        
        doc.fillColor(colors.black)
           .fontSize(11)
           .font('Helvetica')
           .text('•', margin, y)
           .text(point, margin + 20, y, { width: contentWidth - 30 });
        
        y += Math.max(textHeight + 5, 18);
      });
      
      return y + 20;
    };

    // Create header and get starting Y position
    currentY = createHeader();

    // Receipt title
    doc.fillColor(colors.darkGray)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('Booking Receipt', margin, currentY);
    
    currentY += 40;

    // Customer greeting
    const customerName = booking.customerName || booking.email.split('@')[0];
    doc.fillColor(colors.black)
       .fontSize(12)
       .font('Helvetica')
       .text(`Dear ${customerName},`, margin, currentY);
    
    currentY += 25;

    doc.fillColor(colors.textGray)
       .fontSize(11)
       .text('Thank you for booking with Velaré. Here are your booking details:', margin, currentY, { width: contentWidth });
    
    currentY += 35;

    // Booking Details Section
    const bookingDetails = [
      { label: 'Booking ID:', value: booking.bookingId || booking._id },
      { label: 'Service Date:', value: new Date(booking.date).toLocaleDateString('en-AU') },
      { label: 'Pickup Time:', value: booking.time },
      { label: 'Pickup Location:', value: booking.pickupAddress },
      { label: 'Drop-off Location:', value: booking.dropoffAddress },
      { label: 'Vehicle Type:', value: booking.vehicleType },
      { label: 'Passengers:', value: booking.passengers.toString() }
    ];

    currentY = addSection('Booking Details', bookingDetails, currentY);

    // Payment Details Section
    const paymentDetails = [
      { label: 'Total Amount:', value: `$${booking.totalPrice}` },
      { label: 'Payment Status:', value: booking.paymentStatus || 'Pending' }
    ];

    currentY = addSection('Payment Information', paymentDetails, currentY);

    // Contact Details Section
    const contactDetails = [
      { label: 'Email Address:', value: booking.email },
      { label: 'Phone Number:', value: booking.phoneNumber }
    ];

    currentY = addSection('Contact Information', contactDetails, currentY);

    // Footer message
    doc.fillColor(colors.textGray)
       .fontSize(11)
       .font('Helvetica')
       .text('If you have any questions or need to make changes to your booking, please don\'t hesitate to contact us.', 
              margin, currentY, { width: contentWidth });
    
    currentY += 25;

    doc.fillColor(colors.black)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('We look forward to providing you with exceptional service!', 
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

    // Footer content - Fixed width constraints
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
    console.error('Error generating receipt:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate receipt'
    });
  }
}