import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getDashboardStats);

export default router;
