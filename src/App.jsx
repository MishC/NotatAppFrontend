import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth, AuthOnly, AuthPOnly } from "./helpers/authGuard";


import NoteApp from "./components/NoteApp";
import Login from "./components/Login";
import Subscribe from "./components/Subscribe";
import ForgottenPassword from "./components/ForgottenPassword";
import Diary from "./components/Diary";
import Home from "./components/Home";
import Calendar from "./components/Calendar";
import ResetPassword from "./components/ResetPassword";


import "./App.css";

export default function App() {
  

  return (
    <div className="App mb-62.5">
      <Routes>
        {/* Main */}
        <Route
          path="/todo"
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
        {/* Forgotten Password */}
        <Route
          path="/forgotten-password"
          element={
            <AuthPOnly>
              <ForgottenPassword />
            </AuthPOnly>
          }
        />

        {/* Reset Password */}
        <Route
          path="/reset-password"
          element={
            <AuthPOnly>
              <ResetPassword />
            </AuthPOnly>
          }
        />

        {/*Diary */}
        <Route
          path="/diary"
          element={
            <RequireAuth>
              <Diary />
            </RequireAuth>
          }
        />
          <Route
          path="/calendar"
          element={
            <RequireAuth>
              <Calendar />
            </RequireAuth>
          }
        />

          <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
     
      </Routes>
    </div>
  );
}

