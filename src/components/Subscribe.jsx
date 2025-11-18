import { useState } from "react";
import { register } from "../utils/auth";
import { useNavigate } from "react-router-dom";

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
      setMsg("Registration successful! 🎉");

      // small delay so user sees success
      setTimeout(() => {
        navigate("/auth");
      }, 1000);
    } catch (error) {
      setErr(error.message || "Subscription failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <form
        onSubmit={onSubscribe}
        className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6"
      >
        <h1 className="text-3xl font-bold text-slate-800 text-center">
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

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="tel"
          placeholder="Phone number"
          className="w-full p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
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
      </form>
    </div>
  );
}
