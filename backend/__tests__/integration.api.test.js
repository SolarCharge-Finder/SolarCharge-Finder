/// <reference types="jest" />
import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'

let mongod
let app

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  // import app after setting env so connectDB uses the in-memory server
  app = (await import('../app.js')).default
})

afterAll(async () => {
  if (mongod) await mongod.stop()
  const mongoose = (await import('mongoose')).default
  await mongoose.connection.close()
  jest.resetAllMocks()
})

describe('Integration: API endpoints', () => {
  test('GET / returns welcome message', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message')
  })

  test('GET /api/stations returns 200 and data array', async () => {
    const res = await request(app).get('/api/stations')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
  })
})
