import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  name: { type: String, required: true, trim: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  phone: { type: String, required: true, trim: true, index: true },
  idType: { type: String, enum: ['Passport', 'CNIC/National ID', 'Driver License', 'Other'], default: 'Passport' },
  idNumber: { type: String, default: '', index: true },
  idCardImage: { type: String, default: '' },
  additionalGuests: [{
    name: { type: String, default: '' },
    idType: { type: String, default: '' },
    idNumber: { type: String, default: '' },
    phone: { type: String, default: '' }
  }],
  address: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

guestSchema.index({ createdAt: -1 });

export default mongoose.model('Guest', guestSchema);
