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
            message: "Charging station created successfully",
            data: station,
        });

    } catch (err) {
        next(err);
    }

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

        if (!station) {
            return res.status(404).json({ message: "Charging station not found" });
        }

        return res.status(200).json({ data: station });

    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid station id" });
        }
        next(err);
    }
}

//Update station

export const updateChargingStation = async (req, res, next) => {
    try {
        const stationId = req.params.id;

        const {
            latitude,
            longitude,
            connectors,
            photos,
            ...rest
        } = req.body;

        const updateData = { ...rest };

        //if lat/lng provided - update location
        if (latitude !== undefined && longitude !== undefined) {
            updateData.location = {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
            };
        }

        //if connecctors privided, replace connectors
        if (connectors !== undefined) {
            if (!Array.isArray(connectors) || connectors.length === 0) {
                return res
                    .status(400)
                    .json({ message: "At least one connector is required" });
            }

            for (const c of connectors) {
                if (c.totalSlots <= 0) {
                    return res.status(400).json({ message: `totalSlots must be greater than 0 for ${c.type}` });
                }
                if(c.availableSlots < 0){
                    return res.status(400).json({ message: `availableSlots cannot be negative for ${c.type}`});
                }
                if (c.availableSlots > c.totalSlots) {
                    return res.status(400).json({
                        message: `availableSlots cannot be greater than totalSlots for ${c.type}`,
                    })
                }
            }

            updateData.connectors = connectors;
        }

        //if photo provided, replace photos
        if (photos !== undefined) {
            updateData.photos = Array.isArray(photos) ? photos : [];
        }

        const updated = await ChargingStationModel.findByIdAndUpdate(
            stationId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Charging station not found" });
        }

        return res.status(200).json({
            message: "Charging station updated successfully",
            data: updated,
        });

    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid station id" });
        }

        //out of bounds
        if(err.message && err.message){
            return res.status(400).json({ message: "Invalid location. Latitude must be between -90 and 90, longitude between -180 and 180"});
        }
        next(err);
    }
};

//delete stations

export const deleteChargingStation = async (req, res, _next) => {
    try{
        const deleted = await ChargingStationModel.findByIdAndDelete(req.params.id);

        if(!deleted){
            return res.status(404).json({ message: "Charging station not found"});
        }
        return res.status(200).json({
            message: "Charging staton deleted successfully.",
        });

    } catch(err){
        if(err.name === "CastError"){
            return res.status(400).josn({message: "Invalid station id"});
        }

    }
}