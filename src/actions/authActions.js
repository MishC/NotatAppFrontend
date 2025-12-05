import {
  registerApi,
  loginStartApi,
  verify2faApi,
  logoutApi,
} from "../backend/authApi";
import { setAuthedUser, setUser, setGuest, resetAuth } from "../reducers/authSlice";

// REGISTER
export async function registerAction(email, password, phone) {
    const res = await registerApi(email, password, phone);
    console.log(res);
    return res
    //without setError to test

}


// LOGIN START
export async function loginStartAction({ email, password, channel, setFlowId, setMsg, setErr }) {
  try {
    const { flowId } = await loginStartApi(email, password, channel);
    setFlowId(flowId);
    setMsg(`A verification code has been sent via ${channel}.`);
  } catch (err) {
    console.error(err);
    setErr(err.message || "Login failed. Please check your credentials.");
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

    if (!accessToken) throw new Error("Invalid access token returned");

    localStorage.setItem("accessToken", accessToken);

    dispatch(setAuthedUser(email));
    dispatch(setUser({ email }));
    dispatch(setGuest(false));

    //After refresh redux will be initial state therefor ewe need setItem to local storage
    localStorage.setItem("email", email);

    setMsg("Login successful! Redirecting...");
    navigate("/");
  } catch (err) {
    console.error(err);
    setErr(
      err.message || "Verification failed. Please check the code and try again."
    );
    throw err;
  }
}

// LOGOUT
export async function logoutAction({ dispatch, navigate }) {
  try {
    await logoutApi();
  } catch (err) {
    console.error("Logout API failed:", err);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.clear();
    dispatch(resetAuth());
    navigate("/auth");
  }
}


export function enterGuestMode(dispatch, navigate) {
  // wipe any auth
 // localStorage.removeItem("accessToken");
   localStorage.clear();  
   localStorage.setItem("guest", "true");

  dispatch(resetAuth());
  dispatch(setGuest(true));

  navigate("/");
}

export function removeGuestMode(dispatch, navigate) {
  // wipe any auth
  //localStorage.removeItem("accessToken");
  //localStorage.removeItem("guest");
  localStorage.clear();

  dispatch(resetAuth());
  
  dispatch(setGuest(false));

  navigate("/auth");
}