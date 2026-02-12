import { Router } from "express";
import { authorize } from "../middlewares/auth.middleware.js";
import { createSale, getMySales, getActiveSales, deactivateSale, getAllSales } from "../controllers/sales.controllers.js";

const salesRouter = Router();

// Cashiers can create a sale
salesRouter.post("/createSale", authorize(["cashier"]), createSale);

// Cashiers can get only their own sales
salesRouter.get("/my-sales", authorize(["cashier"]), getMySales);

// Admins/managers can get all sales (optionally Get Only Active Sales/Get Only Inactive Sales/Filter by Cashier/Filter by Date Range)
salesRouter.get("/getAllSales", authorize(["admin", "manager"]), getAllSales);

salesRouter.get("/getActiveSales", authorize(["admin", "manager"]), getActiveSales);

// Admins/managers can deactivate (soft delete) a sale
salesRouter.patch("/deactivateSale/:id", authorize(["admin", "manager"]), deactivateSale);

export default salesRouter;
