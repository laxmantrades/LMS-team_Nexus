
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Member from "../models/member.model.js";

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


export const createMember = async (req, res) => {
  try {
    const { name, email, address, password, expiry_date } = req.body;

    
    const existing = await Member.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

  
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


export const getMembers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      q, 
      active,
    } = req.query;
    const filter={}

  

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

 
export const updateMember = async (req, res) => {
  try {
    const memberId = req.user?._id;

    if (!isObjectId(memberId)) {
      return res.status(400).json({ success: false, message: "Invalid member ID" });
    }

    const { oldPassword, newPassword, password, ...otherFields } = req.body;

    
    if (oldPassword || newPassword || password) {
      
      if (password && (!oldPassword || !newPassword)) {
        return res.status(400).json({
          success: false,
          message: "To change password, provide oldPassword and newPassword (do not use 'password' alone).",
        });
      }

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Both oldPassword and newPassword are required to change password.",
        });
      }

      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be a string of at least 6 characters.",
        });
      }

     
      const member = await Member.findById(memberId).select("+password"); // ensure password is returned
      if (!member) {
        return res.status(404).json({ success: false, message: "Member not found" });
      }

      const isMatch = await bcrypt.compare(oldPassword, member.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Current password is incorrect" });
      }

      
      member.password = await bcrypt.hash(newPassword, 10);
      
      Object.keys(otherFields).forEach((k) => {
        
        if (["email", "_id", "role", "createdAt", "updatedAt"].includes(k)) return;
        member[k] = otherFields[k];
      });

      await member.save();

      const sanitized = member.toObject();
      delete sanitized.password;

      return res.json({ success: true, message: "Password changed", data: sanitized });
    }

    
    const forbidden = ["_id", "role", "createdAt", "updatedAt", "password"];
    forbidden.forEach((f) => delete otherFields[f]);

   

    const updated = await Member.findByIdAndUpdate(memberId, otherFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("updateMember error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};


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