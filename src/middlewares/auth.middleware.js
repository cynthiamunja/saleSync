import { JWT_SECRET } from "../config/constants.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const authorize = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      let token;

      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await User.findById(decoded.userID);
      if (!user || !user.isActive) return res.status(401).json({ message: "Unauthorized" });

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
