import mongoose from 'mongoose';

const taxSettingSchema = new mongoose.Schema({
  taxName: { type: String, default: 'GST / Sales Tax' },
  taxRate: { type: Number, default: 16 }, // e.g. 16% GST
  serviceFeeRate: { type: Number, default: 5 }, // e.g. 5% Service Charge
  ntnNumber: { type: String, default: '7920143-5' },
  isTaxEnabled: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('TaxSetting', taxSettingSchema);
