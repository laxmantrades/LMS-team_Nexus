import mongoose from "mongoose";
import validator from "validator";

const MemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
      validate: {
        validator: function (v) {
          return isNaN(v);
        },
        message: "Name must contain letters, not numbers",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value) && !/^\d+@/.test(value);
        },
        message: "Email cannot start with only numbers",
      },
      // regular exp
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
  },
  { timestamps: true, collection: "members" }
);

export default mongoose.model("Member", MemberSchema);
