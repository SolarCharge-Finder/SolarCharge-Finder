import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
//import app from "../server.js";   cooked, not exporting app from server.js </3
import Station from '../src/models/ChargingStationModel.js';

let mongoServer;

//create test app & import station routes - remove if, we export app from server.js
const createTestApp = async () => {
  const express = await import('express');
  const app = express.default();

  const stationRoutes = await import('../src/routes/chargingStationRoutes.js');
  app.use('/api/stations', stationRoutes.default);

  return app;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Station.deleteMany({});

  await Station.create([
    {
      name: 'FastCharge Colombo',
      district: 'Colombo',
      city: 'Colombo',
      address: '123 Main St',
      location: { type: 'Point', coordinates: [79.8612, 6.9271] },
      status: 'Open',
      connectors: [
        { type: 'TYPE1', totalSlots: 5, availableSlots: 3, powerKW: 22 },
        { type: 'TYPE2', totalSlots: 4, availableSlots: 0, powerKW: 50 },
      ],
    },
    {
      name: 'Kandy EV Hub',
      district: 'Kandy',
      city: 'Kandy',
      address: '456 Hill Rd',
      location: { type: 'Point', coordinates: [80.6337, 7.2906] },
      status: 'Closed',
      connectors: [{ type: 'TYPE2', totalSlots: 6, availableSlots: 2, powerKW: 50 }],
    },
    {
      name: 'Galle SuperCharge',
      district: 'Galle',
      city: 'Galle',
      address: '789 Beach Rd',
      location: { type: 'Point', coordinates: [80.2189, 6.032] },
      status: 'Under Maintenance',
      connectors: [{ type: 'TYPE1', totalSlots: 3, availableSlots: 1, powerKW: 22 }],
    },
  ]);
});

describe('Station Search API', () => {
  it('returns all stations when no filters applied', async () => {
    const app = await createTestApp();
    const res = await request(app).get('/api/stations/search');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(3); // 3 stations seeded
  });

  it('filters by district', async () => {
    const app = await createTestApp();
    const res = await request(app).get('/api/stations/search').query({ district: 'Colombo' });

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].district).toBe('Colombo');
  });

  it('filters by status', async () => {
    const app = await createTestApp();
    const res = await request(app).get('/api/stations/search').query({ status: 'Closed' });

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].status).toBe('Closed');
  });

  it('filters by connector type', async () => {
    const app = await createTestApp();
    const res = await request(app).get('/api/stations/search').query({ connectorType: 'TYPE1' });

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2); // Colombo + Galle
    const cities = res.body.map(s => s.city);
    expect(cities).toContain('Colombo');
    expect(cities).toContain('Galle');
  });

  it('filters by district and status together', async () => {
    const app = await createTestApp();
    const res = await request(app)
      .get('/api/stations/search')
      .query({ district: 'Galle', status: 'Under Maintenance' });

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Galle SuperCharge');
  });

  it('filters by district and connector type', async () => {
    const app = await createTestApp();
    const res = await request(app)
      .get('/api/stations/search')
      .query({ district: 'Colombo', connectorType: 'TYPE2' });

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('FastCharge Colombo');
  });

  it('filters by status and connector type', async () => {
    const app = await createTestApp();
    const res = await request(app)
      .get('/api/stations/search')
      .query({ status: 'Open', connectorType: 'TYPE1' });

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('FastCharge Colombo');
  });

  it('returns empty array when no stations match filters', async () => {
    const app = await createTestApp();
    const res = await request(app)
      .get('/api/stations/search')
      .query({ district: 'Kandy', status: 'Open', connectorType: 'TYPE1' });

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });

  it('searches by text query across name, city, district, and connector types', async () => {
    const app = await createTestApp();
    const res = await request(app).get('/api/stations/search').query({ search: 'SuperCharge' });

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Galle SuperCharge');
  });
});
