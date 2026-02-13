
import { Router } from "express";
import { getDailyRevenue, getMonthlySummary, getMonthlyBreakdown, getYearlySummary,getProfitReport,getTopSellingProducts, getSalesByPaymentMethod, exportSalesToExcel, exportSalesToPDF } from "../controllers/reports.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";

const reportsRouter= new Router();
reportsRouter.route('/DailyRevenue').get(getDailyRevenue)
reportsRouter.route('/MonthlyBreakdown').get(authorize(['admin','manager']),getMonthlyBreakdown)
reportsRouter.route('/monthSalesSummary').get(authorize(['admin','manager']),getMonthlySummary) 
reportsRouter.route('/ProfitReport').get(authorize(['admin','manager']),getProfitReport)
reportsRouter.route('/TopSellingProducts').get(authorize(['admin','manager']),getTopSellingProducts)
reportsRouter.route('/getYearlySummary').get(authorize(['admin','manager']),getYearlySummary)
reportsRouter.route('/SalesByPaymentMethod').get(authorize(['admin','manager']),getSalesByPaymentMethod)
reportsRouter.route('/exportSalesToExcel').get(authorize(['admin','manager']),exportSalesToExcel)
reportsRouter.route('/exportSalesToPDF').get(authorize(['admin','manager']),exportSalesToPDF)
export default reportsRouter;