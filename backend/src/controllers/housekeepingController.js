import mongoose from 'mongoose';
import Room from '../models/Room.js';
import { HousekeepingLog } from '../models/HousekeepingLog.js';
import { getIO } from '../socket.js';

export const getHousekeepingTasks = async (req, res) => {
  try {
    const rooms = await Room.find().populate('roomType').sort({ floor: 1, roomNumber: 1 });
    const logs = await HousekeepingLog.find()
      .populate('room')
      .populate('staff', 'name email role')
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({ rooms, logs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCleaningStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { cleaningStatus, notes } = req.body;

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
        const cleanHex = String(roomId).replace(/[^a-fA-F0-9]/g, '').padEnd(24, '0').slice(0, 24);
        targetRoomId = new mongoose.Types.ObjectId(cleanHex);
      }
    }

    const room = await Room.findById(targetRoomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.cleaningStatus = cleaningStatus;
    await room.save();

    const log = await HousekeepingLog.create({
      room: targetRoomId,
      staff: req.user && mongoose.Types.ObjectId.isValid(req.user._id) ? req.user._id : undefined,
      status: cleaningStatus,
      notes: notes || ''
    });

    const populatedLog = await HousekeepingLog.findById(log._id)
      .populate('room')
      .populate('staff', 'name email role');

    const io = getIO();
    if (io) {
      io.emit('room_cleaning_updated', { roomId, cleaningStatus, log: populatedLog });
    }

    return res.json({ room, log: populatedLog });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
