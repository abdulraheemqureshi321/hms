import express from 'express';
import { 
  createBooking, 
  getBookings, 
  getMyBookings,
  updateBookingStatus 
} from '../controllers/bookingController.js';
import { protect, optionalProtect, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Guest or Staff Booking Creation (Supports public guests & authenticated users)
router.post('/', optionalProtect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/', protect, getBookings);
router.put('/:id/status', protect, checkPermission('bookings', 'edit'), updateBookingStatus);

export default router;
