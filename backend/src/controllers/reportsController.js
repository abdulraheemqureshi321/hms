import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

export const getDashboardMetrics = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const reservedRooms = await Room.countDocuments({ status: 'Reserved' });
    const dirtyRooms = await Room.countDocuments({ cleaningStatus: 'Dirty' });

    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
    const checkedInBookings = await Booking.countDocuments({ status: 'Checked-In' });

    // Calculate total revenue from payments
    const payments = await Payment.find({ paymentStatus: 'Paid' });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    const occupancyRate = totalRooms > 0 ? Math.round(((occupiedRooms + reservedRooms) / totalRooms) * 100) : 0;

    // Source breakdown
    const portalBookings = await Booking.countDocuments({ source: 'portal' });
    const walkInBookings = await Booking.countDocuments({ source: 'walk-in' });
    const phoneBookings = await Booking.countDocuments({ source: 'phone' });

    return res.json({
      totalRooms,
      occupiedRooms,
      reservedRooms,
      dirtyRooms,
      totalBookings,
      confirmedBookings,
      checkedInBookings,
      totalRevenue,
      occupancyRate,
      sourceBreakdown: {
        portal: portalBookings,
        walkIn: walkInBookings,
        phone: phoneBookings
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
