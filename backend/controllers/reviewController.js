import Review from "../models/Review.js";
import ChargingStationModel from "../models/ChargingStationModel.js";

const parseRating = (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return null;
    }
    return parsed;
};

export const addReview = async (req, res, next) => {
    try {
        const { stationId, rating, comment } = req.body;

        if (!stationId) {
            return res.status(400).json({ message: "stationId is required" });
        }

        if (rating === undefined) {
            return res.status(400).json({ message: "rating is required" });
        }

        const normalizedRating = parseRating(rating);
        if (normalizedRating === null) {
            return res.status(400).json({ message: "rating must be a number" });
        }

        if (normalizedRating < 1 || normalizedRating > 5) {
            return res.status(400).json({ message: "rating must be between 1 and 5" });
        }

        const station = await ChargingStationModel.findById(stationId);
        if (!station) {
            return res.status(404).json({ message: "Charging station not found" });
        }

        const existingReview = await Review.findOne({
            station: stationId,
            user: req.user.id,
        });

        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this station" });
        }

        const review = await Review.create({
            station: stationId,
            user: req.user.id,
            rating: normalizedRating,
            comment,
        });

        station.rating =
            (station.rating * station.totalRatings + normalizedRating) /
            (station.totalRatings + 1);
        station.totalRatings += 1;
        await station.save();

        await review.populate("user", "name");

        return res.status(201).json({
            message: "Review added successfully",
            data: review,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid station id" });
        }

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
            .populate("user", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: reviews.length,
            data: reviews,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid station id" });
        }

        return next(error);
    }
};

export const updateReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not allowed to update this review" });
        }

        const { rating, comment } = req.body;

        if (rating === undefined && comment === undefined) {
            return res.status(400).json({ message: "Provide rating or comment to update" });
        }

        const station = await ChargingStationModel.findById(review.station);

        if (!station) {
            return res.status(404).json({ message: "Charging station not found" });
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

        return res.status(200).json({
            message: "Review updated successfully",
            data: review,
        });
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
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not allowed to delete this review" });
        }

        const station = await ChargingStationModel.findById(review.station);

        if (!station) {
            return res.status(404).json({ message: "Charging station not found" });
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

        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid review id" });
        }

        return next(error);
    }
};
