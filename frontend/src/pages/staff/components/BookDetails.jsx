
import { API_BASE } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';


function ConfirmModal({ open, title, description, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
  <div
    className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
    onClick={onCancel}
  />
  <div className="relative bg-slate-900/90 border border-slate-700 max-w-lg w-full rounded-xl shadow-2xl overflow-hidden text-slate-100">
    <div className="p-6">
      <h3 className="text-lg font-semibold text-rose-300">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-300">
        {description}
      </p>
      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md border border-slate-600 text-sm text-slate-200 hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-500"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</div>

  );
}

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/books/${id}`, { credentials: 'include' });
        const json = await res.json();

        if (!mounted) return;

        if (res.ok) setBook(json.data ?? json);
        else setBook(null);
      } catch (err) {
        console.error(err);
        setBook(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [id]);

  const handleDelete = async () => {
    setConfirmOpen(false);
    setDeleting(true);

    try {
      const res = await fetch(`${API_BASE}/books/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage({ type: 'error', text: json?.message || 'Delete failed' });
        return;
      }

      navigate('/staff/books');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-2/5" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!book) {
    return <div className="max-w-4xl mx-auto p-6 text-red-600">Book not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden md:flex">

    {/* Cover */}
    <div className="md:w-1/3  bg-linear-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 flex items-center justify-center">
      {book.bookImage ? (
        <img
          src={book.bookImage}
          alt={book.title}
          className="w-full h-80 object-contain rounded-lg bg-slate-900"
        />
      ) : (
        <div className="w-full h-80 flex items-center justify-center rounded-lg bg-slate-800">
          <div className="text-slate-400">No cover image</div>
        </div>
      )}
    </div>

    {/* Content */}
    <div className="md:w-2/3 p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-100">
            {book.title}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            by <span className="font-medium text-slate-200">{book.author}</span>
          </p>

          <div className="mt-4 flex gap-2 flex-wrap">
            {book.genre && (
              <span className="px-3 py-1 rounded-full bg-indigo-900/60 text-indigo-200 text-sm">
                {book.genre}
              </span>
            )}

            <span
              className={`px-3 py-1 rounded-full text-sm ${
                book.available > 0
                  ? "bg-emerald-900/60 text-emerald-300"
                  : "bg-rose-900/60 text-rose-300"
              }`}
            >
              {book.available > 0
                ? `Available (${book.available})`
                : "Not available"}
            </span>

            <span className="text-xs text-slate-500 ml-2">
              Added {new Date(book.added_on || book.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Staff Controls */}
        <div className="flex flex-col gap-2">
          <Link
            to={`/staff/books/${id}/edit`}
            className="text-indigo-300 text-sm hover:text-indigo-200 hover:underline"
          >
            Edit
          </Link>

          <button
            onClick={() => setConfirmOpen(true)}
            className="text-rose-400 text-sm hover:text-rose-300 hover:underline"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 prose prose-invert max-w-none text-slate-200">
        <p>
          {book.description || (
            <span className="text-slate-500">
              No description available.
            </span>
          )}
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mt-4 rounded-md px-3 py-2 text-sm ${
            message.type === "success"
              ? "bg-emerald-900/60 text-emerald-200"
              : "bg-rose-900/60 text-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  </div>

  {/* Confirm Modal */}
  <ConfirmModal
    open={confirmOpen}
    title="Delete book"
    description="This action cannot be undone. Are you sure?"
    onCancel={() => setConfirmOpen(false)}
    onConfirm={handleDelete}
  />
</div>

  );
}
