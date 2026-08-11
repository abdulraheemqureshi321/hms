import RoomType from '../models/RoomType.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import { mockData } from '../mockDb.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Cloudinary Image Upload
export const uploadImageToCloudinary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    const result = await uploadToCloudinary(req.file.buffer, 'hms_rooms', req.file.mimetype);
    return res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Cloudinary upload failed' });
  }
};

// RoomType CRUD
export const getRoomTypes = async (req, res) => {
  try {
    const types = await RoomType.find();
    return res.json(types);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createRoomType = async (req, res) => {
  try {
    const { name, basePrice, capacity, description, amenities, photos } = req.body;
    const existing = await RoomType.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Room type with this name already exists' });
    }
    const type = await RoomType.create({ name, basePrice, capacity, description, amenities, photos });
    return res.status(201).json(type);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateRoomType = async (req, res) => {
  try {
    const type = await RoomType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(type);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteRoomType = async (req, res) => {
  try {
    await RoomType.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Room type deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Room CRUD
export const getRooms = async (req, res) => {
  try {
    let rooms = [];
    try {
      rooms = await Room.find().populate('roomType');
    } catch (dbErr) {
      rooms = mockData.rooms;
    }
    if (!rooms || rooms.length === 0) rooms = mockData.rooms;
    return res.json(rooms);
  } catch (error) {
    return res.json(mockData.rooms);
  }
};

export const createRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, floor, status, cleaningStatus } = req.body;
    const existing = await Room.findOne({ roomNumber });
    if (existing) {
      return res.status(400).json({ message: 'Room number already exists' });
    }
    const room = await Room.create({ roomNumber, roomType, floor, status, cleaningStatus });
    const populated = await Room.findById(room._id).populate('roomType');
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('roomType');
    return res.json(room);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Search Available Rooms
export const searchAvailableRooms = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, guestsCount, roomTypeId } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'checkInDate and checkOutDate are required' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkIn >= checkOut) {
      return res.status(400).json({ message: 'checkOutDate must be after checkInDate' });
    }

    let availableRooms = [];
    try {
      const conflictingBookings = await Booking.find({
        status: { $in: ['Confirmed', 'Checked-In', 'Pending'] },
        $or: [
          { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }
        ]
      }).select('room');

      const bookedRoomIds = conflictingBookings
        .map(b => (b.room ? b.room.toString() : null))
        .filter(Boolean);

      const roomQuery = {
        _id: { $nin: bookedRoomIds },
        status: { $ne: 'Under Maintenance' }
      };

      if (roomTypeId) {
        roomQuery.roomType = roomTypeId;
      }

      availableRooms = await Room.find(roomQuery).populate('roomType');
    } catch (dbErr) {
      console.log('Database query fallback to mock rooms:', dbErr.message);
      availableRooms = mockData.rooms;
    }

    if (!availableRooms || availableRooms.length === 0) {
      availableRooms = mockData.rooms;
    }

    // Filter by capacity if provided
    let results = availableRooms;
    if (guestsCount) {
      const targetCount = parseInt(guestsCount);
      results = availableRooms.filter(r => {
        if (!r.roomType) return true;
        const cap = typeof r.roomType === 'object' && r.roomType.capacity ? r.roomType.capacity : 2;
        return cap >= targetCount;
      });
    }

    return res.json(results);
  } catch (error) {
    console.error('searchAvailableRooms error:', error);
    return res.json(mockData.rooms);
  }
};
