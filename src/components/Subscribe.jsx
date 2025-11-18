import { useState } from "react";
import { register } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

export default function Subscribe() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onSubscribe = async (e) => {
    e.preventDefault(); // prevent page reload
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      if (!email || !pwd || !phone) {
        setErr("All fields are required.");
        setLoading(false);
        return;
      }

      const res = await register(email, pwd, phone);
      setMsg("Registration successful! 🎉 Redirecting to login...");

      // small delay so user sees success
      setTimeout(() => {
        navigate("/auth"); // Assuming '/auth' is the login route
      }, 1500);
    } catch (error) {
      setErr(error.message || "Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Subscribe">
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <form
          onSubmit={onSubscribe}
          className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6"
        >
          {/* Nicer Title Placement */}
          <h1 className="text-3xl font-extrabold text-slate-800 text-center mb-6">
            Create Your Account
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

          {/* Bigger Input Fields (p-4) */}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-4 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Phone Number (e.g., +1 555-123-4567)"
            className="w-full p-4 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-base"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            type="password"
            placeholder="Choose a Secure Password"
            className="w-full p-4 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-base"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold p-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Subscribe"}
          </button>
          
          <p className="text-center text-slate-600 pt-2">
              Already have an account? <Link to="/auth" className="text-orange-500 hover:text-orange-700 font-semibold">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}