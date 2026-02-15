import mongoose from "mongoose";

const connectorSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["CCS2", "TYPE2", "CHADEMO", "GBT", "TYPE1", "DOMESTIC"],
    },
    powerKW: {
        type: Number,
        required: true,
        min: 0
    },
    totalSlots: {
        type: Number,
        required: true,
        min: 0
    },
    availableSlots: {
        type: Number,
        required: true,
        min: 0
    },

}, { _id: false }
);

const chargingStationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    address: {
        type: String,
        trim: true,
        maxlength: 200
    },
    city: {
        type: String,
        trim: true,
        maxlength: 60
    },
    district: {
        type: String,
        trim: true,
        maxlength: 60
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length === 2,
                message: "Location coordinates must be [lng, lat]",
            },
        },
    },
    status: {
        type: String,
        enum: ["ACTIVE", "MAINTENANCE", "INACTIVE"],
        default: "ACTIVE",
    },

    photos: [{
        type: String
    }],
    connectors: {
        type: [connectorSchema],
        default: [],
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length > 0,
            message: "At least one connector is required."
        },
    },

    // later connect auth: createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }

}, { timestamps: true }
);

// Geo index (for future nearby search)
chargingStationSchema.index({location: "2dsphere"});

//validate availableSlots <= totalSlots for each connector
chargingStationSchema.pre("validate", function(next){
    for( const c of this.connectors){
        if(c.availableSlots > c.totalSlots){
            return next(
                new Error(`availableSlots cannot be greater than totalSlots for ${c.type}`)
            );
        }
    }
    next();
});

export default mongoose.model("ChargingStation", chargingStationSchema);