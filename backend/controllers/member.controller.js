// controllers/members.controller.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Member from "../models/member.model.js";

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new member 
export const createMember = async (req, res) => {
  try {
    const { name, email, address, password, expiry_date } = req.body;

    // Check for existing email
    const existing = await Member.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await Member.create({
      name,
      email,
      address,
      password: hashedPassword,
      expiry_date,
     
    });
    

  

    res.status(201).json({ success: true, data: memberData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all members
export const getMembers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      q, // search
      active,
    } = req.query;

  

    if (active !== undefined) {
      filter.active = active === "true";
    }

    const numericLimit = Math.min(Number(limit) || 10, 100);
    const numericPage = Math.max(Number(page) || 1, 1);

    const [items, total] = await Promise.all([
      Member.find(filter)
        .select("-password")
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit)
        .sort("-createdAt"),
      Member.countDocuments(filter),
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

// Get a single member by ID
export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const member = await Member.findById(id).select("-password");
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }

    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update member 
export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const member = await Member.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }

    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete member
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }

    res.json({ success: true, message: "Member deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};