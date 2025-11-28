import mongoose from "mongoose";
import validator from "validator";

const StaffSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
      
    },
    role: {
      type: String,
   
      default: "staff",
    },
    address:{
      type: String,
   
      default: "",
    },
    hired_on: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "staff" }
);

export default mongoose.model("Staff", StaffSchema);
