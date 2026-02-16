import { User } from "../models/user.models.js";
import bcrypt from "bcrypt"

export const getUser = async (req, res) => {
  try {
    const requestedUserID = req.params.id; // ID from URL
    const tokenUserID = req.user._id.toString(); // ID from token
    const userRole = req.user.role;

    // Only allow:
    // 1️⃣ Admins: any user
    // 2️⃣ Users: only themselves
    if (tokenUserID !== requestedUserID && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you can only access your own data",
      });
    }

    const user = await User.findById(requestedUserID).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const getCashiers = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userID = req.user._id;

    let query = { role: "cashier" };

    if (userRole === "manager") {
      // Managers can see themselves too if they are cashiers (optional)
      query = { role: "cashier" };
    } else if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const cashiers = await User.find(query).select("-password");
    res.status(200).json({ success: true, data: cashiers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const getManagers = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const managers = await User.find({ role: "manager", isActive: true }).select("-password");

    res.status(200).json({ success: true, data: managers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
// Helper to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Escape regex input to prevent ReDoS
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

export const updateOneUser = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;
    const userId = req.user._id;

    const updates = {};

    if (fullName) updates.fullName = fullName;

    if (email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });
      if (emailExists) return res.status(409).json({ message: "Email already in use" });
      updates.email = email.toLowerCase();
    }

    if (phoneNumber) {
      const phoneExists = await User.findOne({
        phoneNumber,
        _id: { $ne: userId }
      });
      if (phoneExists) return res.status(409).json({ message: "Phone number already in use" });
      updates.phoneNumber = phoneNumber;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

export const managerUpdateCashier = async (req, res, next) => {
  try {
    const cashierId = req.params.id;

    if (!isValidObjectId(cashierId)) return res.status(400).json({ message: "Invalid cashier ID" });

    const cashier = await User.findById(cashierId);
    if (!cashier) return res.status(404).json({ message: "Cashier not found" });
    if (cashier.role !== "cashier") return res.status(403).json({ message: "Managers can only update cashiers" });

    const { fullName, email, phoneNumber } = req.body;
    const updates = {};

    if (fullName) updates.fullName = fullName;

    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: cashierId } });
      if (emailExists) return res.status(409).json({ message: "Email already in use" });
      updates.email = email.toLowerCase();
    }

    if (phoneNumber) {
      const phoneExists = await User.findOne({ phoneNumber, _id: { $ne: cashierId } });
      if (phoneExists) return res.status(409).json({ message: "Phone number already in use" });
      updates.phoneNumber = phoneNumber;
    }

    // 🔒 Ignore role & password
    const updatedCashier = await User.findByIdAndUpdate(cashierId, updates, { new: true }).select("-password");

    res.status(200).json({
      success: true,
      message: "Cashier updated successfully",
      data: updatedCashier
    });
  } catch (error) {
    next(error);
  }
};



export const adminUpdateUser= async (req, res, next)=>{
  try {
    const userId= req.params.id;
    const {fullName, email, phoneNumber, role}= req.body;
    const user= await User.findById(userId);
    if (!user){
      return res.status(404).json({mssage:"user not found"});
      
    }
    if(
      user._id.toString()=== req.user._id.toString()
    ){
      if (role || isActive===false){
         return res.status(400).json({
          message: "You cannot change your own role or deactivate yourself"
        });
      }
    }
    const updates={}
    if (fullName) updates.fullName = fullName;

    if (email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });

      if (emailExists) {
        return res.status(409).json({ message: "Email already in use" });
      }

      updates.email = email.toLowerCase();
    }

    if (phoneNumber) {
      const phoneExists = await User.findOne({
        phoneNumber,
        _id: { $ne: userId }
      });

      if (phoneExists) {
        return res.status(409).json({ message: "Phone number already in use" });
      }

      updates.phoneNumber = phoneNumber;
    }

    if (role) {
      if (!["admin", "manager", "cashier"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      updates.role = role;
    }

   
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser
    });


  } catch (error) {
    next(error);
  }
}

export const managerActivateCashier = async (req, res, next)=>{
  try {
    const cashierId= req.params.id;
    const cashier= await User.findById(cashierId);
    if(!cashier){
      return res.status(404).json({
        message:"cashier not found"
      });
    }
    if(cashier.role!=="cashier"){
      return res.status(403).json({
        message:"managers can only activate cashiers"
      })
    }
    if (cashier.isActive){
      return res.status(403).json({
        message:"cashier is already active"
      })
    }
    cashier.isActive=true;
    await cashier.save()

    res.status(200).json({
      success:true,
      message:"cashier activated successfully"
    })

  } catch (error) {
    next(error);
  }
}
export const managerDeactivateCashier = async (req, res, next) => {
  try {
    const cashierId = req.params.id;

    const cashier = await User.findById(cashierId);
    if (!cashier) {
      return res.status(404).json({ message: "Cashier not found" });
    }

    if (cashier.role !== "cashier") {
      return res.status(403).json({
        message: "Managers can only deactivate cashiers"
      });
    }

    if (!cashier.isActive) {
      return res.status(400).json({
        message: "Cashier is already inactive"
      });
    }

    cashier.isActive = false;
    await cashier.save();

    res.status(200).json({
      success: true,
      message: "Cashier deactivated successfully"
    });

  } catch (error) {
    next(error);
  }
};


export const adminActivateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isActive) {
      return res.status(400).json({ message: "User already active" });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User activated successfully"
    });

  } catch (error) {
    next(error);
  }
};

export const adminDeactivateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // 🔒 prevent self-deactivation
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot deactivate yourself"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(400).json({
        message: "User already inactive"
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User deactivated successfully"
    });

  } catch (error) {
    next(error);
  }
};
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const currentUser = req.user;
    const filter = {};

    if (q && typeof q === "string" && q.trim() !== "") {
      const safeQ = escapeRegex(q.trim().slice(0, 100)); // limit to 100 chars
      filter.$or = [
        { fullName: { $regex: safeQ, $options: "i" } },
        { email: { $regex: safeQ, $options: "i" } }
      ];
    }

    if (currentUser.role === "manager") filter.role = "cashier";

    const users = await User.find(filter).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};