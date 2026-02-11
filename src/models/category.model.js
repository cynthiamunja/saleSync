import mongoose,{Schema} from "mongoose";

const categorySchema= new Schema(
    {
        name:{
            type:String,
            required:true,
            unique:true,
             trim: true,
        },
        description:{
            type:String,
             trim: true,
        },
        
            isActive:{
                type:Boolean,
                default:true
            }
    },
    {
        timestamps:true
    }
);

export const Category= mongoose.model("Category", categorySchema)