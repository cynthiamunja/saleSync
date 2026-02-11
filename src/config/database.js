
import mongoose from "mongoose";

const connectDB= async()=>{
    try {
        mongoose.set('debug', true);
        const connectionInstance= await mongoose.connect(`${process.env.mongoDB_URI}`,{
            serverSelectionTimeoutMS: 5000, //timeout after 5s


        });
        console.log(`\n mongodb connected  ${connectionInstance.connection.host}`)

    } catch (error) {
        console.log("MongoDB connection failed:", error.message);
        console.error("Full error:", error);
        process.exit(1);
    }
}

export default connectDB;