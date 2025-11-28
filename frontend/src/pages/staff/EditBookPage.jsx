import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BookForm from "./components/BookForm";
import { API_BASE } from "@/lib/utils";

export default function EditBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function updateBook(id, payload) {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok)
      throw new Error((await res.json()).message || "Failed to update book");
    return res.json();
  }
  async function getBook(id) {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      credentials: "include",
    });
    if (!res.ok)
      throw new Error((await res.json()).message || "Failed to fetch book");
    return res.json();
  }
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getBook(id);
        if (mounted) setInitial(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleUpdate(payload) {
    setSaving(true);
    try {
      await updateBook(id, payload);
      navigate("/staff/books");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!initial) return <div className="text-red-600">Book not found</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Edit Book</h2>
      <BookForm
        initialData={initial}
        onSubmit={handleUpdate}
        submitting={saving}
      />
    </div>
  );
}
