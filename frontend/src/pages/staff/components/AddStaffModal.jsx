import React, { useState, useEffect } from "react";



//AddStaffModal component
export function AddStaffModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "staff",
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.full_name || !form.email || !form.password) {
      setError("Please fill name, email and password.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/staff/", {
        method: "POST",
        credentials: "include", // send cookies (if your auth uses httpOnly cookie)
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create staff");

      onCreated && onCreated(data.data);
      setForm({ full_name: "", email: "", password: "", role: "staff", active: true });
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
  <div
    className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
    onClick={onClose}
  />

  <div className="relative w-full max-w-lg bg-slate-900/90 border border-slate-700 rounded-2xl shadow-2xl p-6 z-10 text-slate-100">
    <h3 className="text-xl font-semibold mb-4 text-indigo-100">Add Staff</h3>

    {error && <div className="text-sm text-rose-400 mb-2">{error}</div>}

    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-200">
          Full name
        </label>
        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 text-slate-100 px-3 py-2 placeholder:text-slate-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200">
          Email
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 text-slate-100 px-3 py-2 placeholder:text-slate-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200">
          Password
        </label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 text-slate-100 px-3 py-2 placeholder:text-slate-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3 items-center">
        <div>
          <label className="block text-sm font-medium text-slate-200">
            Role
          </label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 text-slate-100 px-3 py-2"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            checked={form.active}
            onChange={handleChange}
            className="h-4 w-4 rounded accent-indigo-500"
          />
          <label htmlFor="active" className="text-sm text-slate-200">
            Active
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Staff"}
        </button>
      </div>
    </form>
  </div>
</div>

  );
}
