import mongoose, { Schema } from "mongoose";

const saleProductSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  quantity: {
    type: Number,
    required: true,
    min: 1
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
  }
});

const saleSchema = new Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true
    },

    products: [saleProductSchema],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "mpesa", "card"],
      required: true
    },

    cashier: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Sale = mongoose.model("Sale", saleSchema);
