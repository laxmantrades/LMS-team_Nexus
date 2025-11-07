// backend/controllers/auth.staff.controller.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Staff from "../models/staff.model.js"; // ⬅️ adjust path if needed

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const JWT_EXPIRES_IN = "7d";
const SALT_ROUNDS = 10;

/**
 * Helper: generate JWT token
 */
const generateToken = (staff) => {
  return jwt.sign(
    {
      id: staff._id,
      email: staff.email,
      role: staff.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * POST /api/auth/staff/create
 * Admin creates a staff account
 * - Only admin should be allowed to call this (use auth middleware to check req.user.role)
 * - Admin sets the initial password and shares it with the staff member
 */
export const createStaff = async (req, res) => {
  try {
    // Make sure only admin can create staff (requires auth middleware that sets req.user)
    if (!req.user || !req.user.role?.includes("admin")) {
      return res.status(403).json({ message: "Only admin can create staff" });
    }

    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res
        .status(400)
        .json({ message: "full_name, email and password are required" });
    }

    const existing = await Staff.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const staff = await Staff.create({
      full_name,
      email,
      password: hashedPassword,
      role: ["staff"], // force staff; admins are created manually in DB
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
    console.error("createStaff error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/auth/staff/login
 * Login for both admin and staff (they're all in Staff collection)
 * body: { email, password }
 */
export const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const staff = await Staff.findOne({ email, active: true });
    if (!staff) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(staff);

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
 * Staff changes own password (after login)
 * - Requires auth middleware that sets req.user.id
 * body: { currentPassword, newPassword }
 */
export const changeStaffPassword = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "currentPassword and newPassword are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, staff.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    staff.password = hashed;
    await staff.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("changeStaffPassword error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * (Optional) Admin reset staff password without knowing old one
 * POST /api/auth/staff/:id/reset-password
 * body: { newPassword }
 */
export const adminResetStaffPassword = async (req, res) => {
  try {
    if (!req.user || !req.user.role?.includes("admin")) {
      return res.status(403).json({ message: "Only admin can reset password" });
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res
        .status(400)
        .json({ message: "newPassword is required" });
    }

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    staff.password = hashed;
    await staff.save();

    return res.json({ message: "Password reset successfully by admin" });
  } catch (error) {
    console.error("adminResetStaffPassword error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
