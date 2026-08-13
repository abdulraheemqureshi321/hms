import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true, index: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true, index: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
  checkInDate: { type: Date, required: true, index: true },
  checkOutDate: { type: Date, required: true, index: true },
  guestsCount: { type: Number, required: true, default: 1 },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'], 
    default: 'Pending',
    index: true 
  },
  source: { 
    type: String, 
    enum: ['portal', 'walk-in', 'phone'], 
    default: 'portal' 
  },
  totalAmount: { type: Number, required: true },
  specialRequests: { type: String, default: '' },
  cancellationReason: { type: String, default: '' },
  refundAmount: { type: Number, default: 0 }
}, { timestamps: true });

bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ room: 1, status: 1, checkInDate: 1, checkOutDate: 1 });

export default mongoose.model('Booking', bookingSchema);
