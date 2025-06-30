// emailTemplates.js

export const emailTemplates = {
  // Post-ride completion template
 postRideCompletion: (data) => ({
    subject: 'Action Required - Complete User Payment Processing',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px; color: #ffd700;">Ride Completed - Payment Action Required</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; color: #ccc;">User payment processing needed</p>
        </div>

        <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">Admin Action Required</h2>
          <p>A ride has been completed and requires final payment processing for the customer.</p>
          <p>The customer's payment method has been pre-authorized for the base fare. Please review and process any additional charges that occurred during the ride.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #ffd700; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Customer & Booking Details:</h3>
            <p><strong>Customer Email:</strong> ${data.email}</p>
            <p><strong>Customer Phone:</strong> ${data.phoneNumber}</p>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Date & Time:</strong> ${data.date} at ${data.time}</p>
            <p><strong>Route:</strong> ${data.pickupAddress} → ${data.dropoffAddress}</p>
            <p><strong>Vehicle Type:</strong> ${data.vehicleType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            <p><strong>Passengers:</strong> ${data.passengers}</p>
            <p><strong>Total Price:</strong> ${data.totalPrice}</p>
            <p><strong>Base Price:</strong> ${data.basePrice}</p>
            <p><strong>Payment Status:</strong> ${data.paymentStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            <p><strong>Payment Intent ID:</strong> ${data.paymentIntentId}</p>
            ${data.specialRequests ? `<p><strong>Special Requests:</strong> ${data.specialRequests}</p>` : ''}
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.postRideLink}" 
             style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); 
                    color: #000; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: bold; 
                    font-size: 16px;
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);">
            Process Final Payment
          </a>
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;"><strong>⏰ Important:</strong> Please process this payment within 7 days to avoid any issues with the customer's booking.</p>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666;">
          <p><strong>Admin Notes:</strong></p>
          <p>Use the link above to access the payment processing interface for this completed ride.</p>
          <p>This link will expire in 7 days for security purposes.</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
          <p>This is an automated admin notification. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    text: `
Admin Action Required - Ride Payment Processing

A ride has been completed and requires final payment processing for the customer.

The customer's payment method has been pre-authorized for the base fare. Please review and process any additional charges that occurred during the ride.

Customer & Booking Details:
- Customer Email: ${data.email}
- Customer Phone: ${data.phoneNumber}
- Booking ID: ${data.bookingId}
- Date & Time: ${data.date} at ${data.time}
- Route: ${data.pickupAddress} → ${data.dropoffAddress}
- Vehicle Type: ${data.vehicleType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
- Passengers: ${data.passengers}
- Total Price: ${data.totalPrice}
- Base Price: ${data.basePrice}
- Payment Status: ${data.paymentStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
${data.specialRequests ? `- Special Requests: ${data.specialRequests}` : ''}

Process the final payment here: ${data.postRideLink}

IMPORTANT: Please process this payment within 7 days to avoid any issues with the customer's booking.

Admin Notes:
Use the link above to access the payment processing interface for this completed ride.
This link will expire in 7 days for security purposes.

This is an automated admin notification. Please do not reply to this email.
    `
  }),

  // Customer booking confirmation template
  customerBookingConfirmation: (data) => ({
    subject: `Booking Confirmation - ${data.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffc107; font-size: 28px; margin: 0;">Velaré</h1>
          <p style="color: white; font-size: 18px; margin: 10px 0 0 0;">Luxury Chauffeur Service</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1a1a1a; margin-bottom: 20px;">Booking Confirmation</h2>
          
          <p>Dear ${data.email.split('@')[0]},</p>
          
          <p>Thank you for booking with Velaré. Your luxury chauffeur service has been confirmed.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Pickup:</strong> ${data.pickupAddress}</p>
            <p><strong>Drop-off:</strong> ${data.dropoffAddress}</p>
            <p><strong>Vehicle:</strong> ${data.vehicleType}</p>
            <p><strong>Passengers:</strong> ${data.passengers}</p>
            <p><strong>Total:</strong> $${data.totalPrice}</p>
          </div>
          
          <p>If you need to make any changes or have questions, please contact us at info@velarechauffeurs.com.au or call 1300 650 677</p>
          
          <p>Thank you for choosing Velaré.</p>
          
          <p style="margin-top: 30px; color: #666;">
            Best regards,<br>
            The Velaré Team
          </p>
        </div>
      </div>
    `
  }),

  // Admin booking notification template
  adminBookingNotification: (data) => ({
    subject: `New Booking Received - ${data.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffc107; font-size: 28px; margin: 0;">Velaré</h1>
          <p style="color: white; font-size: 18px; margin: 10px 0 0 0;">Luxury Chauffeur Service</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1a1a1a; margin-bottom: 20px;">New Booking Received</h2>
          
          <p>A new booking has been received and requires attention.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Customer Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phoneNumber}</p>
            <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Pickup:</strong> ${data.pickupAddress}</p>
            <p><strong>Drop-off:</strong> ${data.dropoffAddress}</p>
            <p><strong>Vehicle:</strong> ${data.vehicleType}</p>
            <p><strong>Trip Type:</strong> ${data.tripType}</p>
            <p><strong>Passengers:</strong> ${data.passengers}</p>
            <p><strong>Extra Services:</strong> ${data.extraServices || 'None'}</p>
            <p><strong>Special Requests:</strong> ${data.specialRequests || 'None'}</p>
            <p><strong>Total Price:</strong> $${data.totalPrice}</p>
            <p><strong>Status:</strong> ${data.status}</p>
          </div>
          
          <p>Please assign a driver and vehicle for this booking.</p>
          
          <p style="margin-top: 30px; color: #666;">
            Best regards,<br>
            The Velaré System
          </p>
        </div>
      </div>
    `
  }),

  // Password reset template
  passwordReset: (data) => ({
    subject: 'Password Reset Request - Velaré',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffc107; font-size: 28px; margin: 0;">Velaré</h1>
          <p style="color: white; font-size: 18px; margin: 10px 0 0 0;">Luxury Chauffeur Service</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1a1a1a; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p>Hello,</p>
          
          <p>We received a request to reset your password for your Velaré account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" style="background: #ffc107; color: #1a1a1a; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          
          <p>This link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request this password reset, please ignore this email.</p>
          
          <p style="margin-top: 30px; color: #666;">
            Best regards,<br>
            The Velaré Team
          </p>
        </div>
      </div>
    `
  }),

  // Booking cancellation template
  bookingCancellation: (data) => ({
    subject: `Booking Cancelled - ${data.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffc107; font-size: 28px; margin: 0;">Velaré</h1>
          <p style="color: white; font-size: 18px; margin: 10px 0 0 0;">Luxury Chauffeur Service</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1a1a1a; margin-bottom: 20px;">Booking Cancelled</h2>
          
          <p>Dear ${data.customerName || data.email.split('@')[0]},</p>
          
          <p>Your booking has been cancelled as requested.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Cancelled Booking Details</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Pickup:</strong> ${data.pickupAddress}</p>
            <p><strong>Drop-off:</strong> ${data.dropoffAddress}</p>
            ${data.refundAmount ? `<p><strong>Refund Amount:</strong> $${data.refundAmount}</p>` : ''}
          </div>
          
          ${data.refundAmount ? '<p>Your refund will be processed within 3-5 business days.</p>' : ''}
          
          <p>We hope to serve you again in the future.</p>
          
          <p style="margin-top: 30px; color: #666;">
            Best regards,<br>
            The Velaré Team
          </p>
        </div>
      </div>
    `
  }),

  // Driver assignment notification
  driverAssignment: (data) => ({
    subject: `Driver Assigned for Booking - ${data.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffc107; font-size: 28px; margin: 0;">Velaré</h1>
          <p style="color: white; font-size: 18px; margin: 10px 0 0 0;">Luxury Chauffeur Service</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1a1a1a; margin-bottom: 20px;">Driver Assigned</h2>
          
          <p>Dear ${data.customerName || data.email.split('@')[0]},</p>
          
          <p>Your chauffeur has been assigned for your upcoming trip.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Driver Details</h3>
            <p><strong>Driver Name:</strong> ${data.driverName}</p>
            <p><strong>Phone:</strong> ${data.driverPhone}</p>
            <p><strong>Vehicle:</strong> ${data.vehicleModel}</p>
            <p><strong>License Plate:</strong> ${data.licensePlate}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Trip Details</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Pickup:</strong> ${data.pickupAddress}</p>
          </div>
          
          <p>Your driver will contact you shortly before pickup.</p>
          
          <p style="margin-top: 30px; color: #666;">
            Best regards,<br>
            The Velaré Team
          </p>
        </div>
      </div>
    `
  }),

  // Booking receipt template
  bookingReceipt: (booking) => ({
    subject: `Booking Receipt - ${booking.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffc107; font-size: 28px; margin: 0;">Velaré</h1>
          <p style="color: white; font-size: 18px; margin: 10px 0 0 0;">Luxury Chauffeur Service</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1a1a1a; margin-bottom: 20px;">Booking Receipt</h2>
          
          <p>Dear ${booking.customerName || 'Valued Customer'},</p>
          
          <p>Thank you for your booking with Velaré Luxury Transportation. Here are your booking details:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Receipt Details</h3>
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            <p><strong>Date:</strong> ${booking.bookingDate}</p>
            <p><strong>Time:</strong> ${booking.bookingTime}</p>
            ${booking.pickupLocation ? `<p><strong>Pickup Location:</strong> ${booking.pickupLocation}</p>` : ''}
            ${booking.dropoffLocation ? `<p><strong>Dropoff Location:</strong> ${booking.dropoffLocation}</p>` : ''}
            ${booking.vehicleType ? `<p><strong>Vehicle Type:</strong> ${booking.vehicleType}</p>` : ''}
            ${booking.passengers ? `<p><strong>Passengers:</strong> ${booking.passengers}</p>` : ''}
            <p><strong>Total Amount:</strong> $${booking.totalAmount}</p>
          </div>
          
          <p><strong>Important Information:</strong></p>
          <ul>
            <li>Keep this receipt for your records</li>
          </ul>
          
          <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us.</p>
          
          <p>We look forward to providing you with exceptional service!</p>
          
          <p style="margin-top: 30px; color: #666;">
            Best regards,<br>
            The Velaré Team
          </p>
        </div>
      </div>
    `
  }),

  // Welcome email template
  welcome: (data) => ({
    subject: 'Welcome to Velaré - Luxury Chauffeur Service',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffc107; font-size: 28px; margin: 0;">Velaré</h1>
          <p style="color: white; font-size: 18px; margin: 10px 0 0 0;">Luxury Chauffeur Service</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1a1a1a; margin-bottom: 20px;">Welcome to Velaré!</h2>
          
          <p>Dear ${data.name || data.email.split('@')[0]},</p>
          
          <p>Welcome to Velaré, where luxury meets reliability. We're thrilled to have you join our exclusive clientele.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">What You Can Expect</h3>
            <ul style="color: #1a1a1a; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Premium luxury vehicles</li>
              <li>Professional, experienced chauffeurs</li>
              <li>24/7 customer support</li>
              <li>Flexible booking options</li>
              <li>Competitive pricing</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginLink || '#'}" style="background: #ffc107; color: #1a1a1a; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Book Your First Ride</a>
          </div>
          
          <p>If you have any questions, please don't hesitate to contact us at info@velarechauffeurs.com.au or call 1300 650 677</p>
          
          <p style="margin-top: 30px; color: #666;">
            Best regards,<br>
            The Velaré Team
          </p>
        </div>
      </div>
    `
  }),

  // Contact form notification template
  contactFormNotification: (data) => ({
    subject: `New Contact Form Submission - ${data.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffc107; font-size: 28px; margin: 0;">Velaré</h1>
          <p style="color: white; font-size: 18px; margin: 10px 0 0 0;">Luxury Chauffeur Service</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1a1a1a; margin-bottom: 20px;">New Contact Form Submission</h2>
          
          <p>A new contact form submission has been received.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Contact Details</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #1a1a1a;">${data.email}</a></p>
            <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Message</h3>
            <p style="color: #1a1a1a; line-height: 1.6; margin: 0;">${data.message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p>Received: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</p>
          
          <p style="margin-top: 30px; color: #666;">
            Best regards,<br>
            The Velaré System
          </p>
        </div>
      </div>
    `
  }),

  // Customer auto-reply template
  contactFormAutoReply: (data) => ({
    subject: 'Thank you for contacting Velaré Chauffeurs',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffc107; font-size: 28px; margin: 0;">Velaré</h1>
          <p style="color: white; font-size: 18px; margin: 10px 0 0 0;">Luxury Chauffeur Service</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1a1a1a; margin-bottom: 20px;">Thank You, ${data.name}</h2>
          
          <p>Dear ${data.name},</p>
          
          <p>Thank you for contacting Velaré Chauffeurs. We have received your inquiry and will respond within 24 hours.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Your Message</h3>
            <p style="color: #1a1a1a; line-height: 1.6; margin: 0; font-style: italic;">"${data.message.replace(/\n/g, '<br>')}"</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Contact Information</h3>
            <p><strong>Phone:</strong> <a href="tel:1300650677" style="color: #1a1a1a;">1300 650 677</a></p>
            <p><strong>Email:</strong> <a href="mailto:info@velarechauffeurs.com.au" style="color: #1a1a1a;">info@velarechauffeurs.com.au</a></p>
            <p><strong>Address:</strong><br>
            3/442-444 King Georges Road<br>
            Beverly Hills, NSW 2209<br>
            Australia</p>
          </div>
          
          <p>Your journey of luxury begins here.</p>
          
          <p style="margin-top: 30px; color: #666;">
            Best regards,<br>
            The Velaré Chauffeurs Team
          </p>
        </div>
      </div>
    `
  })
};