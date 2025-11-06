// backend/middleware/auth.middleware.js

import jwt from "jsonwebtoken";
import Staff from "../models/staff.model.js";
import Member from "../models/member.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export const protect = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Decode token
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    let userType = null;

    // Prefer explicit accountType
    if (decoded.accountType === "staff") {
      user = await Staff.findById(decoded.id).select("-password");
      userType = "staff";
    } else if (decoded.accountType === "member") {
      user = await Member.findById(decoded.id).select("-password");
      userType = "member";
    } else {
      // Fallback: try both collections if accountType missing
      user = await Staff.findById(decoded.id).select("-password");
      if (user) {
        userType = "staff";
      } else {
        user = await Member.findById(decoded.id).select("-password");
        if (user) userType = "member";
      }
    }

    if (!user) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    req.user = user;
    req.userType = userType; // for later checks (like staffOnly/memberOnly)
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


export const adminOnly = (req, res, next) => {
  if (!req.user || req.userType !== "staff") {
    return res.status(403).json({ message: "Admins must be staff users" });
  }

  if (!req.user.role || !req.user.role.includes("admin")) {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }

  next();
};


export const staffOnly = (req, res, next) => {
  if (!req.user || req.userType !== "staff") {
    return res.status(403).json({ message: "Access denied: Staff only" });
  }
  next();
};


export const memberOnly = (req, res, next) => {
  if (!req.user || req.userType !== "member") {
    return res.status(403).json({ message: "Access denied: Members only" });
  }
  next();
};
