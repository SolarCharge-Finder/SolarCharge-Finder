import express from 'express';
import { register, login, getProfile, getAllUsers, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { body } from 'express-validator';

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, register);

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, login);

// @route   GET /api/users/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', verifyEmail);

// @route   POST /api/users/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address')
], resendVerificationEmail);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), getAllUsers);

// @route   POST /api/users/forgot-password
// @desc    Send password reset code
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address')
], forgotPassword);

// @route   POST /api/users/reset-password
// @desc    Reset password with code
// @access  Public
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('resetCode').isLength({ min: 6, max: 6 }).withMessage('Reset code must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], resetPassword);

export default router;
