import User from '../models/User.js';
import ChargingStationModel from '../models/ChargingStationModel.js';
import Review from '../models/Review.js';

export const getDashboardStats = async (_req, res, next) => {
  try {
    const [totalUsers, totalStations, totalReviews] = await Promise.all([
      User.countDocuments(),
      ChargingStationModel.countDocuments(),
      Review.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStations,
        totalReviews,
      },
    });
  } catch (error) {
    return next(error);
  }
};
