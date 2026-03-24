import express from 'express';
import {
  createSellRequest,
  getUserSellRequests,
  updateSellRequest,
  deleteSellRequest,
} from '../controllers/sellRequestController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// create a sell request
router.post('/', protect, createSellRequest);

// get sell requests of logged user
router.get('/my-requests', protect, getUserSellRequests);

// update a sell request
router.put('/:id', protect, updateSellRequest);

// delete a sell request
router.delete('/:id', protect, deleteSellRequest);

export default router;
