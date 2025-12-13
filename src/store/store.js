// store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../reducers/authSlice";

const middlewares = [];

if (import.meta.env.DEV) {
  const mod = await import("redux-logger");   // top-level await is fine in Vite
  middlewares.push(mod.default);              // logger is the default export
}

export const store = configureStore({
  reducer: { auth: authReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(middlewares),
  devTools: import.meta.env.DEV,
});
