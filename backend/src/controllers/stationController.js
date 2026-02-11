import Station from "../models/Station.js";

export const searchStations = async (req, res) => {
    try {
        const { search, city, status, connectorType } = req.query;

        let query = {};
        const andConditions = [];

        if (!search || search.trim() !== "") {
            const searchRegex = new RegExp(search, "i");
            andConditions.push({
                $or: [
                    { name: searchRegex },
                    { city: searchRegex },
                    { district: searchRegex },
                    { "connectors.type": searchRegex }
                ]
            });
        }


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
