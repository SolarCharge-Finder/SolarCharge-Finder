import mongoose from 'mongoose';

const sellRequestSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    energyAmount: {
      type: Number, // in kWH
      required: true,
      min: 1,
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: arr => Array.isArray(arr) && arr.length === 2,
          message: 'Location coordinates must be [lng, lat]',
        },
      },
    },

    comment: {
      type: String,
    },

    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
      default: 'Pending',
    },

    acceptedStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingStation',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SellRequest', sellRequestSchema);
