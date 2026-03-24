import { body } from 'express-validator';

// Register validation
export const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),

  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
];

// Login validation
export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),

  body('password').notEmpty().withMessage('Password is required'),
];
