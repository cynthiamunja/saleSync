import {Router} from "express";
import { adminActivateUser, adminDeactivateUser, adminUpdateUser, getCashiers, getManagers, getUser, managerActivateCashier, managerDeactivateCashier, managerUpdateCashier, searchUsers, updateOneUser } from "../controllers/user.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";

const userRouter= Router();

userRouter.route('/getUser/:id').get(authorize(),getUser)
userRouter.route('/getCashiers').get(authorize(),getCashiers)
userRouter.route('/getManagers').get(authorize(),getManagers)
userRouter.route('/updateUser').patch(authorize(), updateOneUser)
userRouter.route('/managerUpdateCashier/:id').patch(authorize(["manager"]),managerUpdateCashier)
userRouter.route('/adminUpdateUser/:id').patch(authorize(["admin"]), adminUpdateUser)
userRouter.route('/managerActivateCashier/:id').patch(authorize(["manager"]), managerActivateCashier)
userRouter.route('/managerDeactivateCashier/:id').patch(authorize(["manager"]), managerDeactivateCashier)
userRouter.route('/adminActivateUser/:id').patch(authorize(["admin"]), adminActivateUser)
userRouter.route('/adminDeactivateUser/:id').patch(authorize(["admin"]), adminDeactivateUser)
userRouter.route('/searchUsers').get(authorize(['admin','manager']), searchUsers)

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/v1/users/getUser/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User retrieved
 */

/**
 * @swagger
 * /api/v1/users/getCashiers:
 *   get:
 *     summary: Get all cashiers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cashiers list
 */

/**
 * @swagger
 * /api/v1/users/getManagers:
 *   get:
 *     summary: Get all managers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Managers list
 */

/**
 * @swagger
 * /api/v1/users/updateUser:
 *   patch:
 *     summary: Update current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User updated
 */

/**
 * @swagger
 * /api/v1/users/adminUpdateUser/{id}:
 *   patch:
 *     summary: Admin updates any user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User updated
 */


export default userRouter;