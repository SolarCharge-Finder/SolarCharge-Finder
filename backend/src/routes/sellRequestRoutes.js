import express from "express";
import { createSellRequest } from "../controllers/sellRequestController.js";
import { protect } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createSellRequest);

export default router;