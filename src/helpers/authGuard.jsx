import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export function RequireAuth({ children }) {
  const token = localStorage.getItem("accessToken");
  const guest = useSelector((s) => s.auth.guest);
  const location = useLocation();

  if (!token && !guest) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}

export function AuthOnly({ children }) {
  const token = localStorage.getItem("accessToken");
  const guest = useSelector((s) => s.auth.guest);

  if (token || guest) {
    return <Navigate to="/" replace />;
  }

  return children;
}
