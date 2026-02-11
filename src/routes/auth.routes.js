import { Router } from "express";
import { managerCreateUser, adminCreateUser, login, registerCashier } from "../controllers/auth.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.route("/registerCashier").post(registerCashier);
authRouter.route("/adminCreateUser").post(authorize(["admin"]),adminCreateUser);
authRouter.route("/managerCreateUser").post(authorize(["manager"]), managerCreateUser);
authRouter.route("/login").post(login);

export default authRouter;
