import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/constants.js";

const normalizeEmail = (email) => email.trim().toLowerCase();

const isStrongPassword = (password) =>
  typeof password === "string" && password.length >= 8;

const isValidPhone = (phone) =>
  typeof phone === "string" && phone.length >= 9;

const authFail = (res) =>
  res.status(400).json({ message: "Invalid email or password" });

export const registerCashier = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    if (!fullName || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const normalizedEmail = normalizeEmail(email);

    const exists = await User.findOne({
      $or: [{ email: normalizedEmail }, { phoneNumber }]
    });

    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      phoneNumber,
      role: "cashier"
    });

    res.status(201).json({
      success: true,
      message: "Cashier registered successfully"
    });
  } catch (err) {
    next(err);
  }
};
export const adminCreateUser = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { fullName, email, password, phoneNumber, role } = req.body;

    if (!["admin", "manager", "cashier"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: "Password too weak" });
    }

    const normalizedEmail = normalizeEmail(email);

    const exists = await User.findOne({
      $or: [{ email: normalizedEmail }, { phoneNumber }]
    });

    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      phoneNumber,
      role
    });

    res.status(201).json({
      success: true,
      message: "User created successfully"
    });
  } catch (err) {
    next(err);
  }
};

export const managerCreateUser = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { fullName, email, password, phoneNumber, role } = req.body;

    if (!["manager", "cashier"].includes(role)) {
      return res.status(403).json({
        message: "Managers can only create managers or cashiers"
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: "Password too weak" });
    }

    const normalizedEmail = normalizeEmail(email);

    const exists = await User.findOne({
      $or: [{ email: normalizedEmail }, { phoneNumber }]
    });

    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      phoneNumber,
      role
    });

    res.status(201).json({
      success: true,
      message: "User created successfully"
    });
  } catch (err) {
    next(err);
  }
};
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return authFail(res);
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.isActive) {
      return authFail(res);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return authFail(res);
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          isActive: user.isActive
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
