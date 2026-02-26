import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'

let mongod
let app
let authToken

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret'
  // import app after setting env so connectDB uses the in-memory server
  app = (await import('../app.js')).default

  // create admin user and generate token
  const mongoose = (await import('mongoose')).default
  const jwt = (await import('jsonwebtoken')).default

  // wait for mongoose to connect
  await new Promise((resolve) => mongoose.connection.once('open', resolve))

  // insert admin user directly into collection to avoid model validation issues in tests
  const insertResult = await mongoose.connection.collection('users').insertOne({ email: 'admin@test.com', password: 'password', role: 'admin', isEmailVerified: true, createdAt: new Date(), updatedAt: new Date() })
  authToken = jwt.sign({ id: insertResult.insertedId }, process.env.JWT_SECRET)
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

  test('Authenticated CRUD: create, read, update, delete station', async () => {
    const stationPayload = {
      name: 'Integration Station',
      latitude: 0,
      longitude: 0,
      connectors: [{ type: 'CCS2', powerKW: 50, totalSlots: 1, availableSlots: 1 }]
    }

    // create
    const createRes = await request(app)
      .post('/api/stations')
      .set('Authorization', `Bearer ${authToken}`)
      .send(stationPayload)

    expect(createRes.status).toBe(201)
    expect(createRes.body).toHaveProperty('data')
    const stationId = createRes.body.data._id || createRes.body.data.id

    // read
    const getRes = await request(app).get(`/api/stations/${stationId}`)
    expect(getRes.status).toBe(200)
    expect(getRes.body).toHaveProperty('data')

    // update
    const updateRes = await request(app)
      .put(`/api/stations/${stationId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Station' })
    expect(updateRes.status).toBe(200)
    expect(updateRes.body.data).toHaveProperty('name', 'Updated Station')

    // delete
    const deleteRes = await request(app)
      .delete(`/api/stations/${stationId}`)
      .set('Authorization', `Bearer ${authToken}`)
    expect(deleteRes.status).toBe(200)
  })
})
