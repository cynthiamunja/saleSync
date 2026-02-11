import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/constants.js";

// ================== REGISTER CASHIER ==================
export const registerCashier = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    const exists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phoneNumber }]
    });

    if (exists) return res.status(409).json({ message: "User already exists" });

    await User.create({
      fullName,
      email: email.toLowerCase(),
      password, // hashed automatically by pre-save hook
      phoneNumber,
      role: "cashier" // forced
    });

    res.status(201).json({
      success: true,
      message: "Cashier registered successfully"
    });
  } catch (err) {
    next(err);
  }
};

// ================== ADMIN CREATE USER ==================
export const adminCreateUser = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber, role } = req.body;

    if (!["admin", "manager", "cashier"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const exists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phoneNumber }]
    });

    if (exists) return res.status(409).json({ message: "User already exists" });

    await User.create({
      fullName,
      email: email.toLowerCase(),
      password, // hashed automatically
      phoneNumber,
      role
    });

    res.status(201).json({
      success: true,
      message: `User created by admin as ${role}`
    });
  } catch (err) {
    next(err);
  }
};

// ================== MANAGER CREATE CASHIER ==================
export const managerCreateUser = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber, role } = req.body;

    // 🔒 Only allow manager to create "manager" or "cashier"
    if (!["manager", "cashier"].includes(role)) {
      return res.status(403).json({ message: "Managers can only create managers or cashiers" });
    }

    // 🔍 Check if user already exists
    const exists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phoneNumber }]
    });

    if (exists) return res.status(409).json({ message: "User already exists" });

    // ✅ Create user (password hashed automatically in model)
    await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phoneNumber,
      role
    });

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created by manager`
    });

  } catch (err) {
    next(err);
  }
};


// ================== LOGIN ==================
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "User not found" });

if (!user.isActive) {
  return res.status(403).json({ message: "User is deactivated" });
}

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ userID: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Optionally update lastLogin
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token, user }
    });
  } catch (err) {
    next(err);
  }
};
