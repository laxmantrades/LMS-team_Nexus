// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import booksReducer from '../features/books/booksSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: booksReducer, 
  },
});

export default store;
