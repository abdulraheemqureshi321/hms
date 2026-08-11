import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  guestsCount: { type: Number, required: true, default: 1 },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'], 
    default: 'Pending' 
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

export default mongoose.model('Booking', bookingSchema);
