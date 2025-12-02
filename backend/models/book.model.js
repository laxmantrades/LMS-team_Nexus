import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    genre: { type: String, trim: true },
    bookImage: { type: String, trim: true },
    published_date: { type: Date },
    available: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000,
      validate: {
        validator: Number.isInteger,
        message: "Available must be an integer value",
      },
    },
    added_on: { type: Date, default: Date.now },
    description: { type: String },
  },
  { timestamps: true, collection: "books" }
);

BookSchema.index({ title: "text", author: "text", genre: "text" });

export default mongoose.model("Book", BookSchema);
