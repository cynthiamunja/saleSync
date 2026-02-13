import { Router } from "express";
import { managerCreateUser, adminCreateUser, login, registerCashier } from "../controllers/auth.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.route("/registerCashier").post(registerCashier);
authRouter.route("/adminCreateUser").post(authorize(["admin"]),adminCreateUser);
authRouter.route("/managerCreateUser").post(authorize(["manager"]), managerCreateUser);
authRouter.route("/login").post(login);


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user creation
 */

/**
 * @swagger
 * /api/v1/auth/registerCashier:
 *   post:
 *     summary: Register a new cashier
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cashier created successfully
 */

/**
 * @swagger
 * /api/v1/auth/adminCreateUser:
 *   post:
 *     summary: Admin creates a user (admin/manager/cashier)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manager, cashier]
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */

/**
 * @swagger
 * /api/v1/auth/managerCreateUser:
 *   post:
 *     summary: Manager creates a cashier
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cashier created successfully
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *      security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT
 */

export default authRouter;
