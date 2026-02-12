import express from "express";
import {
    createChargingStation,
    getChargingStations,
    getChargingStationById,
    updateChargingStation
} from "../controllers/chargingStationController.js";

const router = express.Router();

router.post("/", createChargingStation);
router.get("/", getChargingStations);
router.get("/:id", getChargingStationById);
router.put("/:id", updateChargingStation);


export default router;