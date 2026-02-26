import { jest, describe, test, expect, beforeEach, beforeAll, afterAll } from '@jest/globals'

const mockFindById = jest.fn()
const mockFind = jest.fn()
const mockCountDocuments = jest.fn()

jest.unstable_mockModule('../models/User.js', () => ({
  __esModule: true,
  default: {
    findById: mockFindById,
    find: mockFind,
    countDocuments: mockCountDocuments,
  }
}))

import mongoose from 'mongoose'
let controllers
beforeAll(async () => {
  controllers = await import('../controllers/userController.js')
})
afterAll(() => jest.resetAllMocks())

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('UserController', () => {
  beforeEach(() => jest.clearAllMocks())

  test('promoteUser invalid id', async () => {
    /** @type {any} */
    const spyIsValid = jest.spyOn(mongoose.Types.ObjectId, 'isValid')
    spyIsValid.mockReturnValue(false)
    const req = { params: { id: '123' } }
    const res = mockRes()
    await controllers.promoteUser(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    spyIsValid.mockRestore()
  })

  test('updateUserRole invalid role', async () => {
    /** @type {any} */
    const spyIsValid = jest.spyOn(mongoose.Types.ObjectId, 'isValid')
    spyIsValid.mockReturnValue(true)
    const req = { params: { id: '507f1f77bcf86cd799439011' }, body: { role: 'super' } }
    const res = mockRes()
    await controllers.updateUserRole(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    spyIsValid.mockRestore()
  })

  test('getAllUsers returns list', async () => {
    const users = [{ email: 'a@a.com' }]
    mockFind.mockReturnValue({ select: () => ({ sort: () => users }) })
    const req = {}
    const res = mockRes()
    await controllers.getAllUsers(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { users } }))
  })
})
