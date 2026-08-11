import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const permissionSchema = new mongoose.Schema({
  module: { 
    type: String, 
    required: true,
    enum: ['bookings', 'rooms', 'guests', 'billing', 'housekeeping', 'reports', 'staff']
  },
  actions: [{
    type: String,
    enum: ['view', 'create', 'edit', 'delete']
  }]
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Manager', 'Receptionist', 'Housekeeping', 'Guest'], 
    default: 'Guest' 
  },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shift: { type: String, enum: ['Morning', 'Evening', 'Night', 'Flexible'], default: 'Morning' },
  permissions: [permissionSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
