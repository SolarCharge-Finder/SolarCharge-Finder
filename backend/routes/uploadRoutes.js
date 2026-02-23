import express from 'express';
import multer from 'multer';
import { cloudinary, storage } from '../config/cloudinary.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// POST /api/upload/photos — upload up to 10 images, returns Cloudinary URLs
router.post(
  '/photos',
  protect,
  authorize('admin'),
  upload.array('photos', 10),
  (req, res) => {
    if (!Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const urls = req.files.map((f) => f.path); // Cloudinary full HTTPS URL
    return res.status(200).json({ success: true, urls });
  }
);

// DELETE /api/upload/photo/:publicId — remove a photo from Cloudinary
router.delete('/photo/:publicId', protect, authorize('admin'), async (req, res) => {
  try {
    // publicId may contain slashes (folder/name) — decode it
    const publicId = decodeURIComponent(req.params.publicId);
    await cloudinary.uploader.destroy(publicId);
    return res.status(200).json({ success: true, message: 'Photo deleted' });
  } catch (err) {
    console.error('Cloudinary delete error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete photo' });
  }
});

// Multer error handler
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err.message === 'Only image files are allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: 'Upload failed' });
});

export default router;
