import SellRequest from "../models/SellRequest.js";

export const createSellRequest = async (req, res) => {
    try {
        const { energyAmount, location, comment } = req.body;

        //excess energy amount validation
        if (!energyAmount) {
        return res.status(400).json({
            message: "Energy amount is required"
        });
        }
        
        //seller location validation
        if (!location || !location.coordinates) {
            return res.status(400).json({
                message: "Location is required."
            })
        }

        const [longitude, latitude] = location.coordinates;

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
            },
            comment
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

// Get all sell requests for the logged-in user
export const getUserSellRequests = async (req, res) => {
  try {
    const requests = await SellRequest.find({ resident: req.user._id })
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      message: "User sell requests retrieved successfully",
      requests,
    });
  } catch (error) {
    console.error("Get user sell requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a sell request
export const updateSellRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { energyAmount, location, comment } = req.body;

        const request = await SellRequest.findById(id);

        if (!request) {
        return res.status(404).json({ message: "Sell request not found" });
        }

        // validate the user ownership of the request
        if (request.resident.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
        }

        // validate the request status - pending only
        if (request.status !== "Pending") {
        return res.status(400).json({ message: "Cannot edit a request that is already processed" });
        }

        if (energyAmount !== undefined) {
            request.energyAmount = energyAmount;
        }
        if (location?.coordinates) {
            request.location = {
                type: "Point",
                coordinates: location.coordinates
            }
        }
        if (comment !== undefined) {
            request.comment = comment;
        }

        const updatedRequest = await request.save();

        res.status(200).json({
            message: "Sell request updated successfully",
            request: updatedRequest
        });
    } catch (error) {
        console.error("Update sell request error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a sell request
export const deleteSellRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await SellRequest.findById(id);

        if (!request) {
        return res.status(404).json({ message: "Sell request not found" });
        }

        // validate the user ownership of the request
        if (request.resident.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
        }

        // validate the request status - pending only
        if (request.status !== "Pending") {
        return res.status(400).json({ message: "Cannot delete a request that is already processed" });
        }

        await request.deleteOne();

        res.status(200).json({ message: "Sell request deleted successfully" });
    } catch (error) {
        console.error("Delete sell request error:", error);
        res.status(500).json({ message: "Server error" });
    }
};