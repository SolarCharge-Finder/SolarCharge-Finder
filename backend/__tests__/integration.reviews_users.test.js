import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'

let mongod
let app
let adminToken
let userToken

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret'
  app = (await import('../app.js')).default

  const mongoose = (await import('mongoose')).default
  const ChargingStation = (await import('../models/ChargingStationModel.js')).default
  const jwt = (await import('jsonwebtoken')).default

  await new Promise((resolve) => mongoose.connection.once('open', resolve))

  // insert admin and user directly into collection to avoid model validation issues
  const adminInsert = await mongoose.connection.collection('users').insertOne({ email: 'admin2@test.com', password: 'password', role: 'admin', isEmailVerified: true, createdAt: new Date(), updatedAt: new Date() })
  adminToken = jwt.sign({ id: adminInsert.insertedId }, process.env.JWT_SECRET)

  const userInsert = await mongoose.connection.collection('users').insertOne({ email: 'user1@test.com', password: 'password', role: 'user', isEmailVerified: true, createdAt: new Date(), updatedAt: new Date() })
  userToken = jwt.sign({ id: userInsert.insertedId }, process.env.JWT_SECRET)

  // create a station to review
  await ChargingStation.create({
    name: 'Review station',
    location: { type: 'Point', coordinates: [0, 0] },
    connectors: [{ type: 'CCS2', powerKW: 50, totalSlots: 1, availableSlots: 1 }]
  })
})

afterAll(async () => {
  if (mongod) await mongod.stop()
  const mongoose = (await import('mongoose')).default
  await mongoose.connection.close()
  jest.resetAllMocks()
})

describe('Integration: reviews and user role endpoints', () => {
  test('User can create, update, delete their review', async () => {
    // find station id
    const stations = await request(app).get('/api/stations')
    const stationId = stations.body.data[0]._id || stations.body.data[0].id

    // create review
    const create = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ stationId, rating: 5, comment: 'Great!' })
    expect(create.status).toBe(201)
    const reviewId = create.body.data._id || create.body.data.id

    // update review
    const update = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 4, comment: 'Good' })
    expect(update.status).toBe(200)
    expect(update.body.data).toHaveProperty('rating', 4)

    // delete review
    const del = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(del.status).toBe(200)
  })

  test('Admin can change a user role', async () => {
    // find the user created earlier
    const usersRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(usersRes.status).toBe(200)
    const target = usersRes.body.data.users.find(u => u.email === 'user1@test.com')
    const userId = target._id || target.id

    // promote to admin
    const promote = await request(app)
      .patch(`/api/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' })
    expect(promote.status).toBe(200)
    expect(promote.body.data.user.role).toBe('admin')
  })
})
