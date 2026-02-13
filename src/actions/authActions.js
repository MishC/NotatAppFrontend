import {
  registerApi,
  loginStartApi,
  verify2faApi,
  logoutApi,
} from "../backend/authApi";
import { setAuthedUser, setUser, setGuest, resetAuth } from "../reducers/authSlice";

function getErrorMessage(err) {
  if (!err) return "An unknown error occurred.";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  return "An error occurred.";
}

function handleError(err, setErr) {
  const message = getErrorMessage(err);
  console.error(err);
  if (typeof setErr === "function") setErr(message);
  return message;
}

export const hydrateAuth = () => (dispatch) => {
  try {
    const token = localStorage.getItem("accessToken");
    const email = localStorage.getItem("email");
    const isGuest = localStorage.getItem("guest") === "true";

    if (isGuest && !token) {
      dispatch(setGuest(true));
      dispatch(setAuthedUser(null));
      dispatch(setUser(null));
      return { success: true, guest: true };
    }

    if (token && email) {
      dispatch(setGuest(false));
      dispatch(setAuthedUser(email));
      dispatch(setUser({ email }));
      return { success: true, authed: true };
    }

    dispatch(resetAuth());
    return { success: true, authed: false };
  } catch (err) {
    const error = handleError(err);
    dispatch(resetAuth());
    return { success: false, error };
  }
};

// REGISTER
export async function registerAction({ email, password, phone, setMsg, setErr }) {
  try {
    await registerApi(email, password, phone);
    if (typeof setMsg === "function") setMsg("Registration successful.");
    return { success: true };
  } catch (err) {
    const error = handleError(err, setErr);
    return { success: false, error };
  }
}

// LOGIN START
export async function loginStartAction({ email, password, channel, setFlowId, setMsg, setErr }) {
  try {
    const { flowId } = await loginStartApi(email, password, channel);
    if (typeof setFlowId === "function") setFlowId(flowId);
    if (typeof setMsg === "function") setMsg(`A verification code has been sent via ${channel}.`);
    return { success: true, flowId };
  } catch (err) {
    const error = handleError(err, setErr);
    return { success: false, error };
  }
}

// VERIFY 2FA
export async function verify2faAction({
  flowId,
  code,
  channel,
  email,
  setMsg,
  setErr,
  dispatch,
  navigate,
}) {
  try {
    const { accessToken } = await verify2faApi(flowId, code, channel);

    if (!accessToken) {
      const msg = "Invalid access token returned";
      if (typeof setErr === "function") setErr(msg);
      return { success: false, error: msg };
    }

    localStorage.setItem("accessToken", accessToken);
    dispatch(setAuthedUser(email));
    dispatch(setUser({ email }));
    dispatch(setGuest(false));
    localStorage.setItem("email", email);

    if (typeof setMsg === "function") setMsg("Login successful! Redirecting...");
    if (typeof navigate === "function") navigate("/");

    return { success: true };
  } catch (err) {
    const error = handleError(err, setErr);
    return { success: false, error };
  }
}

// LOGOUT
export async function logoutAction({ dispatch, navigate }) {
  try {
    await logoutApi();
  } catch (err) {
    console.error("Logout API failed:", err);
    // continue to clear local state even if API failed
  } finally {
    localStorage.clear();
    if (typeof dispatch === "function") dispatch(resetAuth());
    if (typeof navigate === "function") navigate("/auth");
  }
  return { success: true };
}

export function enterGuestMode(dispatch, navigate) {
  try {
    localStorage.clear();
    localStorage.setItem("guest", "true");

    if (typeof dispatch === "function") {
      dispatch(resetAuth());
      dispatch(setGuest(true));
    }

    if (typeof navigate === "function") navigate("/");
    return { success: true };
  } catch (err) {
    const error = handleError(err);
    return { success: false, error };
  }
}

export function removeGuestMode(dispatch, navigate) {
  try {
    localStorage.clear();

    if (typeof dispatch === "function") {
      dispatch(resetAuth());
      dispatch(setGuest(false));
    }

    if (typeof navigate === "function") navigate("/auth");
    return { success: true };
  } catch (err) {
    const error = handleError(err);
    return { success: false, error };
  }
}