import express from 'express';
import { getDashboardMetrics } from '../controllers/reportsController.js';
import { protect, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, checkPermission('reports', 'view'), getDashboardMetrics);

export default router;
