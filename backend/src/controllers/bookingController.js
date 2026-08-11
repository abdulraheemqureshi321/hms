import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import RoomType from '../models/RoomType.js';
import Guest from '../models/Guest.js';
import Payment from '../models/Payment.js';
import TaxSetting from '../models/TaxSetting.js';
import { io } from '../server.js';

export const createBooking = async (req, res) => {
  const { 
    roomId, 
    checkInDate, 
    checkOutDate, 
    guestsCount, 
    guestId, 
    guestDetails, 
    source, 
    specialRequests,
    paymentMethod 
  } = req.body;

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (checkIn >= checkOut) {
    return res.status(400).json({ message: 'Check-out date must be after check-in date' });
  }

  let targetRoomId = roomId;
  if (roomId && !mongoose.Types.ObjectId.isValid(roomId)) {
    const cleanNumber = String(roomId).replace(/^rm_/i, '');
    const foundRoom = await Room.findOne({
      $or: [
        { roomNumber: roomId },
        { roomNumber: cleanNumber }
      ]
    });
    if (foundRoom) {
      targetRoomId = foundRoom._id;
    } else {
      // Fallback: Convert custom string like 'rm_102' to valid 24-character hex ObjectId
      const cleanHex = String(roomId).replace(/[^a-fA-F0-9]/g, '').padEnd(24, '0').slice(0, 24);
      targetRoomId = new mongoose.Types.ObjectId(cleanHex);
    }
  }

  let session = null;
  let useSession = true;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (sErr) {
    useSession = false;
  }

  try {
    const conflictQuery = {
      room: targetRoomId,
      status: { $in: ['Confirmed', 'Checked-In', 'Pending'] },
      $or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }
      ]
    };

    const conflict = useSession 
      ? await Booking.findOne(conflictQuery).session(session)
      : await Booking.findOne(conflictQuery);

    if (conflict) {
      if (useSession) { await session.abortTransaction(); session.endSession(); }
      return res.status(409).json({ message: 'Room is no longer available for the selected dates.' });
    }

    let room = useSession 
      ? await Room.findById(targetRoomId).populate('roomType').session(session).catch(() => null)
      : await Room.findById(targetRoomId).populate('roomType');

    if (!room) {
      room = await Room.findById(targetRoomId).populate('roomType');
    }

    if (!room || room.status === 'Under Maintenance') {
      if (useSession) { await session.abortTransaction(); session.endSession(); }
      return res.status(400).json({ message: 'Selected room is not operational.' });
    }

    // Process Guest Information
    let targetGuestId = guestId;
    if (!targetGuestId && guestDetails) {
      let existingGuest = useSession
        ? await Guest.findOne({ email: guestDetails.email }).session(session)
        : await Guest.findOne({ email: guestDetails.email });

      if (existingGuest) {
        targetGuestId = existingGuest._id;
        if (guestDetails.idType) existingGuest.idType = guestDetails.idType;
        if (guestDetails.idNumber) existingGuest.idNumber = guestDetails.idNumber;
        if (guestDetails.idCardImage) existingGuest.idCardImage = guestDetails.idCardImage;
        if (guestDetails.additionalGuests) existingGuest.additionalGuests = guestDetails.additionalGuests;
        if (useSession) await existingGuest.save({ session });
        else await existingGuest.save();
      } else {
        const newGuestData = {
          user: req.user && req.user.role === 'Guest' ? req.user._id : undefined,
          name: guestDetails.name,
          email: guestDetails.email,
          phone: guestDetails.phone || 'N/A',
          idType: guestDetails.idType || 'Passport',
          idNumber: guestDetails.idNumber || '',
          idCardImage: guestDetails.idCardImage || '',
          additionalGuests: Array.isArray(guestDetails.additionalGuests) ? guestDetails.additionalGuests : []
        };
        const newGuest = useSession 
          ? await Guest.create([newGuestData], { session })
          : [await Guest.create(newGuestData)];

        targetGuestId = newGuest[0]._id;
      }
    } else if (req.user && req.user.role === 'Guest' && !targetGuestId) {
      let guestProfile = useSession
        ? await Guest.findOne({ user: req.user._id }).session(session)
        : await Guest.findOne({ user: req.user._id });

      if (!guestProfile) {
        const newGuestData = {
          user: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: 'N/A'
        };
        const newGuest = useSession
          ? await Guest.create([newGuestData], { session })
          : [await Guest.create(newGuestData)];
        targetGuestId = newGuest[0]._id;
      } else {
        targetGuestId = guestProfile._id;
      }
    }

    if (!targetGuestId) {
      if (useSession) { await session.abortTransaction(); session.endSession(); }
      return res.status(400).json({ message: 'Guest details are required.' });
    }

    // Calculate Nights & Total Price
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const nightPrice = room.roomType ? room.roomType.basePrice : 100;
    const baseTotal = diffDays * nightPrice;

    // Fetch Active Tax Settings
    let taxRate = 16;
    let serviceFeeRate = 5;
    let isTaxEnabled = true;

    try {
      const taxSetting = await TaxSetting.findOne();
      if (taxSetting) {
        taxRate = taxSetting.taxRate;
        serviceFeeRate = taxSetting.serviceFeeRate;
        isTaxEnabled = taxSetting.isTaxEnabled;
      }
    } catch (e) {
      console.error('TaxSetting query error:', e.message);
    }

    const taxAmount = isTaxEnabled ? Math.round(baseTotal * (taxRate / 100)) : 0;
    const serviceFee = isTaxEnabled ? Math.round(baseTotal * (serviceFeeRate / 100)) : 0;
    const totalTaxAndFees = taxAmount + serviceFee;
    const finalTotal = baseTotal + totalTaxAndFees;

    const bookingCode = 'HMS-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000);

    const bookingSource = source || (req.user && req.user.role === 'Guest' ? 'portal' : 'walk-in');
    const initialStatus = req.body.status || (bookingSource === 'portal' ? 'Pending' : 'Confirmed');

    const bookingData = {
      bookingCode,
      guest: targetGuestId,
      room: targetRoomId,
      roomType: room.roomType ? room.roomType._id : undefined,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestsCount: guestsCount || 1,
      status: initialStatus,
      source: bookingSource,
      totalAmount: finalTotal,
      specialRequests: specialRequests || ''
    };

    const booking = useSession
      ? await Booking.create([bookingData], { session })
      : [await Booking.create(bookingData)];

    const paymentData = {
      booking: booking[0]._id,
      amount: finalTotal,
      taxAmount: totalTaxAndFees,
      paymentMethod: paymentMethod || 'pay_at_hotel',
      paymentStatus: paymentMethod === 'card' || paymentMethod === 'online' ? 'Paid' : 'Pending',
      transactionId: paymentMethod === 'card' || paymentMethod === 'online' ? 'TXN-' + Date.now() : ''
    };

    const payment = useSession
      ? await Payment.create([paymentData], { session })
      : [await Payment.create(paymentData)];

    room.status = 'Reserved';
    if (useSession) {
      await room.save({ session });
      await session.commitTransaction();
      session.endSession();
    } else {
      await room.save();
    }

    const populatedBooking = await Booking.findById(booking[0]._id)
      .populate('guest')
      .populate({ path: 'room', populate: { path: 'roomType' } });

    if (io) {
      io.emit('booking_created', populatedBooking);
      io.emit('room_status_changed', { roomId: room._id, status: 'Reserved' });
    }

    return res.status(201).json({ booking: populatedBooking, payment: payment[0] });

  } catch (error) {
    if (useSession && session) {
      await session.abortTransaction();
      session.endSession();
    }
    return res.status(500).json({ message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const guestProfiles = await Guest.find({
      $or: [
        { user: req.user._id },
        { email: req.user.email }
      ]
    });

    const guestIds = guestProfiles.map(g => g._id);

    const bookings = await Booking.find({ guest: { $in: guestIds } })
      .populate('guest')
      .populate({ path: 'room', populate: { path: 'roomType' } })
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Guest') {
      const guestProfiles = await Guest.find({
        $or: [
          { user: req.user._id },
          { email: req.user.email }
        ]
      });
      const guestIds = guestProfiles.map(g => g._id);
      query.guest = { $in: guestIds };
    }

    const { status, source } = req.query;
    if (status) query.status = status;
    if (source) query.source = source;

    try {
      const bookings = await Booking.find(query)
        .populate('guest')
        .populate({ path: 'room', populate: { path: 'roomType' } })
        .sort({ createdAt: -1 });

      return res.json(bookings);
    } catch (castErr) {
      console.warn('Auto-repairing corrupted legacy bookings with non-ObjectId room references...', castErr.message);
      await Booking.deleteMany({ room: { $type: 'string' } });
      const bookings = await Booking.find(query)
        .populate('guest')
        .populate({ path: 'room', populate: { path: 'roomType' } })
        .sort({ createdAt: -1 });

      return res.json(bookings);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const booking = await Booking.findById(id).populate('room');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const room = await Room.findById(booking.room._id);

    if (status === 'Confirmed') {
      booking.status = 'Confirmed';
      if (room) {
        room.status = 'Reserved';
        await room.save();
      }
    } else if (status === 'Checked-In') {
      booking.status = 'Checked-In';
      if (room) {
        room.status = 'Occupied';
        await room.save();
      }
    } else if (status === 'Checked-Out') {
      booking.status = 'Checked-Out';
      if (room) {
        room.status = 'Available';
        room.cleaningStatus = 'Dirty'; // Needs housekeeping on checkout
        await room.save();
      }

      // Auto-finalize payment status upon guest checkout
      const paymentDoc = await Payment.findOne({ booking: booking._id });
      if (paymentDoc && paymentDoc.paymentStatus !== 'Refunded') {
        paymentDoc.paymentStatus = 'Paid';
        if (!paymentDoc.transactionId) {
          paymentDoc.transactionId = 'TXN-' + Date.now();
        }
        await paymentDoc.save();
      }
    } else if (status === 'Cancelled') {
      booking.status = 'Cancelled';
      booking.cancellationReason = cancellationReason || 'Cancelled by guest/staff';
      
      // Calculate refund rule: Free cancellation up to 24 hours prior
      const now = new Date();
      const checkInTime = new Date(booking.checkInDate);
      const hoursDiff = (checkInTime - now) / (1000 * 60 * 60);

      if (hoursDiff >= 24) {
        booking.refundAmount = booking.totalAmount; // 100% refund
      } else if (hoursDiff > 0) {
        booking.refundAmount = booking.totalAmount * 0.5; // 50% refund
      } else {
        booking.refundAmount = 0; // Non-refundable after check-in time
      }

      if (room) {
        room.status = 'Available';
        await room.save();
      }

      // Update payment record
      await Payment.findOneAndUpdate(
        { booking: booking._id },
        { paymentStatus: 'Refunded' }
      );
    }

    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('guest')
      .populate({ path: 'room', populate: { path: 'roomType' } });

    if (io) {
      io.emit('booking_updated', updated);
      if (room) io.emit('room_status_changed', { roomId: room._id, status: room.status, cleaningStatus: room.cleaningStatus });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
