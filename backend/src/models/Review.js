import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        station: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChargingStation",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
    },
    { timestamps: true }
);

reviewSchema.index({ station: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
