// import express from "express";
// import {
//   getSalesSummary,
//   getSalesByPaymentMethod,
//   getTopSellingProducts
// } from "../controllers/report.controller.js";

// const router = express.Router();

// router.get("/summary", getSalesSummary);
// router.get("/payment-methods", getSalesByPaymentMethod);
// router.get("/top-products", getTopSellingProducts);

// export default router;
import { Router } from "express";
import { getDailyRevenue, getMonthlySummary, getMonthlyBreakdown, getYearlySummary,getProfitReport,getTopSellingProducts, getSalesByPaymentMethod, exportSalesToExcel, exportSalesToPDF } from "../controllers/reports.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";

const reportsRouter= new Router();
reportsRouter.route('/DailyRevenue').get(getDailyRevenue)
reportsRouter.route('/MonthlyBreakdown').get(authorize(['manager']),getMonthlyBreakdown)
reportsRouter.route('/monthSalesSummary').get(authorize(['manager']),getMonthlySummary) 
reportsRouter.route('/ProfitReport').get(authorize(['manager']),getProfitReport)
reportsRouter.route('/TopSellingProducts').get(authorize(['manager']),getTopSellingProducts)
reportsRouter.route('/getYearlySummary').get(getYearlySummary)
reportsRouter.route('/SalesByPaymentMethod').get(authorize(['manager']),getSalesByPaymentMethod)
reportsRouter.route('/exportSalesToExcel').get(authorize(['manager']),exportSalesToExcel)
reportsRouter.route('/exportSalesToPDF').get(authorize(['manager']),exportSalesToPDF)
export default reportsRouter;