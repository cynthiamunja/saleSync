import { Category } from "../models/category.model.js";

export const createCategory = async (req, res, next) => {
    console.log("req.body:", req.body); // <- DEBUG
  try {

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category exists
    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(409).json({ message: "Category already exists" });
    }

    // Create category
    const newCategory = await Category.create({
      name,
      description,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Category created",
      data: newCategory
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories= async(req, res)=>{
    try{
      const categories= await Category.find({isActive:true})
      .sort({createdAt:-1})


      res.status(200).json({
        status:"success",
        results:categories.length,
        data:categories
      })
    } catch(error){
      next (error)
    }

}
export const getOneCategory=async(req,res, next)=>{

  try {
      const categoryId= req.params.id;
      const category= await Category.findById(categoryId)
      if(!category) return res.status(404).json({message:"category not found"})

      res.status(200).json({
        success:true,
        message:"the category",
        data:category
      })
  } catch (error) {
    next(error)
  }
}
export const updateCategory= async (req, res, next)=>{
try {

   const categoryId= req.params.id
  const {name, description, isActive}=req.body
  const category= await Category.findById(categoryId)

  if(!category){
    return res.status(404).json({message:"category not found"})

  }
if(name && name!== category.name){
  const exists= await Category.findOne({name});
  if(exists){
    return res.status(409).json({ message: "Category name already exists" });
  }
  category.name=name;
}
if (description!==undefined){
  category.description=description
}
    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    await category.save();
    res.status(200).json({
      success:true,
      message:"category updated successfully",
      data:category
    })
} catch (error) {
  next(error);
}

}

export const deactivateCategory= async (req, res, next)=>{
  try {
    const categoryId= req.params.id;
    const category= await Category.findById(categoryId)

    if (!category){
      return res.status(404).json({message:"category not found"})
    }
    if(!category.isActive){
      res.status(400).json({
        message:"category is already inactive"
      })
    }
    category.isActive=false
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category deactivated successfully",
      data: category
    })
  } catch (error) {
    next(error)
  }
}
export const activateCategory= async (req, res, next)=>{
  try {
    const categoryId= req.params.id;
    const category= await Category.findById(categoryId)

    if (!category){
      return res.status(404).json({message:"category not found"})
    }
    if(category.isActive){
      res.status(400).json({
        message:"category is already active"
      })
    }
    category.isActive=true;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category activated successfully",
      data: category
    })
  } catch (error) {
    next(error)
  }
}

export const searchCategories = async (req, res, next) => {
  try {
    const { q } = req.query;

    let filter = {};

    if (q && typeof q === "string" && q.trim() !== "") {
      filter.name = { $regex: q.trim(), $options: "i" };
    }

    const categories = await Category.find(filter);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });

  } catch (error) {
    next(error);
  }
};


