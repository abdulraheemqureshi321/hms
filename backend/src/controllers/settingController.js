import TaxSetting from '../models/TaxSetting.js';

// Get Current Tax Settings
export const getTaxSettings = async (req, res) => {
  try {
    let settings = await TaxSetting.findOne();
    if (!settings) {
      settings = await TaxSetting.create({
        taxName: 'GST / Sales Tax',
        taxRate: 16,
        serviceFeeRate: 5,
        ntnNumber: '7920143-5',
        isTaxEnabled: true
      });
    }
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Tax Settings
export const updateTaxSettings = async (req, res) => {
  try {
    const { taxName, taxRate, serviceFeeRate, ntnNumber, isTaxEnabled } = req.body;

    let settings = await TaxSetting.findOne();
    if (!settings) {
      settings = new TaxSetting();
    }

    if (taxName !== undefined) settings.taxName = taxName;
    if (taxRate !== undefined) settings.taxRate = Number(taxRate);
    if (serviceFeeRate !== undefined) settings.serviceFeeRate = Number(serviceFeeRate);
    if (ntnNumber !== undefined) settings.ntnNumber = ntnNumber;
    if (isTaxEnabled !== undefined) settings.isTaxEnabled = Boolean(isTaxEnabled);

    await settings.save();
    return res.json({ message: 'Tax settings updated successfully', settings });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
