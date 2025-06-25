// /api/booking/[id]/finalize.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id: bookingId } = req.query;
    const { 
      additionalCharges, 
      finalTotal, 
      paymentStatus, 
      customChargeDescription 
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
    }

    // Here you would update your database
    // This is a placeholder - replace with your actual database logic
    
    // Example with a hypothetical database update:
    /*
    await db.query(`
      UPDATE bookings 
      SET 
        additional_charges = ?,
        custom_charge_description = ?,
        payment_status = ?,
        final_total = ?,
        completed_at = NOW()
      WHERE id = ?
    `, [
      JSON.stringify(additionalCharges),
      customChargeDescription,
      paymentStatus,
      finalTotal,
      bookingId
    ]);
    */

    // For now, we'll just return success
    // Replace this with your actual database update logic
    console.log('Booking finalization:', {
      bookingId,
      additionalCharges,
      finalTotal,
      paymentStatus,
      customChargeDescription
    });

    res.status(200).json({
      success: true,
      message: 'Booking finalized successfully',
      bookingId,
      finalTotal
    });

  } catch (error) {
    console.error('Booking finalization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to finalize booking'
    });
  }
}