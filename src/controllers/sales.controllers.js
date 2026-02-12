import { Sale } from "../models/sales.models.js";
import { Product } from "../models/product.model.js";

export const createSale = async (req, res, next) => {
  try {
    const { products, paymentMethod } = req.body; // [{ productId, quantity }]

   
    if (!products || !products.length || !paymentMethod) {
  return res.status(400).json({ message: "Products and payment method required" });
}

    let totalAmount = 0;
    const saleProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (item.quantity > product.stockQuantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`
        });
      }

      // Reduce stock
      product.stockQuantity -= item.quantity;
      await product.save();

      const lineTotal = product.price * item.quantity;
      totalAmount += lineTotal;

      saleProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }
const now = new Date();
const month = String(now.getMonth() + 1).padStart(2, "0");
const year = now.getFullYear();

// Atomically increment sequence
const counter = await Counter.findOneAndUpdate(
  { month, year },
  { $inc: { sequence: 1 } },
  { new: true, upsert: true }
);

const sequence = String(counter.sequence).padStart(2, "0");

const receiptNumber = `sale-${month}-${year}-${sequence}`;

const sale = await Sale.create({
  receiptNumber,
  products: saleProducts,
  totalAmount,
  cashier: req.user._id,
  paymentMethod
});



    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale
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

