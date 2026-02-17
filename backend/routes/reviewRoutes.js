import express from "express";
import {
    addReview,
    getReviewsByStation,
    updateReview,
    deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, addReview);
router.get("/:stationId", getReviewsByStation);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
