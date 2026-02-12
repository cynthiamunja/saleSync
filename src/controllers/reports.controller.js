import { Sale } from "../models/sales.models.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

/* ======================================================
   DATE HELPERS
====================================================== */

const getDayRange = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date)) throw new Error("Invalid date format. Use YYYY-MM-DD.");

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getMonthRange = (monthStr) => {
  const [year, month] = monthStr.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12)
    throw new Error("Invalid month format. Use YYYY-MM.");

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  return { start, end };
};

const getYearRange = (yearStr) => {
  const year = Number(yearStr);
  if (!year || year < 1970)
    throw new Error("Invalid year format. Use YYYY.");

  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);

  return { start, end };
};

/* ======================================================
   DAILY REVENUE
====================================================== */

export const getDailyRevenue = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date)
      return res.status(400).json({ message: "Date required (YYYY-MM-DD)" });

    const { start, end } = getDayRange(date);

    const result = await Sale.aggregate([
      { $match: { isActive: true, createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalSales: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: result[0] || { totalRevenue: 0, totalSales: 0 }
    });

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   MONTHLY SUMMARY
====================================================== */

export const getMonthlySummary = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month)
      return res.status(400).json({ message: "Month required (YYYY-MM)" });

    const { start, end } = getMonthRange(month);

    const result = await Sale.aggregate([
      { $match: { isActive: true, createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalSales: { $sum: 1 },
          totalItemsSold: { $sum: { $sum: "$products.quantity" } }
        }
      }
    ]);

    res.json({
      success: true,
      data: result[0] || {
        totalRevenue: 0,
        totalSales: 0,
        totalItemsSold: 0
      }
    });

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   MONTHLY BREAKDOWN (BY DAY)
====================================================== */

export const getMonthlyBreakdown = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month)
      return res.status(400).json({ message: "Month required (YYYY-MM)" });

    const { start, end } = getMonthRange(month);

    const result = await Sale.aggregate([
      { $match: { isActive: true, createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          dailyRevenue: { $sum: "$totalAmount" },
          totalSales: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: result });

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   YEARLY SUMMARY
====================================================== */

export const getYearlySummary = async (req, res, next) => {
  try {
    const { year } = req.query;
    if (!year)
      return res.status(400).json({ message: "Year required (YYYY)" });

    const { start, end } = getYearRange(year);

    const result = await Sale.aggregate([
      { $match: { isActive: true, createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalSales: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: result[0] || { totalRevenue: 0, totalSales: 0 }
    });

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   PROFIT REPORT (MONTHLY)
   NOTE: products must store costPrice inside sale
====================================================== */

export const getProfitReport = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month)
      return res.status(400).json({ message: "Month required (YYYY-MM)" });

    const { start, end } = getMonthRange(month);

    const result = await Sale.aggregate([
      { $match: { isActive: true, createdAt: { $gte: start, $lte: end } } },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ["$products.quantity", "$products.price"] }
          },
          totalCost: {
            $sum: { $multiply: ["$products.quantity", "$products.costPrice"] }
          }
        }
      },
      {
        $project: {
          totalRevenue: 1,
          totalCost: 1,
          totalProfit: { $subtract: ["$totalRevenue", "$totalCost"] }
        }
      }
    ]);

    res.json({
      success: true,
      data: result[0] || {
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0
      }
    });

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   TOP SELLING PRODUCTS (MONTHLY)
====================================================== */

export const getTopSellingProducts = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month)
      return res.status(400).json({ message: "Month required (YYYY-MM)" });

    const { start, end } = getMonthRange(month);

    const result = await Sale.aggregate([
      { $match: { isActive: true, createdAt: { $gte: start, $lte: end } } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalQuantitySold: { $sum: "$products.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$products.quantity", "$products.price"] }
          }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 5 }
    ]);

    res.json({ success: true, data: result });

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   SALES BY PAYMENT METHOD (MONTHLY)
====================================================== */

export const getSalesByPaymentMethod = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month)
      return res.status(400).json({ message: "Month required (YYYY-MM)" });

    const { start, end } = getMonthRange(month);

    const result = await Sale.aggregate([
      { $match: { isActive: true, createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$totalAmount" },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    res.json({ success: true, data: result });

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   EXPORT TO EXCEL
====================================================== */

export const exportSalesToExcel = async (req, res, next) => {
  try {
    const sales = await Sale.find({ isActive: true });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    worksheet.columns = [
      { header: "Receipt", key: "receiptNumber" },
      { header: "Amount", key: "totalAmount" },
      { header: "Payment", key: "paymentMethod" },
      { header: "Date", key: "createdAt" }
    ];

    sales.forEach(sale => worksheet.addRow(sale));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   EXPORT TO PDF
====================================================== */

export const exportSalesToPDF = async (req, res, next) => {
  try {
    const sales = await Sale.find({ isActive: true });

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales-report.pdf"
    );

    doc.pipe(res);

    doc.fontSize(18).text("Sales Report", { align: "center" });
    doc.moveDown();

    sales.forEach(sale => {
      doc
        .fontSize(12)
        .text(`Receipt: ${sale.receiptNumber}`)
        .text(`Amount: ${sale.totalAmount}`)
        .text(`Payment: ${sale.paymentMethod}`)
        .text(`Date: ${sale.createdAt}`)
        .moveDown();
    });

    doc.end();

  } catch (error) {
    next(error);
  }
};
