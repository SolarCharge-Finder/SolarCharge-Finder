import Review from "../models/Review.js";
import ChargingStationModel from "../models/ChargingStationModel.js";
import { success, fail } from '../utils/responseHelper.js';

const parseRating = (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return null;
    }
    return parsed;
};

const getUserId = (user) => {
    if (!user) {
        return null;
    }

    if (typeof user === "string") {
        return user;
    }

    if (user.id) {
        return user.id.toString();
    }

    if (user._id) {
        return user._id.toString();
    }

    return null;
};

export const addReview = async (req, res, next) => {
    try {
        const { stationId, rating, comment } = req.body;

        if (!stationId) {
            return fail(res, { message: "stationId is required", status: 400 });
        }

        const userId = getUserId(req.user);
        if (!userId) {
            return fail(res, { message: "Not authorized, invalid user context", status: 401 });
        }

        if (rating === undefined) {
            return fail(res, { message: "rating is required", status: 400 });
        }

        const normalizedRating = parseRating(rating);
        if (normalizedRating === null) {
            return fail(res, { message: "rating must be a number", status: 400 });
        }

        if (normalizedRating < 1 || normalizedRating > 5) {
            return fail(res, { message: "rating must be between 1 and 5", status: 400 });
        }

        const station = await ChargingStationModel.findById(stationId);
        if (!station) {
            return fail(res, { message: "Charging station not found", status: 404 });
        }

        const existingReview = await Review.findOne({
            station: stationId,
            user: userId,
        });

        if (existingReview) {
            return fail(res, { message: "You have already reviewed this station", status: 400 });
        }

        const review = await Review.create({
            station: stationId,
            user: userId,
            rating: normalizedRating,
            comment,
        });

        station.rating =
            (station.rating * station.totalRatings + normalizedRating) /
            (station.totalRatings + 1);
        station.totalRatings += 1;
        await station.save();

        await review.populate("user", "name");

        return success(res, { status: 201, message: "Review added successfully", data: review });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid station id" });
        }

        return next(error);
    }
};

export const getAllReviews = async (_req, res, next) => {
    try {
        const reviews = await Review.find({})
            .populate("user", "name email")
            .populate("station", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });
    } catch (error) {
        return next(error);
    }
};

export const getReviewsByStation = async (req, res, next) => {
    try {
        const { stationId } = req.params;

        if (!stationId) {
            return res.status(400).json({ message: "stationId is required" });
        }

        const stationExists = await ChargingStationModel.exists({ _id: stationId });

        if (!stationExists) {
            return res.status(404).json({ message: "Charging station not found" });
        }

        const reviews = await Review.find({ station: stationId })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        return success(res, { status: 200, count: reviews.length, data: reviews });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid station id" });
        }

        return next(error);
    }
};

export const getReviewsByMe = async (req, res, next) => {
    try {
        const userId = getUserId(req.user);
        if (!userId) {
            return fail(res, { message: "Not authorized", status: 401 });
        }

        const reviews = await Review.find({ user: userId })
            .populate("station", "name")
            .sort({ createdAt: -1 })
            .lean();

        return success(res, { status: 200, data: reviews, count: reviews.length });
    } catch (error) {
        return next(error);
    }
};

export const updateReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return fail(res, { message: "Review not found", status: 404 });
        }

        const userId = getUserId(req.user);
        if (!userId) {
            return fail(res, { message: "Not authorized, invalid user context", status: 401 });
        }

        if (review.user.toString() !== userId) {
            return res.status(403).json({ message: "You are not allowed to update this review" });
        }

        const { rating, comment } = req.body;

        if (rating === undefined && comment === undefined) {
            return res.status(400).json({ message: "Provide rating or comment to update" });
        }

        const station = await ChargingStationModel.findById(review.station);

        if (!station) {
            return fail(res, { message: "Charging station not found", status: 404 });
        }

        const oldRating = review.rating;

        if (rating !== undefined) {
            const normalizedRating = parseRating(rating);
            if (normalizedRating === null) {
                return res.status(400).json({ message: "rating must be a number" });
            }

            if (normalizedRating < 1 || normalizedRating > 5) {
                return res.status(400).json({ message: "rating must be between 1 and 5" });
            }

            review.rating = normalizedRating;
        }

        if (comment !== undefined) {
            review.comment = comment;
        }

        await review.save();
        await review.populate("user", "name");

        if (rating !== undefined && station.totalRatings > 0) {
            const updatedTotal =
                station.rating * station.totalRatings - oldRating + review.rating;
            station.rating = updatedTotal / station.totalRatings;
            await station.save();
        }

        return success(res, { status: 200, message: "Review updated successfully", data: review });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid review id" });
        }

        return next(error);
    }
};

export const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return fail(res, { message: "Review not found", status: 404 });
        }

        const userId = getUserId(req.user);
        if (!userId) {
            return fail(res, { message: "Not authorized, invalid user context", status: 401 });
        }

        const isAdmin = req.user?.role === "admin";

        if (!isAdmin && review.user.toString() !== userId) {
            return res.status(403).json({ message: "You are not allowed to delete this review" });
        }

        const station = await ChargingStationModel.findById(review.station);

        if (!station) {
            return fail(res, { message: "Charging station not found", status: 404 });
        }

        if (station.totalRatings <= 1) {
            station.totalRatings = 0;
            station.rating = 0;
        } else {
            const updatedTotal =
                station.rating * station.totalRatings - review.rating;
            station.totalRatings -= 1;
            station.rating = updatedTotal / station.totalRatings;
        }

        await Promise.all([review.deleteOne(), station.save()]);

        return success(res, { status: 200, message: "Review deleted successfully" });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid review id" });
        }

        return next(error);
    }
};
