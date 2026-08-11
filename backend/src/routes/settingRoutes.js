import express from 'express';
import { getTaxSettings, updateTaxSettings } from '../controllers/settingController.js';
import { protect, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/tax', getTaxSettings);
router.put('/tax', protect, checkPermission('billing', 'edit'), updateTaxSettings);

export default router;
