import express from 'express';
import { 
  getRoomTypes, 
  createRoomType, 
  updateRoomType, 
  deleteRoomType,
  getRooms, 
  createRoom, 
  updateRoom, 
  deleteRoom,
  searchAvailableRooms,
  uploadImageToCloudinary
} from '../controllers/roomController.js';
import { protect, checkPermission } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public / Guest Availability Search
router.get('/search', searchAvailableRooms);
router.get('/types', getRoomTypes);
router.get('/', getRooms);

// Image Upload Endpoint (Cloudinary)
router.post('/upload-image', protect, upload.single('image'), uploadImageToCloudinary);

// Staff / Admin Management Routes
router.post('/types', protect, checkPermission('rooms', 'create'), createRoomType);
router.put('/types/:id', protect, checkPermission('rooms', 'edit'), updateRoomType);
router.delete('/types/:id', protect, checkPermission('rooms', 'delete'), deleteRoomType);

router.post('/', protect, checkPermission('rooms', 'create'), createRoom);
router.put('/:id', protect, checkPermission('rooms', 'edit'), updateRoom);
router.delete('/:id', protect, checkPermission('rooms', 'delete'), deleteRoom);

export default router;
