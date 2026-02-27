//import Station from "../models/Station.js";
import Station from "../models/ChargingStationModel.js";

export const searchStations = async (req, res) => {
    try {
        const { search, district, status, connectorType } = req.query;

        let query = {};
        const andConditions = [];

        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search, "i"); //case-insensitive regex for partial matching
            andConditions.push({
                $or: [
                    { name: searchRegex },
                    { address: searchRegex },
                    { "connectors.type": searchRegex }
                ]
            });
        }

        //Filter by district, status, and connector type if provided
        if (district && district.trim() !== "") {
            const districtRegex = new RegExp(district, "i"); // partial search - why r you guys saving it as 'colombo district' </3 (adeesha)
            andConditions.push({ district: districtRegex });
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

//search endpoint with user distance 
export const distanceSearchStations = async (req, res) => {
    try {
        const { search, district, status, connectorType, lat, lng, responseLimit } = req.query;

        // Validate coordinates
        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitude and longitude are required for distance search" });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        let query = {};
        const andConditions = [];

        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search, "i"); //case-insensitive regex for partial matching
            andConditions.push({
                $or: [
                    { name: searchRegex },
                    { address: searchRegex },
                    { "connectors.type": searchRegex }
                ]
            });
        }

        //Filter by district, status, and connector type if provided
        if (district && district.trim() !== "") {
            const districtRegex = new RegExp(district, "i"); // partial search - why r you guys saving it as 'colombo district' </3 (adeesha)
            andConditions.push({ district: districtRegex });
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

        // Use MongoDB aggregation with geoNear
        /** @type {any[]} */
        const aggregationPipeline = [];

        aggregationPipeline.push({
            $geoNear: {
                near: { type: "Point", coordinates: [userLng, userLat] },
                distanceField: "distance",
                spherical: true,
                query: query,
            }
        });

        aggregationPipeline.push({ $sort: { distance: 1 } });

        if (responseLimit) {
            aggregationPipeline.push({ $limit: parseInt(responseLimit)})
        }

        aggregationPipeline.push ({
            $addFields: {
                distance: { $divide: ["$distance", 1000]}
            }
        });

        const stations = await Station.aggregate(aggregationPipeline);

        res.status(200).json(stations);

    } catch (error) {
        console.error("Error filtering stations by distance:", error);
        res.status(500).json({ message: "Server error during distance filtering" });
    }
};


//get neraby stations (distance, limit)
export const nearbyStations = async (req, res) => {
    try {
        const { lat, lng, maxDistance, responseLimit } = req.query;

        // Validate coordinates
        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitude and longitude are required for distance search" });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        // Use MongoDB aggregation with geoNear
        /** @type {any[]} */
        const aggregationPipeline = [];

        aggregationPipeline.push({
            $geoNear: {
                near: { type: "Point", coordinates: [userLng, userLat] },
                distanceField: "distance",
                spherical: true,
                ...(maxDistance && { maxDistance: parseFloat(maxDistance) })
            }
        });

        aggregationPipeline.push({ $sort: { distance: 1 } });

        if (responseLimit) {
            aggregationPipeline.push({ $limit: parseInt(responseLimit)})
        }

        aggregationPipeline.push ({
            $addFields: {
                distance: { $divide: ["$distance", 1000]}
            }
        });

        const stations = await Station.aggregate(aggregationPipeline);

        res.status(200).json(stations);

    } catch (error) {
        console.error("Error filtering stations by distance:", error);
        res.status(500).json({ message: "Server error during distance filtering" });
    }
};