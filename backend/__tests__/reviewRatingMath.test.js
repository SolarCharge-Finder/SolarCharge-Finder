/// <reference types="jest" />
import { jest, describe, test, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';

/** Mocks for Review and ChargingStationModel **/
const mockCreateReview = jest.fn();
const mockFindByIdReview = jest.fn();
const mockFind = jest.fn();
const mockFindOneReview = jest.fn();

const mockStationFindById = jest.fn();

jest.unstable_mockModule('../src/models/Review.js', () => ({
  __esModule: true,
  default: {
    create: mockCreateReview,
    findById: mockFindByIdReview,
    findOne: mockFindOneReview,
    find: mockFind,
  },
}));

jest.unstable_mockModule('../src/models/ChargingStationModel.js', () => ({
  __esModule: true,
  default: {
    findById: mockStationFindById,
  },
}));

let controllers;
beforeAll(async () => {
  controllers = await import('../src/controllers/reviewController.js');
});

afterAll(() => jest.resetAllMocks());

describe('Review rating math', () => {
  beforeEach(() => jest.clearAllMocks());

  test('addReview updates station rating and totalRatings', async () => {
    // existing station with rating 4.0 and totalRatings 2
    const station = {
      _id: 's1',
      rating: 4.0,
      totalRatings: 2,
      save: jest.fn(),
    };

    mockStationFindById.mockResolvedValue(station);
    mockFindOneReview.mockResolvedValue(null);
    mockCreateReview.mockResolvedValue({
      _id: 'r1',
      rating: 5,
      user: 'u1',
      populate: jest.fn().mockResolvedValue({}),
    });

    const req = { body: { stationId: 's1', rating: 5, comment: 'Great' }, user: { id: 'u1' } };
    const res = { status: jest.fn().mockReturnValue({ json: jest.fn() }) };
    const next = jest.fn();

    await controllers.addReview(req, res, next);

    // new average = (4*2 + 5) / 3 = 4.333...
    expect(station.totalRatings).toBe(3);
    expect(station.rating).toBeCloseTo((4.0 * 2 + 5) / 3);
    expect(station.save).toHaveBeenCalled();
  });

  test('updateReview recalculates rating when rating changed', async () => {
    // existing review with old rating 4
    const review = {
      _id: 'r1',
      rating: 4,
      station: 's1',
      user: 'u1',
      save: jest.fn(),
      populate: jest.fn().mockResolvedValue({}),
    };
    const station = { _id: 's1', rating: 4.5, totalRatings: 2, save: jest.fn() };

    mockFindByIdReview.mockResolvedValue(review);
    mockStationFindById.mockResolvedValue(station);

    const req = { params: { id: 'r1' }, user: { id: 'u1' }, body: { rating: 5 } };
    const res = { status: jest.fn().mockReturnValue({ json: jest.fn() }) };
    const next = jest.fn();
    // capture original station rating before controller mutates it
    const originalRating = station.rating;

    await controllers.updateReview(req, res, next);

    // updatedTotal = originalRating * station.totalRatings - oldRating + newRating
    const expectedTotal = originalRating * station.totalRatings - 4 + 5;
    const expectedAvg = expectedTotal / station.totalRatings;
    expect(station.rating).toBeCloseTo(expectedAvg);
    expect(station.save).toHaveBeenCalled();
  });

  test('deleteReview adjusts rating and totalRatings', async () => {
    const review = { _id: 'r1', rating: 5, station: 's1', user: 'u1', deleteOne: jest.fn() };
    const station = { _id: 's1', rating: 4.5, totalRatings: 2, save: jest.fn() };

    mockFindByIdReview.mockResolvedValue(review);
    mockStationFindById.mockResolvedValue(station);

    const req = { params: { id: 'r1' }, user: { id: 'u1' } };
    const res = { status: jest.fn().mockReturnValue({ json: jest.fn() }) };
    const next = jest.fn();

    await controllers.deleteReview(req, res, next);

    // After deleting one of 2 reviews with rating 5 from average 4.5:
    // updatedTotal = station.rating * station.totalRatings - review.rating
    // new totalRatings = 1 => new average = updatedTotal / 1
    const updatedTotal = 4.5 * 2 - 5;
    const expectedAvg = updatedTotal / 1;
    expect(station.totalRatings).toBe(1);
    expect(station.rating).toBeCloseTo(expectedAvg);
    expect(review.deleteOne).toHaveBeenCalled();
    expect(station.save).toHaveBeenCalled();
  });
});
