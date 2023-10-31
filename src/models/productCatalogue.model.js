const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const productCatalogueSchema = mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Merchant',
    },
    name: {
      type: String,
      required: true,
    },
    featuredImage: {
      type: String,
      required: true,
    },
    images: [{ type: String, required: true }],
    description: {
      type: String,
      required: true,
    },
    salesPrice: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: Number,
        reviewText: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reviewCount: {
      type: Number,
      default: 0,
    },
    specifications: [
      {
        name: String,
        values: [String],
      },
    ],
    shipping: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
    },
    quantity: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      startDate: Date,
      endDate: Date,
    },

    tags: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isOutOfStock: {
      type: Boolean,
      default: true,
    },
    isSbAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productCatalogueSchema.plugin(toJSON);
productCatalogueSchema.plugin(paginate);

// Define a pre-save middleware to update isOutOfStock
productCatalogueSchema.pre('save', function (next) {
  // Check if quantity is less than or equal to 0
  if (this.quantity <= 0) {
    this.isOutOfStock = true;
  } else {
    this.isOutOfStock = false;
  }
  next();
});

/**
 * @typedef ProductCatalogue
 */
const ProductCatalogue = mongoose.model('ProductCatalogue', productCatalogueSchema);

module.exports = ProductCatalogue;
