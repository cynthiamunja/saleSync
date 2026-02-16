import { Sale } from "../models/sales.models.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";



const getDayRange = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (isNaN(date)) throw new Error("Invalid date");

  const start = new Date(date);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

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
const MAX_RANGE_DAYS = 366;

const validateRange = (start, end) => {
  const diffDays = (end - start) / (1000 * 60 * 60 * 24);
  if (diffDays > MAX_RANGE_DAYS) {
    throw new Error("Date range too large");
  }
};

const safeCell = (value) => {
  if (typeof value === "string" && /^[=+\-@]/.test(value)) {
    return `'${value}`;
  }
  return value;
};



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


export const exportSalesToExcel = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    validateRange(start, end);

    const salesCursor = Sale.find({
      isActive: true,
      createdAt: { $gte: start, $lte: end }
    })
      .select("receiptNumber totalAmount paymentMethod createdAt")
      .cursor();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales");

    worksheet.columns = [
      { header: "Receipt", key: "receipt" },
      { header: "Amount", key: "amount" },
      { header: "Payment", key: "payment" },
      { header: "Date", key: "date" }
    ];

    for await (const sale of salesCursor) {
      worksheet.addRow({
        receipt: safeCell(sale.receiptNumber),
        amount: sale.totalAmount,
        payment: safeCell(sale.paymentMethod),
        date: sale.createdAt
      });
    }

    res.setHeader("Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition",
      "attachment; filename=sales-report.xlsx");

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    next(error);
  }
};


export const exportSalesToPDF = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    validateRange(start, end);

    const sales = await Sale.find({
      isActive: true,
      createdAt: { $gte: start, $lte: end }
    })
      .select("receiptNumber totalAmount paymentMethod createdAt")
      .lean();

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales-report.pdf"
    );

    doc.pipe(res);

    doc.fontSize(18).text("Sales Report", { align: "center" });
    doc.moveDown();

    for (const sale of sales) {
      doc
        .fontSize(11)
        .text(`Receipt: ${sale.receiptNumber}`)
        .text(`Amount: ${sale.totalAmount}`)
        .text(`Payment: ${sale.paymentMethod}`)
        .text(`Date: ${sale.createdAt.toISOString()}`)
        .moveDown();
    }

    doc.end();

  } catch (error) {
    next(error);
  }
};

