import mongoose from "mongoose";
import { Category } from "./category.model";

const productSchema= new Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        decscription:{
            type:String,
            trim:true
        },
        price:{
            type:Number,
            required:true,
            min:0
        },
        costPrice:{
            type:Number,
            min:0,
            required:true
        },
        stockQuantity:{
            type:Number,
            required:true,
            min:0,
            default:0

        },
        category:{
            type:Schema.Types.ObjectId,
            ref:"Category",
            required:true
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
    {timestamps:true}
);

export const Product= mongoose.model("Product", productSchema)