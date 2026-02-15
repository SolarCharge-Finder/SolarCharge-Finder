import express from "express";
import {
    createChargingStation,
    getChargingStations,
    getChargingStationById,
    updateChargingStation,
    deleteChargingStation
} from "../controllers/chargingStationController.js";

const router = express.Router();

router.post("/", createChargingStation);
router.get("/", getChargingStations);
router.get("/:id", getChargingStationById);
router.put("/:id", updateChargingStation);
router.delete("/:id", deleteChargingStation);


export default router;