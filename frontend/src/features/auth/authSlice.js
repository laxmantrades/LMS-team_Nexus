// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = "http://localhost:4000";

// Helper: read persisted user
const persistedUser = (() => {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

// --- Thunks --------------------------------------------------

export const memberSignup = createAsyncThunk(
  "auth/memberSignup",
  async ({ name, email, password, address }, thunkAPI) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, address }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data?.message || "Member signup failed.";
        return thunkAPI.rejectWithValue(message);
      }

      // backend should return created member in data (and set cookie if desired)
      const member = data.member || data.data || null;
      return { member };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Network error during signup.");
    }
  }
);

export const memberLogin = createAsyncThunk(
  "auth/memberLogin",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/member/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important for httpOnly cookie
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data?.message || "Member login failed.";
        return thunkAPI.rejectWithValue(message);
      }

      // backend returns { message, member } and sets cookie
      const member = data.member || data.data || null;
      return { member };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Network error during login.");
    }
  }
);

// Real staff login (replace the stub)
export const staffLogin = createAsyncThunk(
  "auth/staffLogin",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
     
      
      if (!res.ok) {
        const message = data?.message || "Staff login failed.";
        return thunkAPI.rejectWithValue(message);
      }

      const staff = data.staff || data.data || null;
      return { staff };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Network error during staff login.");
    }
  }
);

// Logout thunk: call server to clear cookie & clear local state
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/member/logout", {
        method: "POST",
        credentials: "include", // ✅ send cookie for clearing
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data?.message || "Logout failed";
        return thunkAPI.rejectWithValue(message);
      }

      return { message: data.message || "Logged out successfully" };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Network error during logout");
    }
  }
);


// --- Slice ---------------------------------------------------

const initialState = {
  user: persistedUser, // { id, email, role, ... } or null
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // local-only logout (clear state & localStorage)
    clearAuthState(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("auth_user");
    },
    resetAuthState(state) {
      state.status = "idle";
      state.error = null;
    },
    // NEW: set user (update ui + persist)
    setUser(state, action) {
      state.user = action.payload || null;
      if (action.payload) {
        localStorage.setItem("auth_user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("auth_user");
      }
    },
  },
  extraReducers: (builder) => {
    // memberSignup
    builder
      .addCase(memberSignup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(memberSignup.fulfilled, (state, action) => {
        state.status = "succeeded";
        const member = action.payload?.member || null;
        state.user = member ? { ...member, role: "member" } : null;
        if (member) localStorage.setItem("auth_user", JSON.stringify(state.user));
      })
      .addCase(memberSignup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Member signup failed.";
      })

      // memberLogin
      .addCase(memberLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(memberLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        const member = action.payload?.member || null;
        state.user = member ? { ...member, role: "member" } : null;
        if (member) localStorage.setItem("auth_user", JSON.stringify(state.user));
      })
      .addCase(memberLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Member login failed.";
      })

      // staffLogin
      .addCase(staffLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(staffLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        const staff = action.payload?.staff || null;
        ///TODO staff as admin or staff 
        console.log(staff);
        
        state.user = staff ? { ...staff, role: staff.role || "staff" } : null;
        if (staff) localStorage.setItem("auth_user", JSON.stringify(state.user));
      })

      .addCase(staffLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Staff login failed.";
      })

      // logout
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.user = null;
        localStorage.removeItem("auth_user"); // clear persisted user
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Logout failed.";
      });
  },
});

export const { clearAuthState, resetAuthState ,setUser} = authSlice.actions;

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
