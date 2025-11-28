import jwt from "jsonwebtoken";
import Staff from "../models/staff.model.js";
import Member from "../models/member.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "sumanlaxmanbibeksumitpushpa";

export const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization || "";
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // First try Staff collection (covers admin & staff)
    let user = await Staff.findById(decoded.id).select("-password");
    if (user) {
      // user.role is a string in your schema ("admin" or "staff")
      req.user = user;
      req.userType = user.role === "admin" ? "admin" : "staff";
      return next();
    }

    // Fallback: Member collection
    user = await Member.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      req.userType = "member";
      return next();
    }

    // Not found in either collection
    return res.status(401).json({ message: "User not found or inactive" });
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Only allow admins (user found in Staff and role === "admin")
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.userType !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }

  next();
};

// Only allow staff (non-admin staff)
export const staffOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user ==="member") {
    return res.status(403).json({ message: "Access denied: Staff only" });
  }

  next();
};

// Only allow members
export const memberOnly = (req, res, next) => {
  if (!req.user || req.userType !== "member") {
    return res.status(403).json({ message: "Access denied: Members only" });
  }
  next();
};
