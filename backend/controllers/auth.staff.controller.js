// backend/controllers/auth.staff.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import Staff from "../models/staff.model.js"; // adjust path if needed
import createError from "http-errors";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // fail fast in dev if not provided
  console.warn("Warning: JWT_SECRET not set — using fallback (not for production)");
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);

const signToken = (staff) => {
  // include tokenVersion to allow revocation when password resets/changes
  return jwt.sign(
    {
      id: staff._id,
      email: staff.email,
      role: staff.role,
      tokenVersion: staff.tokenVersion ?? 0,
    },
    JWT_SECRET || "fallback_jwt_secret",
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const sanitizeEmail = (email) => (email ? email.trim().toLowerCase() : email);

export const createStaff = async (req, res) => {
  try {
    // Require admin — prefer middleware, but keep check for safety
    if (!req.user || !req.user.role?.includes("admin")) {
      return res.status(403).json({ message: "Only admin can create staff" });
    }

    const { full_name, email: rawEmail, password } = req.body;
    const email = sanitizeEmail(rawEmail);

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "full_name, email and password are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Prefer unique index at DB level; this check reduces round trips but isn't perfect alone
    const existing = await Staff.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const staff = await Staff.create({
      full_name: full_name.trim(),
      email,
      password: hashedPassword,
      role: ["staff"],
      active: true,
      tokenVersion: 0,
    });

    return res.status(201).json({
      message: "Staff account created",
      staff: {
        id: staff._id,
        full_name: staff.full_name,
        email: staff.email,
        role: staff.role,
        active: staff.active,
      },
    });
  } catch (error) {
    // Handle duplicate key error (race)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(409).json({ message: "Email already in use" });
    }
    console.error("createStaff error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const loginStaff = async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = sanitizeEmail(rawEmail);

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Ensure we select password (in case schema has select:false)
    const staff = await Staff.findOne({ email, active: true }).select("+password").exec();
    if (!staff) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(staff);

    return res.json({
      message: "Login successful",
      token,
      staff: {
        id: staff._id,
        full_name: staff.full_name,
        email: staff.email,
        role: staff.role,
        active: staff.active,
      },
    });
  } catch (error) {
    console.error("loginStaff error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/auth/staff/change-password
 * body: { currentPassword, newPassword }
 * requires req.user.id set by auth middleware
 */
export const changeStaffPassword = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const staff = await Staff.findById(req.user.id).select("+password tokenVersion");
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, staff.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    staff.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    staff.tokenVersion = (staff.tokenVersion ?? 0) + 1; // revoke previous tokens
    await staff.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("changeStaffPassword error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const adminResetStaffPassword = async (req, res) => {
  try {
    if (!req.user || !req.user.role?.includes("admin")) {
      return res.status(403).json({ message: "Only admin can reset password" });
    }

    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ message: "newPassword is required and must be at least 6 characters" });
    }

    const staff = await Staff.findById(id).select("tokenVersion");
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    staff.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    staff.tokenVersion = (staff.tokenVersion ?? 0) + 1; // revoke old tokens
    await staff.save();

    // TODO: store admin ID and timestamp in an audit log collection for compliance
    return res.json({ message: "Password reset successfully by admin" });
  } catch (error) {
    console.error("adminResetStaffPassword error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
