import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0
    },

    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
