import {Router} from "express";
import { activateCategory, createCategory, deactivateCategory, getAllCategories, getOneCategory, searchCategories, updateCategory } from "../controllers/category.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";


const categoryRouter= Router();

categoryRouter.route("/createCategory").post(authorize(["manager","admin"]),createCategory);
categoryRouter.route("/getAllCategories").get(authorize(),getAllCategories);
categoryRouter.route("/getOneCategory/:id").get(authorize(),getOneCategory);
categoryRouter.route("/updateCategory/:id").patch(authorize(["manager","admin"]),updateCategory)
categoryRouter.route("/deactivateCategory/:id").patch(authorize(["manager","admin"]),deactivateCategory)
categoryRouter.route("/activateCategory/:id").patch(authorize(["manager","admin"]),activateCategory)
categoryRouter.route("/searchCategories").get(authorize(), searchCategories);

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Manage product categories
 */

/**
 * @swagger
 * /categories/createCategory:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 */

/**
 * @swagger
 * /categories/getAllCategories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */

/**
 * @swagger
 * /categories/getOneCategory/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category object
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /categories/updateCategory/{id}:
 *   patch:
 *     summary: Update category details
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 */

/**
 * @swagger
 * /categories/activateCategory/{id}:
 *   patch:
 *     summary: Activate a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Category activated
 */

/**
 * @swagger
 * /categories/deactivateCategory/{id}:
 *   patch:
 *     summary: Deactivate a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Category deactivated
 */

export default categoryRouter;

