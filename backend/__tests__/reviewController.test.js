/// <reference types="jest" />
import { jest, describe, test, expect, beforeEach, beforeAll, afterAll } from '@jest/globals'

/** @type {any} */
const mockFindOne = jest.fn()
/** @type {any} */
const mockCreate = jest.fn()
/** @type {any} */
const mockFind = jest.fn()
/** @type {any} */
const mockFindByIdReview = jest.fn()

/** @type {any} */
const mockStationFindById = jest.fn()
/** @type {any} */
const mockStationExists = jest.fn()

jest.unstable_mockModule('../models/Review.js', () => ({
  __esModule: true,
  default: {
    findOne: mockFindOne,
    create: mockCreate,
    find: mockFind,
    findById: mockFindByIdReview,
  }
}))

jest.unstable_mockModule('../models/ChargingStationModel.js', () => ({
  __esModule: true,
  default: {
    findById: mockStationFindById,
    exists: mockStationExists,
  }
}))

let controllers
beforeAll(async () => {
  controllers = await import('../controllers/reviewController.js')
})
afterAll(() => jest.resetAllMocks())

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('ReviewController', () => {
  beforeEach(() => jest.clearAllMocks())

  test('addReview requires stationId', async () => {
    const req = { body: {}, user: { id: 'u1' } }
    const res = mockRes()
    const next = jest.fn()
    await controllers.addReview(req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  test('addReview unauthorized when no user', async () => {
    const req = { body: { stationId: 's1', rating: 5 }, user: null }
    const res = mockRes()
    const next = jest.fn()
    await controllers.addReview(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  test('addReview rejects invalid rating', async () => {
    const req = { body: { stationId: 's1', rating: 'abc' }, user: { id: 'u1' } }
    const res = mockRes()
    const next = jest.fn()
    await controllers.addReview(req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  test('addReview returns 404 when station not found', async () => {
    mockStationFindById.mockResolvedValue(null)
    const req = { body: { stationId: 's1', rating: 5 }, user: { id: 'u1' } }
    const res = mockRes()
    const next = jest.fn()
    await controllers.addReview(req, res, next)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  test('getReviewsByStation requires stationId', async () => {
    const req = { params: {} }
    const res = mockRes()
    const next = jest.fn()
    await controllers.getReviewsByStation(req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  test('getReviewsByMe unauthorized when no user', async () => {
    const req = { user: null }
    const res = mockRes()
    const next = jest.fn()
    await controllers.getReviewsByMe(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  test('updateReview not found', async () => {
    mockFindByIdReview.mockResolvedValue(null)
    const req = { params: { id: 'r1' }, user: { id: 'u1' }, body: {} }
    const res = mockRes()
    const next = jest.fn()
    await controllers.updateReview(req, res, next)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  test('deleteReview not found', async () => {
    mockFindByIdReview.mockResolvedValue(null)
    const req = { params: { id: 'r1' }, user: { id: 'u1' } }
    const res = mockRes()
    const next = jest.fn()
    await controllers.deleteReview(req, res, next)
    expect(res.status).toHaveBeenCalledWith(404)
  })
})
