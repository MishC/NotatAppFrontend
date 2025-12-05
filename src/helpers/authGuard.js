import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export function RequireAuth({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const guest = useSelector((s) => s.auth.guest);

  useEffect(() => {
    if (!token && !guest) {
      navigate("/auth", { replace: true });
    }
  }, [token, guest, navigate]);

  if (!token && !guest) return null; // nič nere renderuj, počkaj na redirect

  return children;
}

/**
 * Only for pages: /auth (login) and /subscribe (register)
 * If user is authenticated OR is guest → redirect to homepage
 */
export function AuthOnly({ children }) {
   const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const guest = useSelector((s) => s.auth.guest);

  if (token || guest) {
     navigate("/auth", { replace: true });

  }

  return children;
}
