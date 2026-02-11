import express from "express";
import authRouter from "./src/routes/auth.routes.js";
import userRouter from "./src/routes/user.routes.js";
import categoryRouter from "./src/routes/category.routes.js";

const app=express();
app.use(express.json())


app.use("/api/v1/auth",authRouter)
app.use("/api/v1/category", categoryRouter)
app.use("/api/v1/users", userRouter)
export default app;
