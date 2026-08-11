import Guest from '../models/Guest.js';
import Booking from '../models/Booking.js';

export const getGuests = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { idNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const guests = await Guest.find(query).populate('user', 'role email').sort({ createdAt: -1 });
    return res.json(guests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createGuest = async (req, res) => {
  try {
    const { name, email, phone, idType, idNumber, address, notes } = req.body;
    const existing = await Guest.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'A guest record with this email already exists' });
    }
    const guest = await Guest.create({ name, email, phone, idType, idNumber, address, notes });
    return res.status(201).json(guest);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(guest);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getGuestHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = await Booking.find({ guest: id })
      .populate('room')
      .populate('roomType')
      .sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
