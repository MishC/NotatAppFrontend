import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import NoteApp from "./components/NoteApp";
import Login from "./components/Login";
import Subscribe from "./components/Subscribe";
import "./App.css";

// Main page navigation with valid token only
function RequireAuth({ children }) {
  const token = localStorage.getItem("accessToken");
  const guest = useSelector((state) => state.auth.guest);

  if (!token && !guest) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

// Login/Subscribe if not logged in
function AuthOnly({ children }) {
  const token = localStorage.getItem("accessToken");
  const guest = useSelector((state) => state.auth.guest);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
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

export default App;
