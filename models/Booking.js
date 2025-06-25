import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  pickupAddress: {
    type: String,
    required: true,
  },
  dropoffAddress: {
    type: String,
    required: true,
  },
  // New detailed location objects
  pickupLocation: {
    displayAddress: String,
    fullAddress: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    placeId: String,
    name: String,
    isCoordinateOnly: Boolean,
    addressComponents: [mongoose.Schema.Types.Mixed],
    source: String,
    timestamp: Number
  },
  dropoffLocation: {
    displayAddress: String,
    fullAddress: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    placeId: String,
    name: String,
    isCoordinateOnly: Boolean,
    addressComponents: [mongoose.Schema.Types.Mixed],
    source: String,
    timestamp: Number
  },
  vehicleType: {
    type: String,
    required: true,
    enum: {
      values: ['luxury_sedan', 'suv', 'premium_luxury_sedan', 'people_mover_11_seater', '7_seater'],
      message: '{VALUE} is not a valid vehicle type'
    },
  },
  tripType: {
    type: String,
    required: true,
    enum: {
      values: ['one-way', 'round-trip', 'hourly', 'airport', 'event'],
      message: '{VALUE} is not a valid trip type'
    },
  },
  date: {
    type: String, // Changed from Date to String since you're receiving '2025-06-29'
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  passengers: {
    type: mongoose.Schema.Types.Mixed, // Can be Number or String
    default: 1,
  },
  extraServices: {
    type: String,
    enum: {
      values: ['wifi', 'refreshments', 'newspapers', 'child-seat', 'champagne', ''],
      message: '{VALUE} is not a valid extra service'
    },
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  specialRequests: {
    type: String,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  // New pricing fields
  basePrice: {
    type: Number,
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pre_authorized', 'pending', 'paid', 'failed', 'refunded'],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'pending',
  },
  paymentIntentId: {
    type: String,
  },
  // New payment fields
  paymentMethod: {
    type: String,
  },
  // Location metadata
  locationMetadata: {
    pickup: {
      hasExactAddress: Boolean,
      hasCoordinates: mongoose.Schema.Types.Mixed,
      hasPlaceId: String,
      coordinatesValid: Boolean,
      source: String
    },
    dropoff: {
      hasExactAddress: Boolean,
      hasCoordinates: mongoose.Schema.Types.Mixed,
      hasPlaceId: String,
      coordinatesValid: Boolean,
      source: String
    }
  },
  // Timestamp fields
  createdAt: {
    type: Date,
    default: Date.now,
  },
  confirmedAt: {
    type: Date,
  },
  submittedAt: {
    type: String, // or Date if you want to convert the string
  },
  timestamp: {
    type: String, // or Date if you want to convert the string
  }
}, {
  // This option allows storing any additional fields not defined in the schema
  strict: false,
  // This ensures virtual fields and additional properties are included when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Clear any existing model to avoid caching issues
if (mongoose.models.Booking) {
  delete mongoose.models.Booking;
}

export default mongoose.model('Booking', BookingSchema);