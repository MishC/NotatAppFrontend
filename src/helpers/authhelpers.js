import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetAuth } from "../reducers/authSlice";
import { logoutAction } from "../actions/authActions";

export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return async () => {
    try {
      await logoutAction({ dispatch, navigate });
    } finally {
      dispatch(resetAuth());
      navigate("/auth", { replace: true });
    }
  };
}

export function getDisplayName(user, guest) {
  if (typeof user === "string" && user.trim()) return user;
  if (user && typeof user === "object") {
    if (user.email) return String(user.email);
    if (user.name) return String(user.name);
  }
  return guest ? "Guest" : "Guest";
}

