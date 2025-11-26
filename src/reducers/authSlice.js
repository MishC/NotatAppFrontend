import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authedUser: null,
  user: null,
  loading: true,
  guest: false,   
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthedUser(state, action) {
      state.authedUser = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setGuest(state, action) {     
      state.guest = action.payload;
    },
    resetAuth(state) {
      state.authedUser = null;
      state.user = null;
      state.loading = false;
      state.guest = false;
    },
  },
});

export const { setAuthedUser, setUser, setLoading, resetAuth, setGuest } =
  authSlice.actions;

export default authSlice.reducer;
