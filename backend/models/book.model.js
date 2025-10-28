import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    // Using ObjectId for _id (Mongo default)
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    genre: { type: String, trim: true },
    published_date: { type: Date },
    available: { type: Number, default: 0, min: 0 }, // count of copies currently available
    added_on: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "books" }
);

// Useful for searching by title/author/genre
BookSchema.index({ title: "text", author: "text", genre: "text" });

export default mongoose.model("Book", BookSchema);
