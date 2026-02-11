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


export default userRouter;