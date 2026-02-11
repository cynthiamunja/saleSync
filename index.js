import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import app from "./app.js";

dotenv.config({
    path: './.env'
})

const startServer= async()=>{
  
    try {
    console.log("mongodb uri:", process.env.mongoDB_URI);
    console.log("Loaded port:",process.env.port);

    await connectDB();

    app.on("error",(error)=>{
        console.log("ERROR", error);
        throw error;
    });
    
    app.listen(process.env.port || 8000, ()=>{
        console.log(`server is running at port ${process.env.port}`)
    })
    } catch (error) {
        console.log("mongo db connection failed")
    }
}
startServer();