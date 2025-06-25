import nodemailer from 'nodemailer';
import { emailTemplates } from '../pages/api/email/templates';

class EmailService {
  constructor() {
    // Hostinger SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.EMAIL_PORT) || 465, // Use 465 for SSL or 587 for TLS
      secure: process.env.EMAIL_SECURE === 'true' || true, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER, // Your full email address (e.g., contact@yourdomain.com)
        pass: process.env.EMAIL_PASS, // Your email password
      },
      // Additional options for better compatibility
      tls: {
        // Don't fail on invalid certs (for development)
        rejectUnauthorized: false
      },
      debug: process.env.NODE_ENV === 'development', // Enable debug in development
      logger: process.env.NODE_ENV === 'development' // Enable logging in development
    });
  }

  /**
   * Send email using a predefined template
   * @param {string} to - Recipient email address
   * @param {string} templateName - Name of the template from emailTemplates
   * @param {object} data - Data to populate the template
   * @param {object} options - Additional options (cc, bcc, attachments, etc.)
   * @returns {Promise} - Promise that resolves when email is sent
   */
  async sendTemplatedEmail(to, templateName, data, options = {}) {
    try {
      // Check if template exists
      if (!emailTemplates[templateName]) {
        throw new Error(`Template '${templateName}' not found`);
      }

      // Generate email content from template
      const template = emailTemplates[templateName](data);

      const mailOptions = {
        from: options.from || process.env.EMAIL_USER,
        to,
        subject: options.subject || template.subject,
        html: template.html,
        text: options.text || template.text || undefined,
        cc: options.cc || undefined,
        bcc: options.bcc || undefined,
        attachments: options.attachments || undefined,
      };

      // Clean up undefined values
      Object.keys(mailOptions).forEach(key => {
        if (mailOptions[key] === undefined) {
          delete mailOptions[key];
        }
      });

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to} using template '${templateName}'`);
      return result;
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

  /**
   * Send custom email without template
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} html - HTML content
   * @param {object} options - Additional options (cc, bcc, attachments, etc.)
   * @returns {Promise} - Promise that resolves when email is sent
   */
  async sendCustomEmail(to, subject, html, options = {}) {
    try {
      const mailOptions = {
        from: options.from || process.env.EMAIL_USER,
        to,
        subject,
        html,
        text: options.text || undefined,
        cc: options.cc || undefined,
        bcc: options.bcc || undefined,
        attachments: options.attachments || undefined,
      };

      // Clean up undefined values
      Object.keys(mailOptions).forEach(key => {
        if (mailOptions[key] === undefined) {
          delete mailOptions[key];
        }
      });

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Custom email sent successfully to ${to}`);
      return result;
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

  /**
   * Send multiple emails (bulk send)
   * @param {Array} emails - Array of email objects {to, templateName, data, options}
   * @returns {Promise} - Promise that resolves when all emails are sent
   */
  async sendBulkEmails(emails) {
    try {
      const promises = emails.map(email => {
        if (email.templateName) {
          return this.sendTemplatedEmail(email.to, email.templateName, email.data, email.options);
        } else {
          return this.sendCustomEmail(email.to, email.subject, email.html, email.options);
        }
      });

      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      console.log(`Bulk email send completed: ${successful} successful, ${failed} failed`);
      
      return {
        successful,
        failed,
        results
      };
    } catch (error) {
      console.error('Bulk email sending error:', error);
      throw error;
    }
  }

  /**
   * Verify email configuration
   * @returns {Promise} - Promise that resolves if connection is successful
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      console.error('Check your email credentials and SMTP settings');
      throw error;
    }
  }

  /**
   * Test email sending (useful for debugging)
   * @param {string} to - Test recipient email address
   * @returns {Promise} - Promise that resolves when test email is sent
   */
  async sendTestEmail(to) {
    try {
      const testMailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Test Email from Hostinger SMTP',
        html: `
          <h2>Email Service Test</h2>
          <p>This is a test email to verify that your Hostinger SMTP configuration is working correctly.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
        `,
        text: `Email Service Test\n\nThis is a test email to verify that your Hostinger SMTP configuration is working correctly.\n\nSent at: ${new Date().toLocaleString()}\nFrom: ${process.env.EMAIL_USER}`
      };

      const result = await this.transporter.sendMail(testMailOptions);
      console.log(`Test email sent successfully to ${to}`);
      return result;
    } catch (error) {
      console.error('Test email sending error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
export default emailService;

// Export specific methods for convenience (optional)
export const sendTemplatedEmail = (to, templateName, data, options) => 
  emailService.sendTemplatedEmail(to, templateName, data, options);

export const sendCustomEmail = (to, subject, html, options) => 
  emailService.sendCustomEmail(to, subject, html, options);

export const sendBulkEmails = (emails) => 
  emailService.sendBulkEmails(emails);

export const sendTestEmail = (to) => 
  emailService.sendTestEmail(to);

// Legacy function for backward compatibility
export const sendConfirmationEmail = async (to, booking, type) => {
  const templateName = type === 'admin' ? 'adminBookingNotification' : 'customerBookingConfirmation';
  const secondTemplateName = 'postRideCompletion';
  await emailService.sendTemplatedEmail(to, templateName, booking);
  return emailService.sendTemplatedEmail(to, secondTemplateName, {...booking, postRideLink: `http://localhost:3000/post-ride?booking=${booking.bookingId}&payment=${booking.paymentIntentId}`});
};