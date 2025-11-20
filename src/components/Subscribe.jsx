import { useState, useEffect} from "react";
import { register } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";


export default function Subscribe() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoRunActive, setAutoRunActive] = useState(true);


  const navigate = useNavigate();
  
  useEffect(() => {
   const cleanupTimer = setTimeout(() => {
        setAutoRunActive(false);
    }, 1000); 
    return () => {
        clearTimeout(cleanupTimer);
    };
    }, []);

  const onSubscribe = async (e) => {
    e.preventDefault();
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

      setTimeout(() => {
        navigate("/auth");
      }, 1500);
    } catch (error) {
      setErr(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Subscribe">
        <div className="w-full min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 bg-slate-100 p-6 sm:p-2">
         <h1 className={`w-full md:w-auto text-[14px] font-bold text-slate-800 text-center sm:p-2 md:text-left  md:mr-30 md:ml-30 xs:mb-5 xs:p-20 p-10  
          animated-color-hover ${autoRunActive ? 'auto-run' : '' }`}>
          <span className="block lg:hidden">Sign Up</span>
           <span className="hidden lg:inline-block">Create an Account</span>
          </h1>
        <form
          onSubmit={onSubscribe}
          // Larger form container (max-w-xl)
          className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-10 space-y-6 md:mr-20"
        >
       
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

          {/* Larger Input Fields (p-4) */}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-4   rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full p-4  rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-4  rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xl font-semibold p-4 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-6"
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