import { Routes, Route, Navigate } from "react-router-dom";

import { RequireAuth, AuthOnly } from "./helpers/authGuard";

import NoteApp from "./components/NoteApp";
import Login from "./components/Login";
import Subscribe from "./components/Subscribe";
import Diary from "./components/Diary";
import { Home } from "./components/Home";

import "./App.css";

export default function App() {
  
  

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
          path="/home"
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


