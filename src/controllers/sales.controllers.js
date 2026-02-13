import { Sale } from "../models/sales.models.js";
import { Product } from "../models/product.model.js";
import { Counter } from "../models/counter.model.js"; // for receipt sequence
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Helper to generate PDF receipt
const generatePDFReceipt = (sale) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const fileName = `receipt-${sale.receiptNumber}.pdf`;
  const filePath = path.join("receipts", fileName);

  // Ensure receipts folder exists
  if (!fs.existsSync("receipts")) fs.mkdirSync("receipts");

  doc.pipe(fs.createWriteStream(filePath));

  // HEADER
  doc.fontSize(20).text("POS Receipt", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Receipt Number: ${sale.receiptNumber}`);
  doc.text(`Date: ${new Date(sale.createdAt).toLocaleString()}`);
  doc.text(`Cashier ID: ${sale.cashier}`);
  doc.moveDown();

  // TABLE HEADER
  doc.fontSize(14).text("Items Purchased:");
  doc.moveDown(0.5);

  sale.products.forEach((p, index) => {
    doc.fontSize(12).text(
      `${index + 1}. Product ID: ${p.product} | Qty: ${p.quantity} | Price: KES ${p.price} | Subtotal: KES ${p.price * p.quantity}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total Amount: KES ${sale.totalAmount}`, { align: "right" });
  doc.end();

  return filePath;
};

export const createSale = async (req, res, next) => {
  try {
    const { products, paymentMethod } = req.body; // [{ productId, quantity }]

    if (!products || !products.length || !paymentMethod)
      return res.status(400).json({ message: "Products and payment method required" });

    let totalAmount = 0;
    const saleProducts = [];

    // Update stock and calculate total
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive)
        return res.status(404).json({ message: `Product not found: ${item.productId}` });

      if (item.quantity > product.stockQuantity)
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`
        });

      product.stockQuantity -= item.quantity;
      await product.save();

      totalAmount += product.price * item.quantity;

      saleProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Generate unique receipt number
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    const counter = await Counter.findOneAndUpdate(
      { month, year },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );

    const sequence = String(counter.sequence).padStart(2, "0");
    const receiptNumber = `sale-${month}-${year}-${sequence}`;

    // Create sale
    const sale = await Sale.create({
      receiptNumber,
      products: saleProducts,
      totalAmount,
      cashier: req.user._id,
      paymentMethod
    });

    // Generate PDF receipt
    const pdfPath = generatePDFReceipt(sale);

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
      receiptPDF: pdfPath
    });
  } catch (error) {
    next(error);
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
  try {
    const sale = await Sale.findById(req.params.id).populate("products.product");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    if (!sale.isActive) {
      return res.status(400).json({ message: "Sale already deactivated" });
    }

    // Restore stock
    for (const item of sale.products) {
      const product = item.product;
      product.stockQuantity += item.quantity;
      await product.save();
    }

    sale.isActive = false;
    await sale.save();

    res.status(200).json({
      success: true,
      message: "Sale voided and stock restored"
    });

  } catch (error) {
    next(error);
  }
};

