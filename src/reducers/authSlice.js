import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authedUser: null,     
  user: null,             
  loading: false,
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
      state.authedUser = null;
      state.user = null;
      state.loading = false;
      state.guest = false;
    },
  },
});

export const {
  setAuthedUser,
  setUser,
  setLoading,
  setGuest,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;

//new f -handle guest and user on refresh 
// we fyll in to Redux from local storage 

export const hydrateAuth = () => (dispatch) => {
  const token = localStorage.getItem("accessToken");
  const email = localStorage.getItem("email");
  const isGuest = localStorage.getItem("guest") === "true";

  if (isGuest && !token) {
    dispatch(setGuest(true));
    dispatch(setAuthedUser(null));
    dispatch(setUser(null));
    return;
  }

  if (token && email) {
    dispatch(setGuest(false));
    dispatch(setAuthedUser(email));
    dispatch(setUser({ email }));
    return;
  }

  dispatch(resetAuth());
};
