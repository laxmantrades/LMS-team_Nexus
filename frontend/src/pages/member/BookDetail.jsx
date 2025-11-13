import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/books/${id}`);
        const data = await res.json();
        if (data.success) {
          setBook(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);
 
  

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
        {book.available > 0
          ? `Available (${book.available})`
          : "Checked out"}
      </span>

      
      <div className="mt-4 flex gap-2">
        <Button disabled={book.available <= 0}>
          {book.available > 0 ? "Reserve" : "Notify me"}
        </Button>
      </div>
    </div>
  );
};

export default BookDetail;
