import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import session from 'express-session';
import passport from './config/passport.js';

import chargingStationRoutes from './routes/chargingStationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import userRoutes from './routes/userRoutes.js';
import debugRoutes from './routes/debug.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/adminRoutes.js';

//DNS issue </3 (adeesha) - doesn't really affect anything 
import {setServers} from "node:dns/promises";
setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();

// Connect to MongoDB (uses process.env.MONGODB_URI)
connectDB();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(session({
  secret: process.env.JWT_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SolarCharge Finder API' });
});

app.use('/api/stations', chargingStationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
