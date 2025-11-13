// BookDetail.jsx
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_HOST = "http://localhost:4000/api"; // change if needed

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reservation UI state
  const [notes, setNotes] = useState("");
  const [reserving, setReserving] = useState(false);
  const [message, setMessage] = useState(null);
  const [reservation, setReservation] = useState(null); // hold created reservation if returned

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_HOST}/books/${id}`);
        const data = await res.json();
        if (res.ok && (data.success === undefined || data.success === true)) {
          // Accept APIs that return { success: true, data: ... } OR direct { ... }
          setBook(data.data ?? data);
        } else {
          setBook(null);
          const errMsg = data?.message || "Failed to fetch book";
          setMessage({ type: "error", text: errMsg });
        }
      } catch (err) {
        console.error(err);
        setBook(null);
        setMessage({ type: "error", text: "Network error fetching book" });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBook();
  }, [id]);

 

  const handleReserve = async () => {
    setMessage(null);
    setReserving(true);
  
    try {
      const res = await fetch("http://localhost:4000/api/loans/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ sends the cookie automatically
        body: JSON.stringify({
          book_id: id,
          notes: notes || undefined,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        const errMsg = data?.message || "Failed to reserve book";
        setMessage({ type: "error", text: errMsg });
        return;
      }
  
      setMessage({ type: "success", text: "Reservation created successfully." });
    } catch (err) {
      console.error("Reserve error:", err);
      setMessage({ type: "error", text: "Server error" });
    } finally {
      setReserving(false);
    }
  };
  

  if (loading) return <p>Loading...</p>;
  if (!book) return <p>Book not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {book.bookImage && (
        <img
          src={book.bookImage}
          alt={book.title}
          className="w-full h-96 object-contain rounded-md mb-4"
        />
      )}

      <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
      <p className="text-gray-700 mb-1">by {book.author}</p>
      {book.genre && <p className="text-gray-500 mb-2">Genre: {book.genre}</p>}
      <p className="text-gray-800 mb-4">{book.description}</p>

      <span
        className={`inline-block px-3 py-1 rounded ${
          book.available > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {book.available > 0 ? `Available (${book.available})` : "Checked out"}
      </span>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note for staff (pickup preference, comments...)"
          className="w-full border rounded p-2 mb-3 min-h-[100px] resize-vertical"
        />
      </div>

      {message && (
        <div
          className={`p-3 my-2 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {reservation && (
        <div className="p-3 my-2 rounded bg-blue-50 text-blue-800">
          <strong>Reservation details:</strong>
          <div>Reservation ID: {reservation._id || reservation.id}</div>
          <div>Status: {Array.isArray(reservation.status) ? reservation.status.join(", ") : reservation.status}</div>
          <div>Approved: {String(reservation.approved)}</div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button onClick={handleReserve} disabled={reserving}>
          {reserving ? "Reserving..." : book.available > 0 ? "Reserve" : "Notify me"}
        </Button>
      </div>
    </div>
  );
};

export default BookDetail;

