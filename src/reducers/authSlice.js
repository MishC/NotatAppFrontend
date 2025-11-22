// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authedUser: null,  // napr. id usera
  user: null,        // detail user objekt (email, name, atď.)
  loading: true,     // kým zistíme, či je user prihlásený (kontrola tokenu)
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthedUser(state, action) {
      state.authedUser = action.payload; // napr. user id alebo null
    },
    setUser(state, action) {
      state.user = action.payload; // napr. { id, email, name } alebo null
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    resetAuth(state) {
      state.authedUser = null;
      state.user = null;
      state.loading = false;
    },
  },
});

export const { setAuthedUser, setUser, setLoading, resetAuth } = authSlice.actions;
export default authSlice.reducer;
