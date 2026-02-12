import ChargingStationModel from "../models/ChargingStationModel.js";

// Create stations
export const createChargingStation = async (req, res, next) => {
    try {
        const {
            name,
            description,
            address,
            city,
            district,
            status,
            latitude,
            longitude,
            connectors,
            photos,
        } = req.body;

        //validations
        if (!name) return res.status(400).json({ message: "Station name is required" });
        if (latitude === undefined || longitude === undefined)
            return res.status(400).json({ message: "latitude and longitude are required" });

        if (!Array.isArray(connectors) || connectors.length === 0)
            return res.status(400).json({ message: "At least one connectors required" });

        const station = await ChargingStationModel.create({
            name,
            description,
            address,
            city,
            district,
            status,
            location: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
            },
            connectors,
            photos: Array.isArray(photos) ? photos : [],
        });

        return res.status(201).json({
            message: "Charging station created success fully",
            data: station,
        });

    } catch (err) {
        next(err);
    };

};

//GET all stations
export const getChargingStations = async (req, res, next) => {
    try {
        const stations = await ChargingStationModel.find().sort({ createdAt: -1 });

        return res.status(200).json({
            count: stations.length,
            data: stations,
        });

    } catch (err) {
        next(err);
    }
};

//Get station by id
export const getChargingStationById = async (req, res, next) => {
    try {
        const station = await ChargingStationModel.findById(req.params.id);

        if(!station){
            return res.status(404).json({ message: "Charging station not found"});
        }

        return res.status(200).json({ data: station});

    } catch (err) {
        if(err.name === "CastError"){
            return res.status(400).json({ message: "Invalid station id"});
        }
        next(err);
    }
}