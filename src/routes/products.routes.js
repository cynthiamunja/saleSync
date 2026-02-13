import { Router } from "express";
import { activateProduct, createProduct, deactivateProduct, getProductById, getProducts, searchProducts, updateProduct, updateStock } from "../controllers/products.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";


const productsRouter= new Router;

productsRouter.route('/createProduct').post(authorize(['admin','manager']),createProduct)
productsRouter.route('/getProducts').get(authorize(),getProducts)
productsRouter.route('/getProductById/:id').get(authorize(),getProductById)
productsRouter.route('/updateProduct/:id').patch(authorize(['manager']),updateProduct)
productsRouter.route('/updateStock/:id').patch(authorize(['manager']),updateStock)
productsRouter.route('/deactivateProduct/:id').patch(authorize(['admin','manager']),deactivateProduct)
productsRouter.route('/activateProduct/:id').patch(authorize(['admin','manager']),activateProduct)
productsRouter.route('/searchProducts').get(authorize(),searchProducts);

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Manage products
 */

/**
 * @swagger
 * /products/createProduct:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
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
 *               - price
 *               - costPrice
 *               - stockQuantity
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               costPrice:
 *                 type: number
 *               stockQuantity:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 */

/**
 * @swagger
 * /products/getProducts:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 */

/**
 * @swagger
 * /products/getProductById/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *       security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product object
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/updateProduct/{id}:
 *   patch:
 *     summary: Update product details
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               costPrice:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated
 */

export default productsRouter;