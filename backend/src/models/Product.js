import mongoose from 'mongoose';

const productReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 120,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240,
    },
    fullDescription: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Solar Panels',
        'Batteries',
        'Inverters',
        'Charge Controllers',
        'Solar Lights',
        'Solar Cables',
        'Solar Kits',
      ],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    availabilityStatus: {
      type: String,
      enum: ['In Stock', 'Out of Stock'],
      default: 'In Stock',
    },
    brand: {
      type: String,
      trim: true,
    },
    technicalSpecifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    imageUrls: {
      type: [String],
      validate: {
        validator: arr => Array.isArray(arr) && arr.length > 0,
        message: 'At least one image is required.',
      },
      required: true,
    },
    reviews: {
      type: [productReviewSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.index({
  name: 'text',
  shortDescription: 'text',
  fullDescription: 'text',
  brand: 'text',
  category: 'text',
});

productSchema.pre('validate', function (next) {
  if (this.stockQuantity <= 0) {
    this.availabilityStatus = 'Out of Stock';
  } else if (!this.availabilityStatus) {
    this.availabilityStatus = 'In Stock';
  }
  next();
});

export default mongoose.model('Product', productSchema);
