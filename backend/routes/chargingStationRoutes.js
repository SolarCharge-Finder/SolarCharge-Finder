import express from "express";
import {
    createChargingStation,
    getChargingStations,
    getChargingStationById
} from "../controllers/chargingStationController.js";

const router = express.Router();

router.post("/", createChargingStation);
router.get("/", getChargingStations);
router.get("/:id", getChargingStationById);


export default router;