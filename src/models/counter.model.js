import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema({
  month: { type: String, required: true }, // e.g., "02"
  year: { type: String, required: true },  // e.g., "2026"
  sequence: { type: Number, default: 0 }
}, { timestamps: true });

export const Counter = mongoose.model("Counter", counterSchema);
