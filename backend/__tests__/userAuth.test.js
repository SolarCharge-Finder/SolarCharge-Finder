// @ts-nocheck
/// <reference types="jest" />
import { jest, describe, test, expect, beforeAll, beforeEach, afterAll } from '@jest/globals'

// Mocks used by the controller
const mockFindOne = jest.fn()
const mockCreate = jest.fn()
const mockFindById = jest.fn()
const mockComparePassword = jest.fn()

jest.unstable_mockModule('mongoose', () => ({
  __esModule: true,
  default: { connection: { readyState: 1 }, Types: { ObjectId: { isValid: () => true } } }
}))

jest.unstable_mockModule('../models/User.js', () => ({
  __esModule: true,
  default: {
    findOne: mockFindOne,
    create: mockCreate,
    findById: mockFindById,
    prototype: { comparePassword: mockComparePassword }
  }
}))

const mockSendVerificationEmail = jest.fn()
const mockSendPasswordResetEmail = jest.fn()

jest.unstable_mockModule('../utils/emailService.js', () => ({
  __esModule: true,
  sendVerificationEmail: mockSendVerificationEmail,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  sendWelcomeEmail: jest.fn()
}))

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

describe('User Auth Controller', () => {
  beforeEach(() => jest.clearAllMocks())

  test('register returns 400 when user already exists', async () => {
    mockFindOne.mockResolvedValue({ email: 'a@a.com' })
    const req = { body: { email: 'a@a.com', password: 'secret' } }
    const res = mockRes()

    await controllers.register(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }))
  })

  test('register success calls sendVerificationEmail', async () => {
    mockFindOne.mockResolvedValue(null)
    const fakeUser = { _id: 'u1', email: 'x@x.com', role: 'user', isEmailVerified: false }
    mockCreate.mockResolvedValue(fakeUser)

    const req = { body: { email: 'x@x.com', password: 'password' } }
    const res = mockRes()

    await controllers.register(req, res)

    expect(mockCreate).toHaveBeenCalled()
    expect(mockSendVerificationEmail).toHaveBeenCalledWith(expect.objectContaining({ _id: 'u1' }))
    expect(res.status).toHaveBeenCalledWith(201)
  })

  test('login returns 401 for unknown user', async () => {
    mockFindOne.mockResolvedValue(null)
    const req = { body: { email: 'no@no.com', password: 'p' } }
    const res = mockRes()

    await controllers.login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  test('login returns 401 for wrong password', async () => {
    const userObj = { _id: 'u1', email: 'u@u.com', isEmailVerified: true }
    mockFindOne.mockResolvedValue(userObj)
    mockComparePassword.mockResolvedValue(false)

    const req = { body: { email: 'u@u.com', password: 'wrong' } }
    const res = mockRes()

    await controllers.login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  test('login returns 401 if email not verified', async () => {
    const userObj = { _id: 'u1', email: 'u@u.com', isEmailVerified: false }
    mockFindOne.mockResolvedValue(userObj)
    mockComparePassword.mockResolvedValue(true)

    const req = { body: { email: 'u@u.com', password: 'right' } }
    const res = mockRes()

    await controllers.login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }))
  })

  test('verifyEmail returns 400 for invalid/expired token', async () => {
    mockFindById.mockResolvedValue(null)
    const req = { params: { token: 'bad' } }
    const res = mockRes()

    // controllers.verifyEmail looks up User.findOne by token; our mockFindById isn't used here,
    // so mock the User model method directly by replacing mockFindOne to return null
    mockFindOne.mockResolvedValue(null)

    await controllers.verifyEmail(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  test('forgotPassword returns 404 when user not found', async () => {
    mockFindOne.mockResolvedValue(null)
    const req = { body: { email: 'no@no.com' } }
    const res = mockRes()

    await controllers.forgotPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  test('forgotPassword success sends reset email', async () => {
    const userObj = { _id: 'u1', email: 'u@u.com', save: jest.fn() }
    mockFindOne.mockResolvedValue(userObj)
    const req = { body: { email: 'u@u.com' } }
    const res = mockRes()

    await controllers.forgotPassword(req, res)

    expect(mockSendPasswordResetEmail).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
  })

  test('resetPassword returns 400 for invalid/expired code', async () => {
    mockFindOne.mockResolvedValue(null)
    const req = { body: { email: 'x@x.com', resetCode: '000000', newPassword: 'newpass' } }
    const res = mockRes()

    await controllers.resetPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })
})
