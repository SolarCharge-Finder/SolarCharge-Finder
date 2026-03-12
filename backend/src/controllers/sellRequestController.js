import SellRequest from "../models/SellRequest.js";

export const createSellRequest = async (req, res) => {
    try {
        const { energyAmount, latitude, longitude } = req.body;

        //excess energy amount validation
        if (!energyAmount) {
        return res.status(400).json({
            message: "Energy amount is required"
        });
        }
        
        //seller location validation
        if (!latitude || !longitude) {
            return res.status(400).json({
                message: "Location (latitude & longitude) is required."
            })
        }

        //location cordinate validity
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                message: "Latitude must be between -90 and 90"
            });
        }
        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                message: "Longitude must be between -180 and 180"
            });
        }       

        const newRequest = new SellRequest({
            resident: req.user._id, 
            energyAmount,
            location: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
            }
        });

        const savedRequest = await newRequest.save();

        res.status(201).json({
            message: "Sell request created successfully",
            request: savedRequest
        });
    } catch (error) {
        console.error("Create sell request error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};