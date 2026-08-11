import express from 'express';
import { getHousekeepingTasks, updateCleaningStatus } from '../controllers/housekeepingController.js';
import { protect, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, checkPermission('housekeeping', 'view'), getHousekeepingTasks);
router.put('/room/:roomId', protect, checkPermission('housekeeping', 'edit'), updateCleaningStatus);

export default router;
