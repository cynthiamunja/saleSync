import express from "express";
import authRouter from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productsRouter from "./routes/products.routes.js";
import salesRouter from "./routes/sales.routes.js";
import reportsRouter from "./routes/reports.routes.js";
import userRouter from "./routes/user.routes.js";

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
app.use(express.json());

// ===== ROUTES =====
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/sales", salesRouter);
app.use("/api/v1/reports", reportsRouter);
app.use("/api/v1/users", userRouter);

// ===== SWAGGER SETUP =====
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "POS Backend API",
      version: "1.0.0",
      description: "API documentation for your POS system",
    },
    servers: [
      {
        url: "https://sale-sync.onrender.com/", // replace with Render URL once deployed
      },
    ],
  },
  apis: ["./src/routes/*.js"], // points to your routes files
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

export default app;
