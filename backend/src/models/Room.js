import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true, trim: true, index: true },
  roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true, index: true },
  floor: { type: Number, required: true, default: 1 },
  status: { 
    type: String, 
    enum: ['Available', 'Occupied', 'Reserved', 'Under Maintenance'], 
    default: 'Available',
    index: true 
  },
  cleaningStatus: { 
    type: String, 
    enum: ['Clean', 'Dirty', 'In Progress'], 
    default: 'Clean',
    index: true 
  }
}, { timestamps: true });

roomSchema.index({ createdAt: -1 });

export default mongoose.model('Room', roomSchema);
