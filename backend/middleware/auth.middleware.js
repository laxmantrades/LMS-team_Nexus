

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
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    let user, userType;
    const accountType = decoded.accountType || decoded.type || decoded.role;
    
    

    if (accountType === "staff" || accountType === "admin") {
      user = await Staff.findById(decoded.id).select("-password");
    
      
      userType = "staff";
    } else {
      user = await Member.findById(decoded.id).select("-password");
      userType = "member";
    }

    if (!user) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    req.user = user;
    req.userType = userType;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
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
  console.log(req.user.role=="staff");
  
  if (req.user.role  !== "staff") {
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
