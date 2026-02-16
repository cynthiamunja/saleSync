import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, costPrice, stockQuantity, category } = req.body;

    if (!name || !description || price == null || costPrice == null || stockQuantity == null || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (![price, costPrice, stockQuantity].every(n => typeof n === "number" && n >= 0)) {
      return res.status(400).json({ message: "Invalid numeric values" });
    }

    if (!isValidObjectId(category)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price,
      costPrice,
      stockQuantity,
      category,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Product created",
      data: {
        id: product._id,
        name: product.name
      }
    });

  } catch (error) {
    next(error);
  }
};


export const getProducts = async (req, res, next) => {
  try {
    const { category, active } = req.query;
    const filter = {};

    if (category && isValidObjectId(category)) {
      filter.category = category;
    }

    if (active === "true") {
      filter.isActive = true;
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .select("-costPrice -__v");

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    next(error);
  }
};




export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updates = {};
    const allowedFields = ["name", "description", "price", "costPrice", "stockQuantity"];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.price < 0 || updates.costPrice < 0 || updates.stockQuantity < 0) {
      return res.status(400).json({ message: "Invalid numeric values" });
    }

    if (req.body.category) {
      if (!isValidObjectId(req.body.category)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      updates.category = req.body.category;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated",
      data: product
    });

  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { stockQuantity } = req.body;

    if (typeof stockQuantity !== "number") {
      return res.status(400).json({ message: "Invalid stock value" });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        stockQuantity: { $gte: -stockQuantity }
      },
      { $inc: { stockQuantity } },
      { new: true }
    );

    if (!product) {
      return res.status(400).json({ message: "Insufficient stock or product not found" });
    }

    res.status(200).json({
      message: "Stock updated",
      stockQuantity: product.stockQuantity
    });

  } catch (error) {
    next(error);
  }
};


export const deactivateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!product.isActive) {
      return res.status(400).json({ message: "Already inactive" });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({ message: "Product deactivated" });

  } catch (error) {
    next(error);
  }
};


export const activateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.isActive) {
      return res.status(400).json({ message: "Already is active" });
    }

    product.isActive = true;
    await product.save();

    res.status(200).json({ message: "Product activated" });

  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req, res, next) => {
  try {
    const q = req.query.q?.trim();

    const filter = q
      ? { name: { $regex: escapeRegex(q.slice(0, 50)), $options: "i" } }
      : {};

    const products = await Product.find(filter)
      .populate("category", "name")
      .select("-costPrice");

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    next(error);
  }
};

