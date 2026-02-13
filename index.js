import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 4000;
    const MONGO_URI = process.env.MONGO_URI;

    console.log("MongoDB URI:", MONGO_URI);
    console.log("Loaded port:", PORT);

    await connectDB();

    app.on("error", (error) => {
      console.error("App error:", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};

startServer();
