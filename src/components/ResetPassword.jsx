import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordAction, resetPasswordAction } from "../actions/authActions";

import AuthButton from "./auth/AuthButton";
import AuthTitle from "./auth/AuthTitle";
import AuthAlert from "./auth/AuthAlert";
import BaseInputField from "./auth/BaseInputField";
import EmailIcon from "./icons/EmailIcon";
import EyeIcon from "./icons/EyeIcon";

import "./Login.css";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loadingForgot, setLoadingForgot] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [autoRunActive, setAutoRunActive] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const cleanupTimer = setTimeout(() => {
      setAutoRunActive(false);
    }, 2000);
    return () => {
      clearTimeout(cleanupTimer);
    };
  }, []);

  const onForgotPassword = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoadingForgot(true);

    try {
      if (!email) {
        setErr("Email is required.");
        return;
      }

      const result = await forgotPasswordAction({ email, setMsg, setErr });
      if (result.success) {
        setResetEmail(email);
        setShowResetForm(true);
      }
    } catch (error) {
      console.error(error);
      setErr(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoadingForgot(false);
    }
  };

  const onResetPassword = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoadingReset(true);

    try {
      if (!resetEmail || !token || !newPassword) {
        setErr("Email, token, and new password are required.");
        return;
      }

      const result = await resetPasswordAction({
        email: resetEmail,
        token,
        newPassword,
        setMsg,
        setErr,
      });

      if (result.success) {
        setMsg("Password reset successful. Redirecting to login...");
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      setErr(error.message || "Failed to reset password. Please try again.");
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="ResetPassword min-h-screen bg-emerald-50">
      <div className="w-full min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 p-6 sm:p-2">
        <AuthTitle
          smallText="Reset Password"
          bigText="Reset Your Password"
          autoRunActive={autoRunActive}
        />

        <div className="w-full max-w-xl space-y-6 md:mr-20">
          <form
            onSubmit={onForgotPassword}
            className="w-full bg-white shadow-xl rounded-2xl p-10 space-y-6"
          >
            <AuthAlert err={!showResetForm ? err : ""} msg={!showResetForm ? msg : ""} />

            <BaseInputField
              id="forgot-email"
              type="email"
              placeholder="Email Address"
              inputClass="text-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              rightIcon={<EmailIcon />}
            />

            <AuthButton loading={loadingForgot} label="Send" loadingLabel="Sending..." />

            <p className="text-center text-slate-600 pt-2 text-base">
              Remembered password?{" "}
              <Link to="/auth" className="text-orange-500 hover:text-orange-700 font-semibold">
                Sign In
              </Link>
            </p>
          </form>

          {showResetForm && (
            <form
              onSubmit={onResetPassword}
              className="w-full bg-white shadow-xl rounded-2xl p-10 space-y-6"
            >
              <AuthAlert err={err} msg={msg} />

              <BaseInputField
                id="reset-email"
                type="email"
                placeholder="Email Address"
                inputClass="text-lg"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                rightIcon={<EmailIcon />}
              />

              <BaseInputField
                id="reset-token"
                type="text"
                placeholder="Reset Token"
                inputClass="text-lg tracking-widest font-mono"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />

              <BaseInputField
                id="new-password"
                type={showPwd ? "text" : "password"}
                placeholder="New Password"
                inputClass="text-lg tracking-widest font-mono"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                rightIcon={<EyeIcon isOpen={showPwd} onClick={() => setShowPwd((v) => !v)} />}
              />

              <AuthButton loading={loadingReset} label="Send" loadingLabel="Resetting..." />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
