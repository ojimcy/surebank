const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    icon: {
      type: String,
      required: false,
    },
    slug: {
      type: String,
      required: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    subCategories: [
      {
        heading: {
          type: String,
        },
        items: [
          {
            name: {
              type: String,
            },
            slug: {
              type: String,
              required: true,
              unique: true,
              trim: true,
              sparse: true,
              lowercase: true,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
categorySchema.plugin(toJSON);
categorySchema.plugin(paginate);

/**
 * @typedef Category
 */
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
