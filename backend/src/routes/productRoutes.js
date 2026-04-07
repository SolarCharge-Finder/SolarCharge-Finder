import express from 'express';
import {
  addProductReview,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  resolveProductImageUrl,
} from '../controllers/productController.js';
import { authorize, protect } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/resolve-image', protect, authorize('admin'), resolveProductImageUrl);
router.get('/mine', protect, authorize('admin'), getMyProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', protect, authorize('user', 'admin'), addProductReview);
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
