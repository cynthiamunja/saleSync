import mongoose, { Schema } from "mongoose";

const saleSchema = new Schema({
  products: [
    {
      product:
       { type: Schema.Types.ObjectId,
        ref: "Product", 
        required: true 
    },
      quantity: 
      { type: Number, 
        required: true, min: 1 },
      price: 
      { type: Number, 
        required: true, 
        min: 0
     }
    }
  ],
  paymentMethod: {
  type: String,
  enum: ["cash", "mpesa", "card"],
  required: true
},
receiptNumber: {
  type: String,
  required: true,
  unique: true
},
  totalAmount:
   { type: Number, 
    required: true,
     min: 0 
    },
  cashier: 
  { type: Schema.Types.ObjectId, 
    ref: "User",
     required: true
     },
  isActive: { 
    type: Boolean,
     default: true
     }
},
 { timestamps: true });

export const Sale = mongoose.model("Sale", saleSchema);
