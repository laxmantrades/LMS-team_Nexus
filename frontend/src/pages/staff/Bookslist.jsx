import { API_BASE } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";


export default function BooksListPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  async function listBooks(query = "") {
    const res = await fetch(`${API_BASE}/books${query ? "?" + query : ""}`, {
      credentials: "include",
    });
    if (!res.ok)
      throw new Error((await res.json()).message || "Failed to list books");
    return res.json();
  }
  async function deleteBook(id) {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok)
      throw new Error((await res.json()).message || "Failed to delete book");
    return res.json();
  }

  async function fetchBooks() {
    setLoading(true);
    setError(null);
    try {
      const res = await listBooks();
      setBooks(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this book?")) return;
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Books</h2>
        <div>
          <Link
            to="/staff/books/create"
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Add Book
          </Link>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
  <>
    {/* Desktop Table (hidden on small screens) */}
    <div className="hidden sm:block overflow-x-auto">
      <table className="min-w-full table-auto border-collapse bg-white shadow rounded-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="p-2">Title</th>
            <th className="p-2">Author</th>
            <th className="p-2">Genre</th>
            <th className="p-2">Available</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b._id} className="border-t">
              <td className="p-2">{b.title}</td>
              <td className="p-2">{b.author}</td>
              <td className="p-2">{b.genre}</td>
              <td className="p-2">{b.available}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => navigate(`/staff/books/${b._id}/edit`)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
                <Link to={`/staff/books/${b._id}`} className="text-gray-600">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

   {/* Mobile Cards (shown only on small screens) */}
<div className="sm:hidden space-y-4">
  {books.map((b) => (
    <div
      key={b._id}
      className="bg-white p-4 rounded shadow border border-gray-200 text-center"
    >
      <div className="text-lg font-semibold">{b.title}</div>

      <div className="text-sm text-gray-700 mt-1">Author: {b.author}</div>
      <div className="text-sm text-gray-700">Genre: {b.genre}</div>
      <div className="text-sm text-gray-700">
        Available: {b.available}
      </div>

      {/* Buttons under the content (centered) */}
      <div className="flex justify-center gap-3 mt-4">
        <button
          onClick={() => navigate(`/staff/books/${b._id}/edit`)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(b._id)}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded"
        >
          Delete
        </button>
        <Link
          to={`/staff/books/${b._id}`}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded"
        >
          View
        </Link>
      </div>
    </div>
  ))}
</div>

  </>
)}

    </div>
  );
}
