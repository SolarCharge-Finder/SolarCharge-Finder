/// <reference types="jest" />
import { jest, describe, test, expect, beforeAll, beforeEach, afterAll } from '@jest/globals'

// Use ESM mock API so controller imports receive mocked model
/** @type {any} */
const mockCreate = jest.fn()
/** @type {any} */
const mockFind = jest.fn()
/** @type {any} */
const mockFindById = jest.fn()
/** @type {any} */
const mockFindByIdAndUpdate = jest.fn()
/** @type {any} */
const mockFindByIdAndDelete = jest.fn()

jest.unstable_mockModule('../models/ChargingStationModel.js', () => ({
  __esModule: true,
  default: {
    create: mockCreate,
    find: mockFind,
    findById: mockFindById,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
  }
}))

let controllers
beforeAll(async () => {
  controllers = await import('../controllers/chargingStationController.js')
})
afterAll(() => jest.resetAllMocks())

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('ChargingStationController', () => {
  beforeEach(() => jest.clearAllMocks())

  test('createChargingStation returns 400 when name missing', async () => {
    const req = { body: {} }
    const res = mockRes()
    const next = jest.fn()
    await controllers.createChargingStation(req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalled()
  })

  test('createChargingStation success', async () => {
    const station = { id: '1', name: 'A' }
    mockCreate.mockResolvedValue(station)
    const req = { body: { name: 'A', latitude: 0, longitude: 0, connectors: [{ type: 'CCS', totalSlots: 1, availableSlots: 1 }] } }
    const res = mockRes()
    const next = jest.fn()
    await controllers.createChargingStation(req, res, next)
    expect(mockCreate).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: station }))
  })

  test('getChargingStations returns stations list', async () => {
    const stations = [{ name: 'S1' }]
    mockFind.mockReturnValue({ select: () => ({ sort: () => stations }) })
    const req = { query: {} }
    const res = mockRes()
    const next = jest.fn()
    await controllers.getChargingStations(req, res, next)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: stations }))
  })

  test('getChargingStationById returns 404 when not found', async () => {
    mockFindById.mockResolvedValue(null)
    const req = { params: { id: 'nonexistent' } }
    const res = mockRes()
    const next = jest.fn()
    await controllers.getChargingStationById(req, res, next)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  test('updateChargingStation rejects connectors with invalid slots', async () => {
    const req = { params: { id: '1' }, body: { connectors: [{ type: 'X', totalSlots: 0, availableSlots: 0 }] } }
    const res = mockRes()
    const next = jest.fn()
    await controllers.updateChargingStation(req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  test('deleteChargingStation returns 404 when not found', async () => {
    mockFindByIdAndDelete.mockResolvedValue(null)
    const req = { params: { id: '1' } }
    const res = mockRes()
    await controllers.deleteChargingStation(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })
})
