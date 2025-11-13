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
      // NOTE: store only the bcrypt hash here, never plain text LL
    },
    role: {
      type: String,
   
      default: "staff",
    },
    hired_on: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "staff" }
);

export default mongoose.model("Staff", StaffSchema);
