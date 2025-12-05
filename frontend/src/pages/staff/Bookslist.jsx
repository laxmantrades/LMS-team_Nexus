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
    <h2 className="text-xl font-semibold text-indigo-100">Books</h2>
    <div>
      <Link
        to="/staff/books/create"
        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1 rounded shadow-sm"
      >
        Add Book
      </Link>
    </div>
  </div>

  {loading && <div className="text-slate-300">Loading...</div>}
  {error && <div className="text-rose-400">{error}</div>}

  {!loading && !error && (
    <>
   
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full table-auto border-collapse bg-slate-900/80 shadow rounded-sm text-slate-100">
          <thead className="bg-slate-800">
            <tr className="text-left text-slate-200">
              <th className="p-2">Title</th>
              <th className="p-2">Author</th>
              <th className="p-2">Genre</th>
              <th className="p-2">Available</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b._id} className="border-t border-slate-800">
                <td className="p-2">{b.title}</td>
                <td className="p-2 text-slate-300">{b.author}</td>
                <td className="p-2 text-slate-300">{b.genre}</td>
                <td className="p-2 text-slate-200">{b.available}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => navigate(`/staff/books/${b._id}/edit`)}
                    className="text-indigo-300 hover:text-indigo-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    Delete
                  </button>
                  <Link
                    to={`/staff/books/${b._id}`}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      <div className="sm:hidden space-y-4">
        {books.map((b) => (
          <div
            key={b._id}
            className="bg-slate-900/80 p-4 rounded shadow border border-slate-800 text-center text-slate-100"
          >
            <div className="text-lg font-semibold text-indigo-100">
              {b.title}
            </div>

            <div className="text-sm text-slate-300 mt-1">
              Author: {b.author}
            </div>
            <div className="text-sm text-slate-300">
              Genre: {b.genre}
            </div>
            <div className="text-sm text-slate-200">
              Available: {b.available}
            </div>

            {/* Buttons under the content (centered) */}
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => navigate(`/staff/books/${b._id}/edit`)}
                className="px-3 py-1 text-sm bg-indigo-900/70 text-indigo-200 rounded hover:bg-indigo-800/80"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(b._id)}
                className="px-3 py-1 text-sm bg-rose-900/70 text-rose-200 rounded hover:bg-rose-800/80"
              >
                Delete
              </button>
              <Link
                to={`/staff/books/${b._id}`}
                className="px-3 py-1 text-sm bg-slate-800/80 text-slate-200 rounded hover:bg-slate-700/80"
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
