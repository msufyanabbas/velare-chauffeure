// emailTemplates.js

export const emailTemplates = {
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
          
          <p>Your chauffeur will arrive 15 minutes before the scheduled time. You will receive an SMS with the driver's details 1 hour before pickup.</p>
          
          <p>If you need to make any changes or have questions, please contact us at info@velare.com or call +1 (555) 123-4567.</p>
          
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
        <h2>New Booking Received</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h3>Booking Details</h3>
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
  bookingReceipt: (booking) => ({
      subject: `Booking Receipt - ${booking.bookingId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .booking-details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .detail-row:last-child {
              border-bottom: none;
              font-weight: bold;
              font-size: 1.1em;
            }
            .label {
              font-weight: bold;
              color: #555;
            }
            .value {
              color: #333;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 0.9em;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Velaré</div>
            <div>Luxury Transportation</div>
            <p>Thank you for choosing our premium service!</p>
          </div>
          
          <div class="content">
            <h2>Booking Receipt</h2>
            <p>Dear ${booking.customerName || 'Valued Customer'},</p>
            <p>Thank you for your booking with Velaré Luxury Transportation. Here are your booking details:</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="label">Booking ID:</span>
                <span class="value">${booking.bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${booking.bookingDate}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${booking.bookingTime}</span>
              </div>
              ${booking.pickupLocation ? `
              <div class="detail-row">
                <span class="label">Pickup Location:</span>
                <span class="value">${booking.pickupLocation}</span>
              </div>` : ''}
              ${booking.dropoffLocation ? `
              <div class="detail-row">
                <span class="label">Dropoff Location:</span>
                <span class="value">${booking.dropoffLocation}</span>
              </div>` : ''}
              ${booking.vehicleType ? `
              <div class="detail-row">
                <span class="label">Vehicle Type:</span>
                <span class="value">${booking.vehicleType}</span>
              </div>` : ''}
              ${booking.passengers ? `
              <div class="detail-row">
                <span class="label">Passengers:</span>
                <span class="value">${booking.passengers}</span>
              </div>` : ''}
              <div class="detail-row">
                <span class="label">Total Amount: </span>
                <span class="value">$${booking.totalAmount}</span>
              </div>
            </div>
            
            <p><strong>Important Information:</strong></p>
            <ul>
              <li>Please arrive 10 minutes before your scheduled pickup time</li>
              <li>Our driver will contact you 15 minutes before arrival</li>
              <li>For any changes or cancellations, please contact us at least 24 hours in advance</li>
              <li>Keep this receipt for your records</li>
            </ul>
            
            <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us.</p>
            
            <p>We look forward to providing you with exceptional service!</p>
            
            <div class="footer">
              <p><strong>Velaré Luxury Transportation</strong></p>
              <p>Phone: ${process.env.COMPANY_PHONE || '(555) 123-4567'} | Email: ${process.env.COMPANY_EMAIL || 'info@velare.com'}</p>
              <p>Website: ${process.env.COMPANY_WEBSITE || 'www.velare.com'}</p>
            </div>
          </div>
        </body>
        </html>
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
          
          <p>As a member of the Velaré family, you can expect:</p>
          
          <ul style="color: #1a1a1a; line-height: 1.6;">
            <li>Premium luxury vehicles</li>
            <li>Professional, experienced chauffeurs</li>
            <li>24/7 customer support</li>
            <li>Flexible booking options</li>
            <li>Competitive pricing</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginLink || '#'}" style="background: #ffc107; color: #1a1a1a; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Book Your First Ride</a>
          </div>
          
          <p>If you have any questions, please don't hesitate to contact us at info@velare.com or call +1 (555) 123-4567.</p>
          
          <p style="margin-top: 30px; color: #666;">
            Best regards,<br>
            The Velaré Team
          </p>
        </div>
      </div>
    `
  }),
  contactFormNotification: (data) => ({
    subject: `New Contact Form Submission - ${data.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); min-height: 100vh;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="650" style="max-width: 650px; background: linear-gradient(145deg, #2a2a2a 0%, #1e1e1e 100%); border: 2px solid #d4af37; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.8);">
                
                <!-- Elegant Header with Gold Accent -->
                <tr>
                  <td style="padding: 0; position: relative; background: linear-gradient(90deg, #d4af37 0%, #f4e58c 100%); border-top-left-radius: 10px; border-top-right-radius: 10px;">
                    <div style="background: rgba(26,26,26,0.95); padding: 40px; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px; border-bottom: 3px solid #d4af37;">
                      <h1 style="margin: 0; font-size: 32px; font-weight: 300; color: #d4af37; letter-spacing: 3px; text-transform: uppercase; font-family: 'Georgia', serif;">
                        VELARÉ
                      </h1>
                      <div style="width: 60px; height: 2px; background: #d4af37; margin: 12px auto; opacity: 0.8;"></div>
                      <p style="margin: 8px 0 0 0; font-size: 16px; color: #cccccc; letter-spacing: 1px; font-style: italic;">
                        CHAUFFEURS
                      </p>
                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #999999; font-family: 'Arial', sans-serif; font-weight: 300;">
                        New Contact Form Submission
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Luxury Content Area -->
                <tr>
                  <td style="padding: 50px 40px; background: linear-gradient(145deg, #2a2a2a 0%, #1e1e1e 100%);">
                    
                    <!-- Contact Information with Gold Accents -->
                    <div style="background: rgba(42,42,42,0.6); border: 1px solid #444444; border-radius: 8px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #d4af37;">
                      <h2 style="margin: 0 0 25px 0; font-size: 18px; color: #d4af37; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; font-family: 'Georgia', serif;">
                        Contact Details
                      </h2>
                      
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 12px 0; width: 100px; vertical-align: top;">
                            <div style="display: inline-block; width: 8px; height: 8px; background: #d4af37; border-radius: 50%; margin-right: 12px; margin-top: 6px;"></div>
                            <strong style="color: #d4af37; font-weight: 500; font-size: 14px; font-family: 'Arial', sans-serif;">Name:</strong>
                          </td>
                          <td style="padding: 12px 0; color: #ffffff; font-size: 16px; font-family: 'Georgia', serif;">
                            ${data.name}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; vertical-align: top;">
                            <div style="display: inline-block; width: 8px; height: 8px; background: #d4af37; border-radius: 50%; margin-right: 12px; margin-top: 6px;"></div>
                            <strong style="color: #d4af37; font-weight: 500; font-size: 14px; font-family: 'Arial', sans-serif;">Email:</strong>
                          </td>
                          <td style="padding: 12px 0; color: #ffffff; font-size: 16px; font-family: 'Georgia', serif;">
                            <a href="mailto:${data.email}" style="color: #ffffff; text-decoration: none; border-bottom: 1px solid #d4af37;">${data.email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; vertical-align: top;">
                            <div style="display: inline-block; width: 8px; height: 8px; background: #d4af37; border-radius: 50%; margin-right: 12px; margin-top: 6px;"></div>
                            <strong style="color: #d4af37; font-weight: 500; font-size: 14px; font-family: 'Arial', sans-serif;">Phone:</strong>
                          </td>
                          <td style="padding: 12px 0; color: #ffffff; font-size: 16px; font-family: 'Georgia', serif;">
                            ${data.phone || 'Not provided'}
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Message Section with Luxury Styling -->
                    <div style="background: rgba(26,26,26,0.8); border: 1px solid #444444; border-radius: 8px; padding: 30px; border-left: 4px solid #d4af37;">
                      <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #d4af37; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; font-family: 'Georgia', serif;">
                        Message
                      </h3>
                      <div style="color: #e0e0e0; line-height: 1.8; font-size: 16px; font-family: 'Georgia', serif; font-style: italic; padding: 20px; background: rgba(42,42,42,0.4); border-radius: 6px; border-left: 3px solid #d4af37;">
                        ${data.message.replace(/\n/g, '<br>')}
                      </div>
                    </div>

                  </td>
                </tr>

                <!-- Elegant Footer -->
                <tr>
                  <td style="padding: 30px 40px; background: linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%); border-top: 2px solid #d4af37; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; text-align: center;">
                    <div style="border-top: 1px solid #444444; padding-top: 20px;">
                      <p style="margin: 0; color: #999999; font-size: 13px; font-family: 'Arial', sans-serif;">
                        <span style="color: #d4af37;">●</span> Received: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })} <span style="color: #d4af37;">●</span>
                      </p>
                      <p style="margin: 10px 0 0 0; color: #666666; font-size: 12px; font-family: 'Arial', sans-serif; font-style: italic;">
                        Premium Chauffeur Services • Sydney, Australia
                      </p>
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  // Customer auto-reply template
  contactFormAutoReply: (data) => ({
    subject: 'Thank you for contacting Velaré Chauffeurs',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank you for contacting Velaré Chauffeurs</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); min-height: 100vh;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="650" style="max-width: 650px; background: linear-gradient(145deg, #2a2a2a 0%, #1e1e1e 100%); border: 2px solid #d4af37; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.8);">
                
                <!-- Luxury Header -->
                <tr>
                  <td style="padding: 0; position: relative; background: linear-gradient(90deg, #d4af37 0%, #f4e58c 100%); border-top-left-radius: 10px; border-top-right-radius: 10px;">
                    <div style="background: rgba(26,26,26,0.95); padding: 50px 40px; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px; border-bottom: 3px solid #d4af37;">
                      <h1 style="margin: 0; font-size: 38px; font-weight: 300; color: #d4af37; letter-spacing: 4px; text-transform: uppercase; font-family: 'Georgia', serif;">
                        VELARÉ
                      </h1>
                      <div style="width: 80px; height: 3px; background: linear-gradient(90deg, #d4af37 0%, #f4e58c 100%); margin: 15px auto; border-radius: 2px;"></div>
                      <p style="margin: 8px 0 0 0; font-size: 18px; color: #cccccc; letter-spacing: 2px; font-style: italic;">
                        CHAUFFEURS
                      </p>
                      <p style="margin: 25px 0 0 0; font-size: 15px; color: #999999; font-family: 'Arial', sans-serif; font-weight: 300; letter-spacing: 0.5px;">
                        Premium Chauffeur Services
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Elegant Thank You Section -->
                <tr>
                  <td style="padding: 50px 40px; background: linear-gradient(145deg, #2a2a2a 0%, #1e1e1e 100%);">
                    
                    <!-- Personalized Thank You -->
                    <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: rgba(42,42,42,0.6); border-radius: 8px; border: 1px solid #444444;">
                      <div style="width: 60px; height: 60px; margin: 0 auto 20px; background: linear-gradient(45deg, #d4af37, #f4e58c); border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative;">
                        <div style="width: 24px; height: 2px; background: #1a1a1a; position: absolute; transform: rotate(45deg);"></div>
                        <div style="width: 12px; height: 2px; background: #1a1a1a; position: absolute; transform: rotate(45deg) translate(-6px, 6px);"></div>
                      </div>
                      <h2 style="margin: 0 0 15px 0; font-size: 28px; font-weight: 300; color: #d4af37; letter-spacing: 1px; font-family: 'Georgia', serif;">
                        Thank You, ${data.name}
                      </h2>
                      <div style="width: 40px; height: 1px; background: #d4af37; margin: 0 auto 20px; opacity: 0.7;"></div>
                      <p style="margin: 0; color: #e0e0e0; font-size: 17px; line-height: 1.6; font-family: 'Georgia', serif;">
                        We have received your inquiry and will respond within 24 hours.
                      </p>
                      <p style="margin: 15px 0 0 0; color: #cccccc; font-size: 15px; font-style: italic; font-family: 'Georgia', serif;">
                        Your journey of luxury begins here.
                      </p>
                    </div>

                    <!-- Message Summary with Luxury Border -->
                    <div style="background: rgba(26,26,26,0.8); border: 1px solid #444444; border-radius: 8px; padding: 30px; margin-bottom: 40px; border-left: 4px solid #d4af37; position: relative;">
                      <div style="position: absolute; top: -1px; right: -1px; width: 20px; height: 20px; background: #d4af37; clip-path: polygon(0 0, 100% 0, 100% 100%);"></div>
                      <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 400; color: #d4af37; text-transform: uppercase; letter-spacing: 1.5px; font-family: 'Arial', sans-serif;">
                        Your Message
                      </h3>
                      <div style="padding: 20px; background: rgba(42,42,42,0.4); border-radius: 6px; border-left: 3px solid #d4af37;">
                        <p style="margin: 0; color: #e0e0e0; line-height: 1.8; font-size: 16px; font-family: 'Georgia', serif; font-style: italic;">
                          "${data.message.replace(/\n/g, '<br>')}"
                        </p>
                      </div>
                    </div>

                    <!-- Contact Information with Luxury Styling -->
                    <div style="background: rgba(42,42,42,0.6); border: 1px solid #444444; border-radius: 8px; padding: 35px; margin-bottom: 30px;">
                      <h3 style="margin: 0 0 25px 0; font-size: 20px; font-weight: 300; color: #d4af37; letter-spacing: 1px; text-align: center; font-family: 'Georgia', serif;">
                        Contact Information
                      </h3>
                      <div style="width: 50px; height: 1px; background: #d4af37; margin: 0 auto 30px; opacity: 0.7;"></div>
                      
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 15px 0; width: 120px; vertical-align: top;">
                            <div style="display: inline-block; width: 10px; height: 10px; background: #d4af37; border-radius: 50%; margin-right: 15px; margin-top: 4px;"></div>
                            <strong style="color: #d4af37; font-size: 15px; font-family: 'Arial', sans-serif; font-weight: 500;">Phone:</strong>
                          </td>
                          <td style="padding: 15px 0; color: #ffffff; font-size: 16px; font-family: 'Georgia', serif;">
                            <a href="tel:1300650677" style="color: #ffffff; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.3s;">1300 650 677</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 15px 0; vertical-align: top;">
                            <div style="display: inline-block; width: 10px; height: 10px; background: #d4af37; border-radius: 50%; margin-right: 15px; margin-top: 4px;"></div>
                            <strong style="color: #d4af37; font-size: 15px; font-family: 'Arial', sans-serif; font-weight: 500;">Email:</strong>
                          </td>
                          <td style="padding: 15px 0; color: #ffffff; font-size: 16px; font-family: 'Georgia', serif;">
                            <a href="mailto:info@velarechauffeurs.com.au" style="color: #ffffff; text-decoration: none; border-bottom: 1px solid #d4af37;">info@velarechauffeurs.com.au</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 15px 0; vertical-align: top;">
                            <div style="display: inline-block; width: 10px; height: 10px; background: #d4af37; border-radius: 50%; margin-right: 15px; margin-top: 4px;"></div>
                            <strong style="color: #d4af37; font-size: 15px; font-family: 'Arial', sans-serif; font-weight: 500;">Address:</strong>
                          </td>
                          <td style="padding: 15px 0; color: #ffffff; font-size: 16px; line-height: 1.6; font-family: 'Georgia', serif;">
                            3/442-444 King Georges Road<br>
                            Beverly Hills, NSW 2209<br>
                            Australia
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Professional Closing with Signature -->
                    <div style="text-align: center; padding: 30px; background: rgba(26,26,26,0.6); border-radius: 8px; border: 1px solid #444444;">
                      <div style="margin-bottom: 20px;">
                        <div style="width: 60px; height: 1px; background: #d4af37; margin: 0 auto; opacity: 0.5;"></div>
                      </div>
                      <p style="margin: 0 0 15px 0; color: #e0e0e0; font-size: 17px; font-family: 'Georgia', serif;">
                        Best regards,
                      </p>
                      <p style="margin: 0; color: #d4af37; font-size: 19px; font-weight: 400; letter-spacing: 1px; font-family: 'Georgia', serif;">
                        The Velaré Chauffeurs Team
                      </p>
                      <div style="margin-top: 20px;">
                        <div style="width: 60px; height: 1px; background: #d4af37; margin: 0 auto; opacity: 0.5;"></div>
                      </div>
                    </div>

                  </td>
                </tr>

                <!-- Luxury Footer -->
                <tr>
                  <td style="padding: 35px 40px; background: linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%); border-top: 2px solid #d4af37; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; text-align: center;">
                    <div style="border-top: 1px solid #444444; padding-top: 25px;">
                      <p style="margin: 0 0 10px 0; color: #d4af37; font-size: 14px; font-family: 'Georgia', serif; font-style: italic; letter-spacing: 0.5px;">
                        "Arrive with Intention. Travel in Elegance."
                      </p>
                      <p style="margin: 0; color: #888888; font-size: 12px; font-family: 'Arial', sans-serif;">
                        © ${new Date().getFullYear()} Velaré Chauffeurs. All rights reserved.
                      </p>
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  })
};