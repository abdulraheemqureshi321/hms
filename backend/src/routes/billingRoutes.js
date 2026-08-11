import express from 'express';
import { getInvoices, getInvoiceByBooking, processPayment } from '../controllers/billingController.js';
import { protect, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/invoices', protect, checkPermission('billing', 'view'), getInvoices);
router.get('/booking/:bookingId', protect, getInvoiceByBooking);
router.put('/payment/:paymentId', protect, checkPermission('billing', 'edit'), processPayment);

export default router;
