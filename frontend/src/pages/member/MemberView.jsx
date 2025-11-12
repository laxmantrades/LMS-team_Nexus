
import React, { useMemo, useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useDispatch, useSelector } from "react-redux";
import { fetchBooks } from "@/features/books/booksSlice";
import BookCard from "@/components/BookCard";


const MemberView = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");

  
  const books = useSelector((state) => state.books.items);
  const status = useSelector((state) => state.books.status);
  const error = useSelector((state) => state.books.error);

  
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBooks());
    }
  
    
  }, [dispatch, status]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        (b.title || '').toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q) ||
        (b.id || '').toLowerCase().includes(q)
    );
  }, [books, query]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome, Member</h1>
            <p className="text-sm text-gray-600 mt-1">Browse available books and manage your reservations.</p>
          </div>

          <div className="flex items-center gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books or authors..."
              className="w-[300px]"
            />
            <Button onClick={() => setQuery("")} variant="ghost">
              Clear
            </Button>
          </div>
        </div>

        <section>
       
          {status === 'loading' && (
            <div className="mb-4 text-gray-600">Loading books…</div>
          )}

          {status === 'failed' && (
            <div className="mb-4 text-red-600">Error loading books: {error}</div>
          )}

       
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {status === 'succeeded' && filtered.length === 0 && (
            <div className="mt-8 text-center text-gray-600">
              No books found. Try a different search term.
            </div>
          )}
        </section>

        <footer className="mt-10 text-sm text-gray-500">
          <p>
            Want to see more features? Staff have a different view with book management — coming soon.
          </p>
        </footer>
      </div>
    </main>
  );
};

export default MemberView;
