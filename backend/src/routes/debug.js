import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Debug endpoint to get user verification tokens
router.get('/tokens/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({
      email: email,
      emailVerificationToken: { $exists: true }
    }).select('email emailVerificationToken emailVerificationExpires');

    if (!user) {
      return res.json({
        success: true,
        message: 'User not found',
        token: null
      });
    }

    const token = user.emailVerificationToken;
    const expires = new Date(user.emailVerificationExpires).toISOString();

    res.json({
      success: true,
      email: user.email,
      token: token,
      expires: expires
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching token',
      error: error.message
    });
  }
});

// Debug endpoint to get user verification tokens
router.get('/tokens', async (req, res) => {
  try {
    const users = await User.find({
      emailVerificationToken: { $exists: true }
    }).select('email emailVerificationToken emailVerificationExpires');

    const tokens = users.map(user => ({
      email: user.email,
      token: user.emailVerificationToken,
      expires: new Date(user.emailVerificationExpires).toISOString()
    }));

    res.json({
      success: true,
      count: tokens.length,
      tokens
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tokens',
      error: error.message
    });
  }
});

export default router;
