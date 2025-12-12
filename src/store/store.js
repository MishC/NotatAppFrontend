import { configureStore } from "@reduxjs/toolkit";
import authReducer, { hydrateAuth } from "../reducers/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,  
  },
});
store.dispatch(hydrateAuth()); 