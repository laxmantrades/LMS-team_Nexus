import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

const BookCard = ({ book }) => {
  
  const truncateDescription = (text, wordLimit = 20) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
    
      {book?.bookImage && (
        <img
          src={book.bookImage}
          alt={book.title}
          className="w-full h-48 object-contain rounded-t-md"
        />
      )}

      <CardContent className="p-4 flex flex-col gap-2">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
            <p className="text-sm text-gray-600">by {book.author}</p>
            {book.genre && (
              <p className="text-sm text-gray-500 mt-1">Genre: {book.genre}</p>
            )}
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                book.available > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {book.available > 0
                ? `Available (${book.available})`
                : "Checked out"}
            </span>
          </div>
        </div>

       
        {book.description && (
          <p className="text-sm text-gray-700 mt-1">
            {truncateDescription(book.description, 20)}
          </p>
        )}

      
        <div className="mt-2 flex items-center gap-2">
          <Button asChild variant="outline" className="text-sm flex-1">
            <Link to={`/books/${book._id}`}>View</Link>
          </Button>
          <Button
            disabled={book.available <= 0}
            className="text-sm flex-1"
            size="sm"
          >
            {book.available > 0 ? "Reserve" : "Notify me"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
