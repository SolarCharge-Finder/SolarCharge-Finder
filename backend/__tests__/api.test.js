import request from 'supertest';
import { describe, it, expect } from '@jest/globals';

// Mock the app for testing
const createTestApp = async () => {
  const express = await import('express');
  const app = express.default();
  
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to SolarCharge Finder API' });
  });
  
  return app;
};

describe('API Tests', () => {
  it('GET / should return welcome message', async () => {
    const app = await createTestApp();
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('SolarCharge Finder');
  });
});
