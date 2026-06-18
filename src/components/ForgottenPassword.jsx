import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordAction } from "../actions/authActions";

import AuthAlert from "./auth/AuthAlert";
import BaseInputField from "./auth/BaseInputField";
import EmailIcon from "./icons/EmailIcon";

export default function ForgottenPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      if (!email) {
        setErr("Email is required.");
        return;
      }

      await forgotPasswordAction({ email, setMsg, setErr });
    } catch (error) {
      console.error(error);
      setErr(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ForgottenPassword min-h-screen bg-emerald-50">
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-xl flex flex-col items-center gap-8">
          <h1 className="w-full text-center text-[32px] font-bold text-slate-800">
            Forgotten Password
          </h1>

          <div className="w-full bg-white shadow-xl rounded-2xl p-7 sm:p-10 space-y-6 mx-auto">
            <AuthAlert err={err} msg={msg} />

            <BaseInputField
              id="forgot-email"
              type="email"
              placeholder="Email Address"
              inputClass="text-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              rightIcon={<EmailIcon />}
            />

            <button
              type="button"
              onClick={onSend}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xl font-semibold p-4 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Sending..." : "Send"}
            </button>

            <p className="text-center text-slate-600 pt-2 text-base">
              Remembered password?{" "}
              <Link to="/auth" className="text-orange-500 hover:text-orange-700 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
