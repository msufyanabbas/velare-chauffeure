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
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  passengers: {
    type: Number,
    default: 1,
    min: 1,
    max: 8,
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
      values: ['pending', 'paid', 'failed', 'refunded'],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'pending',
  },
  paymentIntentId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  confirmedAt: {
    type: Date,
  },
});

// Clear any existing model to avoid caching issues
if (mongoose.models.Booking) {
  delete mongoose.models.Booking;
}

export default mongoose.model('Booking', BookingSchema);