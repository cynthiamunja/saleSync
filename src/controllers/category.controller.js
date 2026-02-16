import { Category } from "../models/category.model.js";

import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const serializeCategory = (category) => ({
  id: category._id,
  name: category.name,
  description: category.description,
  isActive: category.isActive,
  createdAt: category.createdAt
});
export const createCategory = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const normalizedName = name.trim().toLowerCase();

    const exists = await Category.findOne({
      name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" }
    });

    if (exists) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name: normalizedName,
      description,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: serializeCategory(category)
    });
  } catch (error) {
    next(error);
  }
};
export const getOneCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      data: serializeCategory(category)
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories.map(serializeCategory)
    });
  } catch (error) {
    next(error);
  }
};
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name && name.trim().toLowerCase() !== category.name) {
      const normalizedName = name.trim().toLowerCase();
      const exists = await Category.findOne({
        name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" }
      });

      if (exists) {
        return res.status(409).json({ message: "Category name already exists" });
      }

      category.name = normalizedName;
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (typeof isActive === "boolean") {
      category.isActive = isActive;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: serializeCategory(category)
    });
  } catch (error) {
    next(error);
  }
};
export const deactivateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (!category.isActive) {
      return res.status(400).json({ message: "Category already inactive" });
    }

    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category deactivated successfully",
      data: serializeCategory(category)
    });
  } catch (error) {
    next(error);
  }
};

export const activateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.isActive) {
      return res.status(400).json({ message: "Category already active" });
    }

    category.isActive = true;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category activated successfully",
      data: serializeCategory(category)
    });
  } catch (error) {
    next(error);
  }
};
export const searchCategories = async (req, res, next) => {
  try {
    const { q } = req.query;

    const filter = { isActive: true };

    if (q && typeof q === "string" && q.trim()) {
      filter.name = {
        $regex: escapeRegex(q.trim()),
        $options: "i"
      };
    }

    const categories = await Category.find(filter);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories.map(serializeCategory)
    });
  } catch (error) {
    next(error);
  }
};
