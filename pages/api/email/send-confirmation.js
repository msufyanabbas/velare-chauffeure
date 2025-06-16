export const sendConfirmationEmail = async (to, booking, type) => {
  const isAdmin = type === 'admin';
  
  const subject = isAdmin 
    ? `New Booking Received - ${booking.bookingId}`
    : `Booking Confirmation - ${booking.bookingId}`;
    
  const customerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffc107; font-size: 28px; margin: 0;">Velaré</h1>
        <p style="color: white; font-size: 18px; margin: 10px 0 0 0;">Luxury Chauffeur Service</p>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #1a1a1a; margin-bottom: 20px;">Booking Confirmation</h2>
        
        <p>Dear ${booking.email.split('@')[0]},</p>
        
        <p>Thank you for booking with Velaré. Your luxury chauffeur service has been confirmed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1a1a1a; margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.time}</p>
          <p><strong>Pickup:</strong> ${booking.pickupAddress}</p>
          <p><strong>Drop-off:</strong> ${booking.dropoffAddress}</p>
          <p><strong>Vehicle:</strong> ${booking.vehicleType}</p>
          <p><strong>Passengers:</strong> ${booking.passengers}</p>
          <p><strong>Total:</strong> $${booking.totalPrice}</p>
        </div>
        
        <p>Your chauffeur will arrive 15 minutes before the scheduled time. You will receive an SMS with the driver's details 1 hour before pickup.</p>
        
        <p>If you need to make any changes or have questions, please contact us at info@velare.com or call +1 (555) 123-4567.</p>
        
        <p>Thank you for choosing Velaré.</p>
        
        <p style="margin-top: 30px; color: #666;">
          Best regards,<br>
          The Velaré Team
        </p>
      </div>
    </div>
  `;
  
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Booking Received</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h3>Booking Details</h3>
        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
        <p><strong>Customer Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phoneNumber}</p>
        <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Pickup:</strong> ${booking.pickupAddress}</p>
        <p><strong>Drop-off:</strong> ${booking.dropoffAddress}</p>
        <p><strong>Vehicle:</strong> ${booking.vehicleType}</p>
        <p><strong>Trip Type:</strong> ${booking.tripType}</p>
        <p><strong>Passengers:</strong> ${booking.passengers}</p>
        <p><strong>Extra Services:</strong> ${booking.extraServices || 'None'}</p>
        <p><strong>Special Requests:</strong> ${booking.specialRequests || 'None'}</p>
        <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
      </div>
      
      <p>Please assign a driver and vehicle for this booking.</p>
    </div>
  `;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: isAdmin ? adminHtml : customerHtml,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};