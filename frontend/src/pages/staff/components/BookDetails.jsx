// src/pages/BookDetails.jsx
import { API_BASE } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

/* Simple accessible modal */
function ConfirmModal({ open, title, description, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white max-w-lg w-full rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md border text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
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
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden md:flex">

        {/* Cover */}
        <div className="md:w-1/3 bg-gradient-to-br from-slate-50 to-white p-6 flex items-center justify-center">
          {book.bookImage ? (
            <img
              src={book.bookImage}
              alt={book.title}
              className="w-full h-[320px] object-contain rounded-lg"
            />
          ) : (
            <div className="w-full h-[320px] flex items-center justify-center rounded-lg bg-slate-100">
              <div className="text-slate-400">No cover image</div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="md:w-2/3 p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">{book.title}</h1>
              <p className="mt-1 text-sm text-slate-600">
                by <span className="font-medium text-slate-800">{book.author}</span>
              </p>

              <div className="mt-4 flex gap-2 flex-wrap">
                {book.genre && (
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                    {book.genre}
                  </span>
                )}

                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    book.available > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {book.available > 0 ? `Available (${book.available})` : 'Not available'}
                </span>

                <span className="text-xs text-slate-400 ml-2">
                  Added {new Date(book.added_on || book.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Staff Controls */}
            <div className="flex flex-col gap-2">
              <Link
                to={`/staff/books/${id}/edit`}
                className="text-blue-600 text-sm hover:underline"
              >
                Edit
              </Link>

              <button
                onClick={() => setConfirmOpen(true)}
                className="text-red-600 text-sm hover:underline"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 prose prose-slate max-w-none text-slate-700">
            <p>{book.description || <span className="text-slate-400">No description available.</span>}</p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mt-4 rounded-md px-3 py-2 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
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
