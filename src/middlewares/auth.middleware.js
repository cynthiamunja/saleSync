import { JWT_SECRET } from "../config/constants.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const authorize = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // ✅ Use 'sub' instead of 'userID'
      const user = await User.findById(decoded.sub);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized", error: err.message });
    }
  };
};

