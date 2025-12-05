import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Staff from "../models/staff.model.js";

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createStaff = async (req, res) => {
  try {
    const { full_name, email, password, role, active } = req.body;
    if( !full_name || !email){
      return res.status(400).json({
        success: false,
        message: "Fullname and email is required "
      });
    }
    const nameRegex = /^[A-Za-z\s]+$/;


    if (!nameRegex.test(full_name)) {
      return res.status(400).json({
        message: "Full name must contain letters only (no numbers or symbols)",
      });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const existing = await Staff.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
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
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateStaff = async (req, res) => {
  try {
    
    const requester = req.user;
    const requesterType = req.userType; 
    const allowedRoles = ["admin", "staff"];

    
    const targetId = req.params.id || String(requester?._id);

    if (!isObjectId(targetId)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    
    const isSelf = requester && String(requester._id) === String(targetId);
    
    const isStaffType = requesterType === "staff";
    const isAdmin = requester && typeof requester.role === "string"
      ? requester.role.includes("admin")
      : Array.isArray(requester?.role)
      ? requester.role.includes("admin")
      : false;

   
    const { oldPassword, newPassword, password, ...otherFields } = req.body;

    
    if (oldPassword || newPassword || password) {
     
      if (password && (!oldPassword || !newPassword)) {
        return res.status(400).json({
          success: false,
          message:
            "To change password provide oldPassword and newPassword (do not use 'password' alone).",
        });
      }

     
      if (!isSelf && !isAdmin) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "newPassword must be a string of at least 6 characters",
        });
      }

     
      const staffDoc = await Staff.findById(targetId).select("+password");
      if (!staffDoc) {
        return res.status(404).json({ success: false, message: "Staff not found" });
      }

     
      if (!isAdmin || isSelf) {
        if (!oldPassword) {
          return res.status(400).json({
            success: false,
            message: "oldPassword is required to change your password",
          });
        }
        const match = await bcrypt.compare(oldPassword, staffDoc.password);
        if (!match) {
          return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }
      }

      
      staffDoc.password = await bcrypt.hash(newPassword, 10);

      
      const forbiddenFields = ["_id", "createdAt", "updatedAt", "password", "role"];
      Object.keys(otherFields).forEach((k) => {
        if (forbiddenFields.includes(k)) return;
        staffDoc[k] = otherFields[k];
      });

      await staffDoc.save();

      const sanitized = staffDoc.toObject();
      delete sanitized.password;
      return res.json({
        success: true,
        message: "Password updated",
        data: sanitized,
      });
    }

   
    const forbidden = ["_id", "createdAt", "updatedAt", "password"];
    forbidden.forEach((f) => delete otherFields[f]);

   
    if (!isAdmin) {
      delete otherFields.role;
     
    }

    
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updated = await Staff.findByIdAndUpdate(targetId, otherFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("updateStaff error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
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
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    res.json({ success: true, message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
