// pages/api/booking/[bookingId].js
import Booking from '../../../models/Booking'; // Adjust path as needed
import dbConnect  from '../../../lib/db';


export default async function handler(req, res) {
  const { bookingId } = req.query;

  if (req.method === 'GET') {
    try {
      // Connect to database
      await dbConnect();
      
      // Find booking by ID
      const booking = await Booking.findOne({bookingId: bookingId});
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Return booking details
      return res.status(200).json({
        success: true,
        booking: {
          id: booking._id,
          vehicleType: booking.vehicleType,
          tripType: booking.tripType,
          passengers: booking.passengers,
          date: booking.date,
          time: booking.time,
          pickupAddress: booking.pickupAddress,
          dropoffAddress: booking.dropoffAddress,
          email: booking.email,
          phoneNumber: booking.phoneNumber,
          extraServices: booking.extraServices,
          specialRequests: booking.specialRequests,
          basePrice: booking.basePrice,
          serviceCharges: booking.serviceCharges || 0,
          totalPrice: booking.totalPrice,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt
        }
      });

    } catch (error) {
      console.error('Error fetching booking:', error);
      console.log('error is ', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch booking details'
      });
    }
  }

  else if (req.method === 'PUT') {
    try {
      await dbConnect();
      
      const updates = req.body;
      const booking = await Booking.findByIdAndUpdate(
        bookingId, 
        updates, 
        { new: true }
      );
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      return res.status(200).json({
        success: true,
        booking,
        message: 'Booking updated successfully'
      });

    } catch (error) {
      console.error('Error updating booking:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update booking'
      });
    }
  }

  else if (req.method === 'DELETE') {
    try {
      await dbConnect();
      
      const booking = await Booking.findByIdAndDelete(bookingId);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Booking deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting booking:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete booking'
      });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`
    });
  }
}