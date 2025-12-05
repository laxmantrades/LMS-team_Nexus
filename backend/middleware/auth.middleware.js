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

    
    let user = await Staff.findById(decoded.id).select("-password");
    if (user) {
      
      req.user = user;
      req.userType = user.role === "admin" ? "admin" : "staff";
      return next();
    }


    user = await Member.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      req.userType = "member";
      return next();
    }

   
    return res.status(401).json({ message: "User not found or inactive" });
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};




export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user ==="member" || req.user==="staff") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }

  next();
};
export const staffAndAdminOnly=(req,res,next)=>{
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user ==="member" ) {
    return res.status(403).json({ message: "Access denied: Staff and Admin only" });
  }

  next();
}

// Only allow members
export const memberOnly = (req, res, next) => {
  if (!req.user || req.userType !== "member") {
    return res.status(403).json({ message: "Access denied: Members only" });
  }
  next();
};
