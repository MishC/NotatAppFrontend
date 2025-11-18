// src/auth/Login.tsx
import { useState } from "react";
import { loginStart, verify2fa } from "../utils/auth.js";
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [channel, setChannel] = useState("email");
  const [flowId, setFlowId] = useState(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(""); // Add error state for consistency
  const [loading, setLoading] = useState(false); // Add loading state

  const navigate = useNavigate(); // Initialize useNavigate

  const onStart = async (e) => {
    e.preventDefault(); // Prevent form submission/page reload
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
    e.preventDefault(); // Prevent form submission/page reload
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
      setMsg("Login successful! Redirecting...");
      
      // Navigate to homepage after successful verification
      setTimeout(() => {
        navigate("/");
      }, 500);

    } catch (error) {
      setErr(error.message || "Verification failed. Please check the code and try again.");
      setCode(""); // Clear the code to force re-entry
      // Optionally, you might want to reset flowId here if you want the user to restart
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Login">
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <form
          onSubmit={!flowId ? onStart : onVerify} // Use form submission for consistency and accessibility
          className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6"
        >
          <h1 className="text-2xl font-bold text-slate-800 text-center">
            Sign In to Your Account
          </h1>

          {err && (
            <div className="text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
              {err}
            </div>
          )}

          {msg && (
            <div className="text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              {msg}
            </div>
          )}

          {!flowId ? (
            // --- Login Start Form ---
            <>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-4 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-base" // p-4 for bigger size
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-4 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-base" // p-4 for bigger size
                value={pwd}
                onChange={e => setPwd(e.target.value)}
              />
              
              <div className="flex gap-6 pt-2 pb-4">
                <p className="text-slate-600 font-medium">Verification Channel:</p>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="channel" checked={channel === "email"} onChange={() => setChannel("email")} className="form-radio text-blue-600" />
                  <span className="text-slate-700">Email code</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="channel" checked={channel === "sms"} onChange={() => setChannel("sms")} className="form-radio text-blue-600" />
                  <span className="text-slate-700">SMS code</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold p-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Login"}
              </button>
              
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
                className="w-full p-4 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-base text-center tracking-widest"
                value={code}
                onChange={e => setCode(e.target.value)}
                maxLength={6} // Typically 2FA codes are 6 digits
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold p-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
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