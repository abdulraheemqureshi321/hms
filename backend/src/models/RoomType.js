import mongoose from 'mongoose';

const roomTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  basePrice: { type: Number, required: true },
  capacity: { type: Number, required: true, default: 2 },
  description: { type: String, default: '' },
  amenities: [{ type: String }],
  photos: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('RoomType', roomTypeSchema);
