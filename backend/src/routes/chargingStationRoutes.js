import express from "express";
import {
    createChargingStation,
    getChargingStations,
    getChargingStationById,
    updateChargingStation,
    deleteChargingStation
} from "../controllers/chargingStationController.js";
import { protect, authorize } from "../../middleware/auth.js";

// search station controller (adeesha)
import { getTopRatedStations, searchStations, distanceSearchStations, nearbyStations } from "../controllers/stationController.js";

const router = express.Router();

router.post("/", protect, authorize("admin"), createChargingStation);
router.get("/", getChargingStations);
router.get("/search", searchStations); // search route (adeesha)
router.get("/top-rated", getTopRatedStations); // top rated (5) stations route (adeesha)
router.get("/distance-search", distanceSearchStations); // search route if user geo location is present (ascending order distance) (adeesha)
router.get("/nearby-stations", nearbyStations); //fetch stations filtering by maxDistance & response limit (adeesha)
router.get("/:id", getChargingStationById);
router.put("/:id", protect, authorize("admin"), updateChargingStation);
router.delete("/:id", protect, authorize("admin"), deleteChargingStation);


export default router;
