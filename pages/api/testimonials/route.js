import dbConnect from '../../../lib/db';
import Testimonial from '../../../models/Review';

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === 'GET') {
      // Get approved testimonials, sorted by most recent first
      const testimonials = await Testimonial.find({ isApproved: true })
        .sort({ createdAt: -1 })
        .lean();
      
      return res.status(200).json({
        success: true,
        data: testimonials
      });

    } else if (req.method === 'POST') {
      const { name, rating, text, email, phone, bookingId, vehicleType, tripType } = req.body;

      // Enhanced validation
      if (!name || !rating || !text) {
        return res.status(400).json({
          success: false,
          message: 'Name, rating, and review text are required'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      if (text.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Review text must be at least 10 characters long'
        });
      }

      // Validate email format if provided
      if (email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

       const vehicleTypeMap = {
    'Luxury Sedans': 'luxury_sedan',
    'SUV': 'suv',
    'Premium Luxury Sedans': 'premium_luxury_sedan',
    'People mover 11 seater': 'people_mover_11_seater',
    '7 seater': '7_seater' 
       }


      // Map frontend trip types to schema enum values
      const tripTypeMap = {
        'Airport Transfer': 'airport',
        'City Tour': 'hourly',
        'Business Meeting': 'one-way',
        'Wedding': 'event',
        'Special Event': 'event',
        'Other': ''
      };

      // Create new testimonial
      const testimonial = new Testimonial({
        name: name.trim(),
        rating: parseInt(rating),
        text: text.trim(),
        email: email?.trim() || undefined,
        phone: phone?.trim() || undefined,
        bookingId: bookingId?.trim() || undefined,
        vehicleType: vehicleTypeMap[vehicleType] || '',
        tripType: tripTypeMap[tripType] || '',
        isApproved: true, // Set to true for immediate display, change to false if you want moderation
        createdAt: new Date()
      });

      const savedTestimonial = await testimonial.save();

      return res.status(201).json({
        success: true,
        data: savedTestimonial,
        message: 'Thank you for your review! It has been published successfully.'
      });

    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Testimonials API error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate entry detected'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}