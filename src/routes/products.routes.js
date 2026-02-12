import { Router } from "express";
import { activateProduct, createProduct, deactivateProduct, getProductById, getProducts, searchProducts, updateProduct, updateStock } from "../controllers/products.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";


const productsRouter= new Router;

productsRouter.route('/createProduct').post(authorize(['admin','manager']),createProduct)
productsRouter.route('/getProducts').get(getProducts)
productsRouter.route('/getProductById/:id').get(getProductById)
productsRouter.route('/updateProduct/:id').patch(authorize(['manager','admin']),updateProduct)
productsRouter.route('/updateStock/:id').patch(updateStock)
productsRouter.route('/deactivateProduct/:id').patch(authorize(['manager','admin']),deactivateProduct)
productsRouter.route('/activateProduct/:id').patch(authorize(['manager','admin']),activateProduct)
productsRouter.route('/searchProducts').get(authorize(),searchProducts)
export default productsRouter;