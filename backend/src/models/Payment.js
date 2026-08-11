import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  amount: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  paymentMethod: { 
    type: String, 
    enum: ['card', 'cash', 'online', 'pay_at_hotel'], 
    default: 'pay_at_hotel' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Pending', 'Refunded'], 
    default: 'Pending' 
  },
  transactionId: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
