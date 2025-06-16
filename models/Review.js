import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  text: {
    type: String,
    required: [true, 'Review text is required'],
    minlength: [10, 'Review must be at least 10 characters long'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // Only validate if email is provided
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  phone: {
    type: String,
    trim: true,
  },
  isApproved: {
    type: Boolean,
    default: true, // Changed to true for immediate display
  },
  // Optional: Link to booking if customer is leaving review after service
  bookingId: {
    type: String,
    trim: true,
  },
  // Optional: Vehicle type they used for context
  vehicleType: {
    type: String,
    enum: ['luxury_sedan', 'suv', 'premium_luxury_sedan', 'people_mover_11_seater', '7_seater', ''],
    default: '',
  },
  // Optional: Trip type for context
  tripType: {
    type: String,
    enum: ['one-way', 'round-trip', 'hourly', 'airport', 'event', ''],
    default: '',
  },
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt
});

// Indexes for better query performance
TestimonialSchema.index({ createdAt: -1 });
TestimonialSchema.index({ rating: 1 });
TestimonialSchema.index({ isApproved: 1 });
TestimonialSchema.index({ bookingId: 1 });

// Static method to get approved testimonials
TestimonialSchema.statics.getApproved = function() {
  return this.find({ isApproved: true }).sort({ createdAt: -1 });
};

// Instance method to approve testimonial
TestimonialSchema.methods.approve = function() {
  this.isApproved = true;
  return this.save();
};

// Instance method to reject testimonial
TestimonialSchema.methods.reject = function() {
  this.isApproved = false;
  return this.save();
};

// Prevent recompilation error in development
const Testimonial = mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);

export default Testimonial;