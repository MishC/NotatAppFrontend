import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import {hydrateAuth} from "./reducers/authSlice";
import { RequireAuth, AuthOnly } from "./helpers/authGuard";

import NoteApp from "./components/NoteApp";
import Login from "./components/Login";
import Subscribe from "./components/Subscribe";
import "./App.css";

export default function App() {
  
 const dispatch =useDispatch();
    useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  return (
    <div className="App mb-[250px]">
      <Routes>
        {/* Main */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <NoteApp />
            </RequireAuth>
          }
        />

        {/* Login */}
        <Route
          path="/auth"
          element={
            <AuthOnly>
              <Login />
            </AuthOnly>
          }
        />

        {/* Registation */}
        <Route
          path="/subscribe"
          element={
            <AuthOnly>
              <Subscribe />
            </AuthOnly>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
     
      </Routes>
    </div>
  );
}


