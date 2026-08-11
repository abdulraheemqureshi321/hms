import express from 'express';
import { getGuests, createGuest, updateGuest, getGuestHistory } from '../controllers/guestController.js';
import { protect, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, checkPermission('guests', 'view'), getGuests);
router.post('/', protect, checkPermission('guests', 'create'), createGuest);
router.put('/:id', protect, checkPermission('guests', 'edit'), updateGuest);
router.get('/:id/history', protect, checkPermission('guests', 'view'), getGuestHistory);

export default router;
