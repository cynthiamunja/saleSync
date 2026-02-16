import { Sale } from "../models/sales.models.js";
import { Product } from "../models/product.model.js";
import { Counter } from "../models/counter.model.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const RECEIPT_DIR = path.resolve("receipts");
if (!fs.existsSync(RECEIPT_DIR)) fs.mkdirSync(RECEIPT_DIR);

const sanitizeFilename = (str) => str.replace(/[^a-zA-Z0-9-_]/g, "_");

const generatePDFReceipt = (sale) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const fileName = sanitizeFilename(`receipt-${sale.receiptNumber}.pdf`);
  const filePath = path.join(RECEIPT_DIR, fileName);
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("POS Receipt", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Receipt Number: ${sale.receiptNumber}`);
  doc.text(`Date: ${sale.createdAt.toISOString()}`);
  doc.text(`Cashier ID: ${sale.cashier}`);
  doc.moveDown();

  doc.fontSize(14).text("Items Purchased:");
  doc.moveDown(0.5);

  sale.products.forEach((p, idx) => {
    doc.fontSize(12).text(
      `${idx + 1}. Product ID: ${p.product} | Qty: ${p.quantity} | Price: KES ${p.price} | Subtotal: KES ${p.price * p.quantity}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total Amount: KES ${sale.totalAmount}`, { align: "right" });
  doc.end();

  return filePath;
};

export const createSale = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { products, paymentMethod } = req.body;
    if (!products?.length || !paymentMethod)
      throw { status: 400, message: "Products and payment method required" };

    let totalAmount = 0;
    const saleProducts = [];

    for (const item of products) {
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, isActive: true, stockQuantity: { $gte: item.quantity } },
        { $inc: { stockQuantity: -item.quantity } },
        { new: true, session }
      );
      if (!product)
        throw { status: 400, message: `Insufficient stock or product not found: ${item.productId}` };

      totalAmount += product.price * item.quantity;
      saleProducts.push({ product: product._id, quantity: item.quantity, price: product.price });
    }

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const counter = await Counter.findOneAndUpdate(
      { month, year },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true, session }
    );
    const receiptNumber = `sale-${month}-${year}-${String(counter.sequence).padStart(2, 2)}`;

    const sale = await Sale.create([{
      receiptNumber,
      products: saleProducts,
      totalAmount,
      cashier: req.user._id,
      paymentMethod
    }], { session });

    await session.commitTransaction();
    session.endSession();

    const pdfPath = generatePDFReceipt(sale[0]);

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale[0],
      receiptPDF: pdfPath
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error.status ? error : { ...error, status: 500 });
  }
};




export const getSaleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findById(id)
      .populate("products.product", "name price category")
      .populate("cashier", "fullName email");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json({
      success: true,
      data: sale
    });

  } catch (error) {
    next(error);
  }
};

export const getMySales = async (req, res, next) => {
  try {
    const sales = await Sale.find({ cashier: req.user._id, isActive: true })
      .populate("products.product", "name price")
      .populate("cashier", "fullName email");

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    next(error);
  }
};
export const getAllSales = async (req, res, next) => {
  try {
    const { cashierId, categoryId, startDate, endDate, active } = req.query;

    let filter = {};

    // Filter by active/inactive sales
    if (active === "true") filter.isActive = true;
    else if (active === "false") filter.isActive = false;
    // if active not specified, return both

    // Filter by cashier
    if (cashierId) filter.cashier = cashierId;

    // Filter by date range
    if (startDate || endDate) filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);

    // Filter by product category if provided
    if (categoryId) {
      filter["products.product"] = { $in: await Product.find({ category: categoryId }).distinct("_id") };
    }

    const sales = await Sale.find(filter)
      .populate("products.product", "name price category description")
      .populate("cashier", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveSales = async (req, res, next) => {
  try {
    const { cashierId, categoryId, startDate, endDate } = req.query;

    let filter = { isActive: true };

    if (cashierId) filter.cashier = cashierId;
    if (startDate || endDate) filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);

    const sales = await Sale.find(filter)
      .populate("products.product", "name price category")
      .populate("cashier", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateSale = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const sale = await Sale.findById(req.params.id).populate("products.product").session(session);
    if (!sale) throw { status: 404, message: "Sale not found" };
    if (!sale.isActive) throw { status: 400, message: "Sale already deactivated" };

    // Restore stock atomically
    for (const item of sale.products) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stockQuantity: item.quantity } },
        { session }
      );
    }

    sale.isActive = false;
    await sale.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Sale voided and stock restored" });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error.status ? error : { ...error, status: 500 });
  }
};


