//redunant route file : search route is now in combined station route file (chargingStationRoutes.js) 

import express from "express";
import { searchStations } from "../controllers/stationController.js";

const router = express.Router();

router.get("/search", searchStations);

export default router;
