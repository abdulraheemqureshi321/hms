import express from 'express';
import { 
  login, 
  registerGuest, 
  createStaffAccount, 
  getStaffList, 
  updateStaffPermissions, 
  deleteStaffAccount,
  getMe 
} from '../controllers/authController.js';
import { protect, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register-guest', registerGuest);
router.get('/me', protect, getMe);

// Staff Management Routes (Hierarchical Access)
router.post('/staff', protect, checkPermission('staff', 'create'), createStaffAccount);
router.get('/staff', protect, checkPermission('staff', 'view'), getStaffList);
router.put('/staff/:id', protect, checkPermission('staff', 'edit'), updateStaffPermissions);
router.delete('/staff/:id', protect, checkPermission('staff', 'delete'), deleteStaffAccount);

export default router;
