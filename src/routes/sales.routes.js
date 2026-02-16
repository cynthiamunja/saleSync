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

/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: Sale management endpoints
 */

/**
 * @swagger
 * /api/v1/sales/createSale:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [products, paymentMethod]
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sale created successfully
 */

/**
 * @swagger
 * /api/v1/sales/my-sales:
 *   get:
 *     summary: Get logged-in cashier sales
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cashier sales list
 */

/**
 * @swagger
 * /api/v1/sales/getAllSales:
 *   get:
 *     summary: Get all sales
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sales list
 */

/**
 * @swagger
 * /api/v1/sales/getActiveSales:
 *   get:
 *     summary: Get active sales
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active sales list
 */

/**
 * @swagger
 * /api/v1/sales/deactivateSale/{id}:
 *   patch:
 *     summary: Deactivate a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sale deactivated successfully
 */

salesRouter.post("/createSale", authorize(["cashier"]), createSale);


export default salesRouter;
