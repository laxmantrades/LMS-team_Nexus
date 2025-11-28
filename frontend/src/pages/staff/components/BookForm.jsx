import React, { useState, useEffect } from "react";

export default function BookForm({ initialData = null, onSubmit, submitting = false }) {

  // ✅ Define 'empty' default form state
  const empty = {
    title: "",
    author: "",
    genre: "",
    bookImage: "",
    published_date: "",
    available: 0,
    description: ""
  };

  const [form, setForm] = useState(initialData ? mapIn(initialData) : empty);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm(initialData ? mapIn(initialData) : empty);
  }, [initialData]);

  function mapIn(data) {
    return {
      title: data.title || "",
      author: data.author || "",
      genre: data.genre || "",
      bookImage: data.bookImage || "",
      published_date: data.published_date
        ? new Date(data.published_date).toISOString().slice(0, 10)
        : "",
      available:
        typeof data.available !== "undefined" ? data.available : 0,
      description: data.description || ""
    };
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.author.trim()) {
      setError("Title and author are required.");
      return;
    }

    if (Number(form.available) < 0) {
      setError("Available copies cannot be negative.");
      return;
    }

    // Prepare payload
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre.trim() || undefined,
      bookImage: form.bookImage.trim() || undefined,
      published_date: form.published_date
        ? new Date(form.published_date).toISOString()
        : undefined,
      available: Number(form.available) || 0,
      description: form.description || undefined
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || "Submit failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium">Author *</label>
          <input
            name="author"
            value={form.author}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          />
        </div>

        {/* Genre */}
        <div>
          <label className="block text-sm font-medium">Genre</label>
          <input
            name="genre"
            value={form.genre}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium">Book Image URL</label>
          <input
            name="bookImage"
            value={form.bookImage}
            onChange={handleChange}
            placeholder="https://..."
            className="mt-1 w-full border rounded p-2"
          />
        </div>

        {/* Published Date */}
        <div>
          <label className="block text-sm font-medium">Published Date</label>
          <input
            type="date"
            name="published_date"
            value={form.published_date}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          />
        </div>

        {/* Available Copies */}
        <div>
          <label className="block text-sm font-medium">Available Copies</label>
          <input
            type="number"
            name="available"
            value={form.available}
            onChange={handleChange}
            min={0}
            className="mt-1 w-32 border rounded p-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {submitting ? "Saving..." : "Save Book"}
          </button>
        </div>
      </form>
    </div>
  );
}
