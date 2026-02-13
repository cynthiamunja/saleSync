import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import authRouter from "./src/routes/auth.routes.js";
import userRouter from "./src/routes/user.routes.js";
import productsRouter from "./src/routes/products.routes.js";
import categoryRouter from "./src/routes/category.routes.js";
import salesRouter from "./src/routes/sales.routes.js";
import reportsRouter from "./src/routes/reports.routes.js";

const app = express();

app.use(express.json());

// === ROUTES ===
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/sales", salesRouter);
app.use("/api/v1/reports", reportsRouter);

// === SWAGGER SETUP ===
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
        url: "https://sale-sync.onrender.com", // your live URL
      },
    ],
  },
  apis: ["./src/routes/*.js"], // <-- Swagger looks for JSDoc comments here
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Redirect root to Swagger
app.get("/", (req, res) => res.redirect("/api-docs"));

export default app;
