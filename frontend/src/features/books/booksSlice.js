// src/features/books/booksSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('http://localhost:4000/api/books', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });


      const text = await res.text();
      console.log(text);
      
   

      if (!res.ok) {
        
        try {
          const json = JSON.parse(text);
          return rejectWithValue(json.message || JSON.stringify(json));
        } catch {
          return rejectWithValue(res.statusText || 'Failed to fetch');
        }
      }

      const data = JSON.parse(text);
      return data.data; 
    } catch (err) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);


const booksSlice = createSlice({
  name: 'books',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearBooks(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearBooks } = booksSlice.actions;
export default booksSlice.reducer;
