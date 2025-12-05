import Member from "../models/member.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sumanlaxmanbibeksumitpushpa";

const sanitizeMember = (memberDoc) => {
  if (!memberDoc) return null;
  const obj = memberDoc.toObject ? memberDoc.toObject() : memberDoc;
  delete obj.password;
  return obj;
};

export const registerMember = async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

    const nameRegex = /^[A-Za-z\s]+$/;

    if (!nameRegex.test(name)) {
      return res.status(400).json({
        message: "Full name must contain letters only (no numbers or symbols)",
      });
    }
    if (!name || !email || !address || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }
    if (password.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Password must not be more than 100 characters",
      });
    }

    const existing = await Member.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await Member.create({
      name,
      email,
      address,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Member registered successfully",
      member: sanitizeMember(member),
    });
  } catch (err) {
    console.error("registerMember error:", err);

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        message: errors[0],
        errors,
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
//login member

export const loginMember = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const member = await Member.findOne({ email });
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: member._id, email: member.email, accountType: "member" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      member: sanitizeMember(member),
    });
  } catch (err) {
    console.error("loginMember error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
//change password

export const changeMemberPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old and new passwords are required" });
    }

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, member.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long" });
    }

    member.password = await bcrypt.hash(newPassword, 10);
    await member.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("changeMemberPassword error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
