// pages/api/contact.js (or app/api/contact/route.js for App Router)

import emailService from '../../../lib/email'; // Adjust path as needed

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ 
      message: 'Name, email, and message are required fields' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: 'Please provide a valid email address' 
    });
  }

  try {
    // Verify email service connection (optional - remove in production)
    await emailService.verifyConnection();

    // Prepare contact form data
    const contactData = {
      name,
      email,
      phone,
      message
    };

    // Send bulk emails (business notification + customer auto-reply)
    const emailResults = await emailService.sendBulkEmails([
      {
        to: 'info@velarechauffeurs.com.au',
        templateName: 'contactFormNotification',
        data: contactData,
        options: {
          from: process.env.EMAIL_USER
        }
      },
      {
        to: email,
        templateName: 'contactFormAutoReply',
        data: contactData,
        options: {
          from: process.env.EMAIL_USER
        }
      }
    ]);

    // Check if both emails were sent successfully
    if (emailResults.successful === 2) {
      res.status(200).json({ 
        message: 'Message sent successfully! We will get back to you soon.' 
      });
    } else {
      console.error('Some emails failed to send:', emailResults.results);
      res.status(500).json({ 
        message: 'Partial failure in sending emails. Please contact us directly if you don\'t receive a confirmation.' 
      });
    }

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      message: 'Failed to send message. Please try again or contact us directly.' 
    });
  }
}

// Alternative approach: Send emails individually with better error handling
export async function handleContactAlternative(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, message } = req.body;

  // Validation (same as above)
  if (!name || !email || !message) {
    return res.status(400).json({ 
      message: 'Name, email, and message are required fields' 
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: 'Please provide a valid email address' 
    });
  }

  try {
    const contactData = { name, email, phone, message };

    // Send business notification email
    await emailService.sendTemplatedEmail(
      'info@velarechauffeurs.com.au',
      'contactFormNotification',
      contactData,
      { from: process.env.EMAIL_USER }
    );

    // Send customer auto-reply email
    await emailService.sendTemplatedEmail(
      email,
      'contactFormAutoReply',
      contactData,
      { from: process.env.EMAIL_USER }
    );

    res.status(200).json({ 
      message: 'Message sent successfully! We will get back to you soon.' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    // More specific error handling
    if (error.message.includes('Template') && error.message.includes('not found')) {
      res.status(500).json({ 
        message: 'Email template error. Please contact support.' 
      });
    } else if (error.code === 'EAUTH') {
      res.status(500).json({ 
        message: 'Email authentication failed. Please try again later.' 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send message. Please try again or contact us directly.' 
      });
    }
  }
}