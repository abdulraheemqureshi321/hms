import mongoose from 'mongoose';

const housekeepingLogSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Clean', 'Dirty', 'In Progress'], required: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

export const HousekeepingLog = mongoose.model('HousekeepingLog', housekeepingLogSchema);

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: { type: String, default: '' }
}, { timestamps: true });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
