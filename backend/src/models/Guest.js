import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  idType: { type: String, enum: ['Passport', 'CNIC/National ID', 'Driver License', 'Other'], default: 'Passport' },
  idNumber: { type: String, default: '' },
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

export default mongoose.model('Guest', guestSchema);
