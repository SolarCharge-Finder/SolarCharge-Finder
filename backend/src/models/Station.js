import mongoose from "mongoose";

//name, description, district, city, address, lat/long  
//images, status (open, under maintanence, closed)
//connector types (type 1, type 2), total slots, available slots <- each connector type

const connectorSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["Type 1", "Type 2"]
    },
    totalSlots: {
        type: Number,
        required: true,
        min: 0
    },
    //dont forget to validate this 
    //also lowkey u could set up a script that assigns random num every few minutes to available slots for immersion xd
    availableSlots: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false }); 

const stationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    district: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    location: {
        type: {
        type: String,
        enum: ["Point"],
        default: "Point"
        },
        coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
        }
    },

    images: [
        {
        type: String 
        // use a cdn for images; cloudinary or something 
        }
    ],

    status: {
        type: String,
        enum: ["Open", "Under Maintenance", "Closed"],
        default: "Open"
    },

    connectors: [connectorSchema]

}, { timestamps: true });


stationSchema.index({ location: "2dsphere" });

export default mongoose.model("Station", stationSchema);

