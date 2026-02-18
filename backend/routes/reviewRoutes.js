import express from "express";
import {
    addReview,
    getAllReviews,
    getReviewsByStation,
    updateReview,
    deleteReview,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, addReview);
router.get("/", protect, authorize("admin"), getAllReviews);
router.get("/:stationId", getReviewsByStation);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
