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
productsRouter.route('/searchProducts').get(authorize(),searchProducts)
export default productsRouter;