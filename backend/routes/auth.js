import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth' }),
  async (req, res) => {
    try {
      // Redirect to frontend with token
      const userData = {
        id: req.user._id.toString(),
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      };
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
      res.redirect(redirectUrl);
    } catch (error) {
      process.stderr.write(`Google OAuth error: ${error instanceof Error ? error.message : String(error)}\n`);
      res.redirect(`${process.env.FRONTEND_URL}/auth?error=auth_failed`);
    }
  }
);

export default router;
