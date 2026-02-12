import express from "express";
import {
    createChargingStation
} from "../controllers/chargingStationController.js";

const router = express.Router();

router.post("/", createChargingStation);


export default router;