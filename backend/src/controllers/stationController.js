//import Station from "../models/Station.js";
import Station from "../../models/ChargingStationModel.js";

export const searchStations = async (req, res) => {
    try {
        const { search, city, status, connectorType } = req.query;

        let query = {};
        const andConditions = [];

        if (!search || search.trim() !== "") {
            const searchRegex = new RegExp(search, "i"); //case-insensitive regex for partial matching
            andConditions.push({
                $or: [
                    { name: searchRegex },
                    { address: searchRegex },
                    { "connectors.type": searchRegex }
                ]
            });
        }

        //Filter by city, status, and connector type if provided
        if (city) {
            andConditions.push({ city: city });
        }

        if (status) {
            andConditions.push({ status: status });
        }

        if (connectorType) {
            andConditions.push({ "connectors.type": connectorType });
        }

        // add the conditions to the query if they exist
        if (andConditions.length > 0) {
            query = { $and: andConditions };
        }

        const stations = await Station.find(query);

        res.status(200).json(stations);

    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Server error during search" });
    }
};

// nearby stations — uses 2dsphere index on location
export const getNearbyStations = async (req, res) => {
    try {
        const { lat, lng, radius = 50 } = req.query; // radius in km, default 50

        if (!lat || !lng) {
            return res.status(400).json({ message: 'lat and lng are required' });
        }

        const radiusInMeters = Number(radius) * 1000;

        const stations = await Station.find({
            location: {
                $nearSphere: {
                    $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
                    $maxDistance: radiusInMeters,
                },
            },
        });

        res.status(200).json(stations);
    } catch (error) {
        console.error('Nearby stations error:', error);
        res.status(500).json({ message: 'Server error while fetching nearby stations' });
    }
};

// top rated stations (5)
export const getTopRatedStations = async (req, res) => {
    try {
        const topStations = await Station.find()
            .sort({ rating: -1 })   // rating in descending order
            .limit(5);              // top 5 limit

        res.status(200).json(topStations);

    } catch (error) {
        console.error("Error fetching top rated stations:", error);
        res.status(500).json({ message: "Server error while fetching top rated stations" });
    }
};