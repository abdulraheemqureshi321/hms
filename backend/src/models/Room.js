import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true, trim: true },
  roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
  floor: { type: Number, required: true, default: 1 },
  status: { 
    type: String, 
    enum: ['Available', 'Occupied', 'Reserved', 'Under Maintenance'], 
    default: 'Available' 
  },
  cleaningStatus: { 
    type: String, 
    enum: ['Clean', 'Dirty', 'In Progress'], 
    default: 'Clean' 
  }
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
