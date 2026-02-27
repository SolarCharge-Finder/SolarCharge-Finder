/// <reference types="jest" />
import { jest, describe, test, expect, beforeAll, beforeEach, afterAll } from '@jest/globals'

/** @type {any} */
const mockFind = jest.fn()
/** @type {any} */
const mockAggregate = jest.fn()

// ESM Mocking for the ChargingStationModel
jest.unstable_mockModule('../models/ChargingStationModel.js', () => ({
  __esModule: true,
  default: {
    find: mockFind,
    aggregate: mockAggregate,
  }
}))

let controllers
beforeAll(async () => {
  // Ensure the path matches your project structure
  controllers = await import('../src/controllers/stationController.js')
})

afterAll(() => jest.resetAllMocks())

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('Station Search and Rating Controllers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('searchStations returns stations with simple query', async () => {
    const stations = [{ name: 'Station A' }]
    mockFind.mockResolvedValue(stations)
    
    const req = { query: { search: 'Tesla', district: 'London' } }
    const res = mockRes()
    
    await controllers.searchStations(req, res)
    
    expect(mockFind).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(stations)
  })

  test('searchStations handles server errors', async () => {
    mockFind.mockRejectedValue(new Error('Database Failure'))
    const req = { query: {} }
    const res = mockRes()
    
    await controllers.searchStations(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: "Server error during search" })
  })

  test('getTopRatedStations uses sort and limit', async () => {
    const topStations = [{ name: 'Best Station', rating: 5 }]

    // Add /** @type {any} */ to bypass the 'never' inference
    /** @type {any} */
    // @ts-ignore
    const mockLimit = jest.fn().mockResolvedValue(topStations)
    
    /** @type {any} */
    const mockSort = jest.fn().mockReturnValue({ limit: mockLimit })
    
    mockFind.mockReturnValue({ sort: mockSort })

    const req = {} 
    const res = mockRes()

    await controllers.getTopRatedStations(req, res)
    
    expect(mockSort).toHaveBeenCalledWith({ rating: -1 })
    expect(mockLimit).toHaveBeenCalledWith(5)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(topStations)
  })

  test('distanceSearchStations returns 400 if lat/lng missing', async () => {
    const req = { query: { search: 'test' } }
    const res = mockRes()
    
    await controllers.distanceSearchStations(req, res)
    
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Latitude and longitude are required for distance search" 
    })
  })

  test('distanceSearchStations handles server errors', async () => {
    mockAggregate.mockRejectedValue(new Error('DB Failure'))

    const req = { query: { lat: '40', lng: '-70' } }
    const res = mockRes()

    await controllers.distanceSearchStations(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
        message: "Server error during distance filtering"
    })
  })

  test('distanceSearchStations executes aggregation pipeline', async () => {
    const nearby = [{ name: 'Close Station', distance: 1.2 }]
    mockAggregate.mockResolvedValue(nearby)
    
    const req = { query: { lat: '40.71', lng: '-74.00', responseLimit: '5' } }
    const res = mockRes()
    
    await controllers.distanceSearchStations(req, res)
    
    expect(mockAggregate).toHaveBeenCalled()
    const pipeline = mockAggregate.mock.calls[0][0]
    // Verify $geoNear is the first stage
    expect(pipeline[0].$geoNear).toBeDefined()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(nearby)
  })

  test('nearbyStations applies maxDistance filter in pipeline', async () => {
    mockAggregate.mockResolvedValue([])
    const req = { query: { lat: '40', lng: '-70', maxDistance: '5000' } }
    const res = mockRes()
    
    await controllers.nearbyStations(req, res)
    
    const pipeline = mockAggregate.mock.calls[0][0]
    expect(pipeline[0].$geoNear.maxDistance).toBe(5000)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  test('nearbyStations returns 400 if lat/lng missing', async () => {
    const req = { query: {} }
    const res = mockRes()

    await controllers.nearbyStations(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
        message: "Latitude and longitude are required for distance search"
    })
  })

  test('nearbyStations handles server errors', async () => {
    mockAggregate.mockRejectedValue(new Error('DB Failure'))

    const req = { query: { lat: '40', lng: '-70' } }
    const res = mockRes()

    await controllers.nearbyStations(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
        message: "Server error during distance filtering"
    })
  })
})