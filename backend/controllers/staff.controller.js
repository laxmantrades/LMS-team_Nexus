import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Staff from "../models/staff.model.js";

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


export const createStaff = async (req, res) => {
  try {
    const { full_name, email, password, role, active } = req.body;

    const existing = await Staff.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await Staff.create({
      full_name,
      email,
      password: hashedPassword,
      role,
      active,
    });

    const { password: _, ...staffData } = staff.toObject();
    res.status(201).json({ success: true, data: staffData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, q, role, active } = req.query;

    const filter = {};

    if (q) {
      filter.$or = [
        { full_name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    if (role) {
      filter.role = { $in: [role] };
    }

    if (active !== undefined) {
      filter.active = active === "true";
    }

    const numericLimit = Math.min(Number(limit) || 10, 100);
    const numericPage = Math.max(Number(page) || 1, 1);

    const [items, total] = await Promise.all([
      Staff.find(filter)
        .select("-password")
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit)
        .sort("-createdAt"),
      Staff.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit) || 1,
        limit: numericLimit,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const staff = await Staff.findById(id).select("-password");
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const staff = await Staff.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const staff = await Staff.findByIdAndDelete(id);
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    res.json({ success: true, message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};