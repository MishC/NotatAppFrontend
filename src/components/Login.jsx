import { useState, useEffect } from "react";
import { loginStart, verify2fa } from "../utils/auth.js";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { setAuthedUser, setUser } from "../reducers/authSlice";
import PasswordField from "./auth/PasswordField.jsx";
import AuthButton from "./auth/AuthButton.jsx";


import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [channel, setChannel] = useState("email");
  const [flowId, setFlowId] = useState(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoRunActive, setAutoRunActive] = useState(true);


  const navigate = useNavigate();
  const dispatch = useDispatch();


  useEffect(() => {
    const cleanupTimer = setTimeout(() => {
      setAutoRunActive(false);
    }, 1000);
    return () => {
      clearTimeout(cleanupTimer);
    };
  }, []);

  const onStart = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      if (!email || !pwd) {
        setErr("Email and Password are required.");
        setLoading(false);
        return;
      }

      const { flowId: newFlowId } = await loginStart(email, pwd, channel);
      setFlowId(newFlowId);
      setMsg(`A verification code has been sent via ${channel}.`);
    } catch (error) {
      setErr(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      if (!code) {
        setErr("Verification code is required.");
        setLoading(false);
        return;
      }

      const { accessToken } = await verify2fa(flowId, code, channel);

      if (!accessToken) {
        throw new Error("Invalid access token returned");
      }

      localStorage.setItem("accessToken", accessToken);

      dispatch(setAuthedUser(email));          // napr. e-mail ako "id" pre teraz
      dispatch(setUser({ email }));            // môžeš neskôr pridať name, id z JWT

      setMsg("Login successful! Redirecting...");

      setTimeout(() => {
        navigate("/");
      }, 500);


    } catch (error) {
      setErr(error.message || "Verification failed. Please check the code and try again.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Login">
      <div className="w-full min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 bg-slate-100 p-6 sm:p-2">
        <h1 className={`w-full md:w-auto text-[12px] font-bold text-slate-800 text-center sm:p-2 md:text-left  md:mr-20 md:ml-30 xs:mb-5 p-10  
          animated-color-hover ${autoRunActive ? 'auto-run' : ''}`}>
          <span className="block lg:hidden">Sign In</span>
          <span className="hidden lg:inline-block">Sign Into Your Account</span>
        </h1>
        <form
          onSubmit={!flowId ? onStart : onVerify}
          className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-10 space-y-6 text-lg md:mr-30"
        >


          {err && (
            <div className="text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
              {err}
            </div>
          )}

          {msg && (
            <div className="text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-lg">
              {msg}
            </div>
          )}

          {!flowId ? (
            // --- Login Start Form ---
            <>
              {/* Larger Input Fields (p-4) */}
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-4 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <PasswordField
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Password"
              />

              <div className="flex gap-8 pt-3 pb-1 items-center">
                <p className="text-slate-600 font-medium whitespace-nowrap">Verification Channel:</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="channel"
                    checked={channel === "email"}
                    onChange={() => setChannel("email")}
                    // Classes for bigger radio button
                    className="form-radio text-blue-600 w-5 h-5"
                  />
                  <span className="text-slate-700 text-xl">Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="channel"
                    checked={channel === "sms"}
                    onChange={() => setChannel("sms")}
                    // Classes for bigger radio button
                    className="form-radio text-blue-600 w-5 h-5"
                  />
                  <span className="text-slate-700 text-xl">SMS</span>
                </label>
              </div>

              <AuthButton loading={loading} label="Login" />



              <p className="text-center text-slate-600 pt-2">
                New user? <Link to="/subscribe" className="text-orange-500 hover:text-orange-700 font-semibold">Create an Account</Link>
              </p>
            </>
          ) : (
            // --- 2FA Verification Form ---
            <>
              <p className="text-center text-slate-700">
                Please enter the 6-digit code sent to you via **{channel.toUpperCase()}**.
              </p>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                className="w-full p-4 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-2xl text-center tracking-widest font-mono"
                value={code}
                onChange={e => setCode(e.target.value)}
                maxLength={6}
              />


              <AuthButton loading={loading} label="Verify Code" loadingLabel="Verifying..." />


              <p className="text-center text-sm text-slate-500 cursor-pointer hover:text-orange-500" onClick={() => setFlowId(null)}>
                Go back to login
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}