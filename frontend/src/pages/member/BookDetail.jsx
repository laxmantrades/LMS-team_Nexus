
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE } from "@/lib/utils";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

 
  const [notes, setNotes] = useState("");
  const [reserving, setReserving] = useState(false);
  const [message, setMessage] = useState(null);
  const [reservation, setReservation] = useState(null); 
  const [deleting, setDeleting] = useState(false);

  

  useEffect(() => {
    const fetchBookAndReservation = async () => {
      try {
        setLoading(true);
  
        const [bookRes, loanRes] = await Promise.all([
          fetch(`${API_BASE}/books/${id}`, { credentials: "include" }),
          fetch(`${API_BASE}/loans/my?book_id=${id}`, { credentials: "include" }),
        ]);
  
        const bookData = await bookRes.json().catch(() => ({}));
        if (bookRes.ok && (bookData.success === undefined || bookData.success === true)) {
          setBook(bookData.data ?? bookData);
        } else {
          setBook(null);
          setMessage({ type: "error", text: bookData?.message || "Failed to fetch book" });
        }
  
        // --- improved loan parsing ---
        // --- improved loan parsing ---
const loanData = await loanRes.json().catch(() => null);
if (loanRes.ok && loanData) {
  // If loanData is an empty object (no loan), treat as null.
  const isEmptyObject =
    typeof loanData === "object" &&
    !Array.isArray(loanData) &&
    Object.keys(loanData).length === 0;

  if (isEmptyObject) {
    setReservation(null);
  } else if ("loan" in loanData && loanData.loan == null) {
    // 👇 SPECIAL CASE: backend returned { loan: null }
    // → treat as no active reservation/loan
    setReservation(null);
  } else {
    setReservation(loanData.loan ?? loanData);
  }
} else {
  setReservation(null);
}
// ------------------------------

        // ------------------------------
      } catch (err) {
        console.error(err);
        setBook(null);
        setReservation(null);
        setMessage({ type: "error", text: "Network error fetching book or loan" });
      } finally {
        setLoading(false);
      }
    };
  
    if (id) fetchBookAndReservation();
  }, [id]);
  

  const handleReserve = async () => {
    setMessage(null);
    setReserving(true);

    try {
      const res = await fetch(`${API_BASE}/loans/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          book_id: id,
          notes: notes || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg = data?.message || "Failed to reserve book";
        setMessage({ type: "error", text: errMsg });
        return;
      }

      const createdLoan = data.loan ?? data;
      setReservation(createdLoan);
      setMessage({ type: "success", text: "Reservation created successfully." });
    } catch (err) {
      console.error("Reserve error:", err);
      setMessage({ type: "error", text: "Server error" });
    } finally {
      setReserving(false);
    }
  };

  

  if (loading) return <p>Loading...</p>;
  if (!book) return <p className="text-red-600">Book not found</p>;

  
  const statusArr = reservation
    ? Array.isArray(reservation.status)
      ? reservation.status.map(String)
      : [String(reservation.status)]
    : [];

  const isOverdue = statusArr.includes("overdue");
  const isBorrowed = statusArr.includes("borrowed");
  const isReserved = statusArr.includes("reserved");
  const hasReservation = !!reservation;

 
  let banner = null;
  if (isOverdue) {
    banner = {
      className: "bg-red-50 text-red-800",
      title: "Loan overdue — please return this book",
      note: "This loan is overdue. Please visit the library to return the book and pay any fines.",
    };
  } else if (isBorrowed) {
    banner = {
      className: "bg-blue-50 text-blue-800",
      title: "You have borrowed this book",
      note: "You currently have this book checked out.",
    };
  } else if (isReserved) {
    banner = {
      className: "bg-yellow-50 text-yellow-800",
      title: "You already reserved this book",
      note: "Your reservation is recorded. We'll notify you when it's available for pickup.",
    };
  }

  const statusText = reservation
    ? Array.isArray(reservation.status)
      ? reservation.status.join(", ")
      : reservation.status
    : null;

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

     
      {banner && (
        <div className={`p-3 my-4 rounded ${banner.className}`}>
          <strong>{banner.title}</strong>
          <div className="mt-2 text-sm">
            <div>
              <strong>Reservation ID:</strong> {reservation?._id ?? reservation?.id}
            </div>
            <div>
              <strong>Status:</strong> {statusText}
            </div>
            <div>
              <strong>Approved:</strong> {String(reservation?.approved ?? false)}
            </div>
            {reservation?.borrow_date && (
              <div>
                <strong>Borrowed on:</strong> {new Date(reservation.borrow_date).toLocaleString()}
              </div>
            )}
            {reservation?.due_date && (
              <div>
                <strong>Due date:</strong> {new Date(reservation.due_date).toLocaleDateString()}
              </div>
            )}
            {reservation?.notes && (
              <div>
                <strong>Notes:</strong> {reservation.notes}
              </div>
            )}
            <div className="mt-1 text-sm">{banner.note}</div>
          </div>
        </div>
      )}

      
      {!isBorrowed && !isReserved && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note for staff (pickup preference, comments...)"
            className="w-full border rounded p-2 mb-3 min-h-[100px] resize-vertical"
            disabled={hasReservation}
          />
        </div>
      )}

      {message && (
        <div
          className={`p-3 my-2 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-4 flex gap-2 items-center">
       
        {!isBorrowed && (
          <Button
            onClick={handleReserve}
            disabled={reserving || hasReservation || book.available <= 0}
            title={
              hasReservation
                ? "You already have a reservation for this book"
                : book.available <= 0
                ? "No copies available"
                : ""
            }
          >
            {reserving ? "Reserving..." : hasReservation ? "Reserved" : book.available > 0 ? "Reserve" : "Notify me"}
          </Button>
        )}

        
      </div>
    </div>
  );
};

export default BookDetail;
