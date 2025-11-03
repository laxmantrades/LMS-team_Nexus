import mongoose from "mongoose";
import validator from "validator";

const MemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email"],
    },
    address: { type: String, required: true },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
    }, // store a bcrypt hash
    member_since: { type: Date, default: Date.now },
    expiry_date: { type: Date },
    active: { type: Boolean, default: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true, collection: "members" }
);

export default mongoose.model("Member", MemberSchema);