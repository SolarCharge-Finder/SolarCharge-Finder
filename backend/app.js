import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import session from 'express-session';
import passport from './config/passport.js';

import chargingStationRoutes from './src/routes/chargingStationRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import sellRequestRoutes from './src/routes/sellRequestRoutes.js';
import debugRoutes from './src/routes/debug.js';
import authRoutes from './src/routes/auth.js';
import adminRoutes from './src/routes/adminRoutes.js';
import errorHandler from './middleware/errorHandler.js';

//DNS issue </3 (adeesha) - doesn't really affect anything
import { setServers } from 'node:dns/promises';
setServers(['1.1.1.1', '8.8.8.8']);

dotenv.config();

const app = express();

// Connect to MongoDB (uses process.env.MONGODB_URI)
connectDB();

// Allow configuring production/frontend origins via ALLOWED_ORIGINS env var (comma-separated)
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const origins = allowedOrigins.length ? allowedOrigins : defaultOrigins;

app.use(
  cors({
    origin: origins,
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(
  session({
    secret: process.env.JWT_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SolarCharge Finder API' });
});

app.use('/api/stations', chargingStationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sell-request', sellRequestRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// centralized error handler
app.use(errorHandler);

export default app;
