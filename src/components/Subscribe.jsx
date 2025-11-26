import { useState, useEffect } from "react";
import { register } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";

import AuthButton from "./auth/AuthButton";
import AuthTitle from "./auth/AuthTitle";
import AuthAlert from "./auth/AuthAlert";
import BaseInputField from "./auth/BaseInputField";
import EmailIcon from "./icons/EmailIcon";
import EyeIcon from "./icons/EyeIcon";
import PhoneIcon from "./icons/PhoneIcon";

import "./Login.css";

export default function Subscribe() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoRunActive, setAutoRunActive] = useState(true);
  const [showPwd, setShowPwd] = useState(false);

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
      setMsg("Registration successful! Redirecting to login...");

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
        <AuthTitle
          smallText="Sign Up"
          bigText="Create an Account"
          autoRunActive={autoRunActive}
        />
        <form
          onSubmit={onSubscribe}
          // Larger form container (max-w-xl)
          className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-10 space-y-6 md:mr-20"
        >

          <AuthAlert err={err} msg={msg} />


          {/* Larger Input Fields (p-4) */}

          <BaseInputField
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            rightIcon={<EmailIcon />}

          />

          <BaseInputField
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            rightIcon={<PhoneIcon />}

          />

          <BaseInputField
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            rightIcon={
              <EyeIcon isOpen={showPwd} onClick={() => setShowPwd((v) => !v)} />
            } />

          <AuthButton loading={loading} label="Subscribe" />


          <p className="text-center text-slate-600 pt-2 text-base">
            Already have an account? <Link to="/auth" className="text-orange-500 hover:text-orange-700 font-semibold">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}