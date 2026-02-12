import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, costPrice, stockQuantity, category } = req.body;

    // Required fields validation
    if (!name || !description || !price || !costPrice || !stockQuantity || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure category exists
    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      costPrice,
      stockQuantity,
      category,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Product created",
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { category, active } = req.query;
    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (active) {
      filter.isActive = true; // fixed typo
    }

    const products = await Product.find(filter)
      .populate("category", "name") // only populate category name
      .select("-__v"); // keep all product fields, including description

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
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

export const updateProduct= async (req, res, next)=>{

    try{
        const{name, description, price, costPrice, stockQuantity, category } = req.body;

        const product= await Product.findById(req.params.id);
        if (!product){
            return res.status.json({
                message:"product not found"
            })
        }
        if (category){
            const categoryExists= await Category.findById(category);
            if(!categoryExists){
                return res.status(404).json({message:"category not found"})

            }
            product.category=category;

        }
        if (name) product.name = name;
    if (description) product.description = description;
    if (price >= 0) product.price = price;
    if (costPrice >= 0) product.costPrice = costPrice;
    if (stockQuantity >= 0) product.stockQuantity = stockQuantity;

    await product.save();

      res.status(200).json({
      success: true,
      message: "Product updated",
      data: product
    });

    
    } catch(error){
        next (error)
    }
}
export const updateStock = async (req, res, next) => {
  try {
    const { stockQuantity } = req.body; // can be + or -

    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    const newStock = product.stockQuantity + stockQuantity;
    if (newStock < 0) {
  return res.status(400).json({
    message: "Stock cannot go below zero"
  });
}


    product.stockQuantity = newStock;
    await product.save();

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
    const { q } = req.query;

    let filter = {};

    if (q && q.trim() !== "") {
      filter.name = { $regex: q.trim(), $options: "i" };
    }

    const products = await Product.find(filter)
      .populate("category", "name");

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    next(error);
  }
};

