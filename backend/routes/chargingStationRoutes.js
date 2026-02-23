import express from "express";
import {
    createChargingStation,
    getChargingStations,
    getChargingStationById,
    updateChargingStation,
    deleteChargingStation
} from "../controllers/chargingStationController.js";
import { protect, authorize } from "../middleware/auth.js";

// search station controller (adeesha)
import { getTopRatedStations, searchStations } from "../src/controllers/stationController.js";

const router = express.Router();

router.post("/", protect, authorize("admin"), createChargingStation);
router.get("/", getChargingStations);
router.get("/search", searchStations); // search route (adeesha)
router.get("/top-rated", getTopRatedStations); // top rated (5) stations route (adeesha)
router.get("/:id", getChargingStationById);
router.put("/:id", protect, authorize("admin"), updateChargingStation);
router.delete("/:id", protect, authorize("admin"), deleteChargingStation);


export default router;
