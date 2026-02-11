import {Router} from "express";
import { activateCategory, createCategory, deactivateCategory, getAllCategories, getOneCategory, searchCategories, updateCategory } from "../controllers/category.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";


const categoryRouter= Router();

categoryRouter.route("/createCategory").post(authorize(["manager","admin"]),createCategory);
categoryRouter.route("/getAllCategories").get(authorize(),getAllCategories);
categoryRouter.route("/getOneCategory/:id").get(getOneCategory);
categoryRouter.route("/updateCategory/:id").patch(authorize(["manager","admin"]),updateCategory)
categoryRouter.route("/deactivateCategory/:id").patch(authorize(["manager","admin"]),deactivateCategory)
categoryRouter.route("/activateCategory/:id").patch(authorize(["manager","admin"]),activateCategory)
categoryRouter.route("/searchCategories").get(authorize(), searchCategories)
export default categoryRouter;

