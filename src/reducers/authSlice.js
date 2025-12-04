import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authedUser: null, //default
  user: null,
  loading: true,
  guest: localStorage.getItem("guest") === "true",
  
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
      state.authedUser = null; //logout
      state.user = null;
      state.loading = false;
     // state.guest = false;
    },
  },
});

export const { setAuthedUser, setUser, setLoading, resetAuth, setGuest } =
  authSlice.actions;

export default authSlice.reducer;
