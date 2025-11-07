// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = "http://localhost:4000"; // backend base URL

// MEMBER SIGNUP  ---------------------------------------
export const memberSignup = createAsyncThunk(
  "auth/memberSignup",
  async ({ name, email, password,address }, thunkAPI) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // If your backend uses cookies for auth, uncomment:
        // credentials: "include",
        body: JSON.stringify({ name, email, password ,address}),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (_) {
        // backend didn't return JSON
      }

      if (!res.ok) {
        const message =
          data?.message || data?.error || "Member signup failed. Please try again.";
        return thunkAPI.rejectWithValue(message);
      }

      // Ensure we always have role on the client
      const payload = {
        ...data,
        role: "member",
      };

      return payload;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.message || "Network error during signup."
      );
    }
  }
);

// MEMBER LOGIN  ----------------------------------------
export const memberLogin = createAsyncThunk(
  "auth/memberLogin",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/member/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // If using cookie-based auth:
        // credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (_) {
        // no JSON or invalid JSON
      }

      if (!res.ok) {
        const message =
          data?.message || data?.error || "Member login failed. Please try again.";
        return thunkAPI.rejectWithValue(message);
      }

      const payload = {
        ...data,
        role: "member",
      };

      return payload;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.message || "Network error during login."
      );
    }
  }
);

// STAFF LOGIN (we'll hook this up later) ----------------
export const staffLogin = createAsyncThunk(
  "auth/staffLogin",
  async ({ email, password }, thunkAPI) => {
    try {
      // TODO: later we'll change this to your real admin route
      // For now, just fake it so the UI doesn't break.
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { role: "staff", email };
    } catch (err) {
      return thunkAPI.rejectWithValue("Staff login failed. Please try again.");
    }
  }
);

const initialState = {
  user: null,
  token: null, // if your backend returns JWT or similar
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      // If you store token in localStorage, clear it here:
      // localStorage.removeItem("authToken");
    },
    resetAuthState(state) {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // MEMBER SIGNUP
      .addCase(memberSignup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(memberSignup.fulfilled, (state, action) => {
        state.status = "succeeded";

        // Try to pick user + token from backend response
        const payload = action.payload || {};
        state.user = payload.user || { email: payload.email, role: payload.role };
        state.token = payload.token || null;

        // If you want to persist token:
        // if (state.token) localStorage.setItem("authToken", state.token);
      })
      .addCase(memberSignup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Member signup failed.";
      })

      // MEMBER LOGIN
      .addCase(memberLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(memberLogin.fulfilled, (state, action) => {
        state.status = "succeeded";

        const payload = action.payload || {};
        state.user = payload.user || { email: payload.email, role: payload.role };
        state.token = payload.token || null;

        // If you want to persist token:
        // if (state.token) localStorage.setItem("authToken", state.token);
      })
      .addCase(memberLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Member login failed.";
      })

      // STAFF LOGIN (still fake for now)
      .addCase(staffLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(staffLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(staffLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Staff login failed.";
      });
  },
});

export const { logout, resetAuthState } = authSlice.actions;

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthToken = (state) => state.auth.token;

export default authSlice.reducer;
