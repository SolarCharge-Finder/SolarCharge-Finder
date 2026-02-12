import ChargingStationModel from "../models/ChargingStationModel.js";

export const createChargingStation = async (req, res, next) => {
    try{
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
        if(!name) return res.status(400).json({ message: "Station name is required"});
        if(latitude === undefined || longitude === undefined)
            return res.status(400).json({ message: "latitude and longitude are required"});

        if(!Array.isArray(connectors) || connectors.length === 0 )
            return res.status(400).json({ message: "At least one connectors required"});

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
            photos: Array.isArray(photos) ? photos: [],
        });

        return res.status(201).json({
            message: "Charging station created success fully",
            data: station,
        });
        
    }catch(err){
        next(err);
    }
};