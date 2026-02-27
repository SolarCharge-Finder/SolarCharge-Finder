// @ts-nocheck
/// <reference types="jest" />
import { jest, describe, test, expect, beforeAll, beforeEach, afterAll } from '@jest/globals'

const mockFindById = jest.fn()

jest.unstable_mockModule('../models/User.js', () => ({
  __esModule: true,
  default: {
    findById: mockFindById,
  }
}))

// Mock jsonwebtoken
const mockVerify = jest.fn()
jest.unstable_mockModule('jsonwebtoken', () => ({
  __esModule: true,
  default: { verify: mockVerify },
  verify: mockVerify
}))

let auth
beforeAll(async () => {
  auth = await import('../middleware/auth.js')
})

afterAll(() => jest.resetAllMocks())

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('Auth Middleware', () => {
  beforeEach(() => jest.clearAllMocks())

  test('protect returns 401 when no token provided', async () => {
    const req = { headers: {} }
    const res = mockRes()
    const next = jest.fn()

    await auth.protect(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  test('protect returns 401 for invalid token', async () => {
    const req = { headers: { authorization: 'Bearer badtoken' } }
    const res = mockRes()
    const next = jest.fn()

    mockVerify.mockImplementation(() => { const e = new Error('bad'); e.name = 'JsonWebTokenError'; throw e })

    await auth.protect(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }))
  })

  test('protect attaches user and calls next on valid token', async () => {
    const req = { headers: { authorization: 'Bearer goodtoken' } }
    const res = mockRes()
    const next = jest.fn()

    mockVerify.mockReturnValue({ id: 'u1' })
    mockFindById.mockResolvedValue({ _id: 'u1', email: 'a@a.com', role: 'user' })

    await auth.protect(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.user).toBeDefined()
    expect(req.user.email).toBe('a@a.com')
  })

  test('authorize denies access for wrong role', async () => {
    const middleware = auth.authorize('admin')
    const req = { user: { role: 'user' } }
    const res = mockRes()
    const next = jest.fn()

    middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
  })
})
