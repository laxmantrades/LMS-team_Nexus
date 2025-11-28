import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import BookForm from "./BookForm";
import { API_BASE } from "@/lib/utils";

export default function CreateBook() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  async function createBook(payload) {
    const res = await fetch(`${API_BASE}/books`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok)
      throw new Error((await res.json()).message || "Failed to create book");
    return res.json();
  }
  async function handleCreate(payload) {
    setLoading(true);
    try {
      await createBook(payload);
      navigate("/staff/books");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Create Book</h2>
      <BookForm onSubmit={handleCreate} submitting={loading} />
    </div>
  );
}
