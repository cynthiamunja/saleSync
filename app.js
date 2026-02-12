import express from "express";
import authRouter from "./src/routes/auth.routes.js";
import userRouter from "./src/routes/user.routes.js";
import categoryRouter from "./src/routes/category.routes.js";
import productsRouter from "./src/routes/products.routes.js";
import salesRouter from "./src/routes/sales.routes.js";
import reportsRouter from "./src/routes/reports.routes.js";

const app=express();
app.use(express.json())


app.use("/api/v1/auth",authRouter)
app.use("/api/v1/category", categoryRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/products", productsRouter)
app.use("/api/v1/sales", salesRouter)
app.use("/api/v1/reports", reportsRouter)
export default app;
