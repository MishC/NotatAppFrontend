import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordAction } from "../actions/authActions";

import AuthAlert from "./auth/AuthAlert";
import AuthButton from "./auth/AuthButton";
import BaseInputField from "./auth/BaseInputField";
import EyeIcon from "./icons/EyeIcon";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onResetPassword = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      if (!email || !token) {
        setErr("Invalid or missing password reset link.");
        return;
      }

      if (!newPassword) {
        setErr("New password is required.");
        return;
      }

      const result = await resetPasswordAction({
        email,
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
      setLoading(false);
    }
  };

  return (
    <div className="ResetPassword min-h-screen bg-emerald-50">
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-xl flex flex-col items-center gap-8">
          <h1 className="w-full text-center text-[32px] font-bold text-slate-800">
            Reset Your Password
          </h1>

          <form
            onSubmit={onResetPassword}
            className="w-full bg-white shadow-xl rounded-2xl p-7 sm:p-10 space-y-6 mx-auto"
          >
            <AuthAlert err={err} msg={msg} />

            <BaseInputField
              id="new-password"
              type={showPwd ? "text" : "password"}
              placeholder="New Password"
              inputClass="text-lg tracking-widest font-mono"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              rightIcon={<EyeIcon isOpen={showPwd} onClick={() => setShowPwd((v) => !v)} />}
            />

            <AuthButton loading={loading} label="Send" loadingLabel="Resetting..." />

            <p className="text-center text-slate-600 pt-2 text-base">
              Need a new reset link?{" "}
              <Link
                to="/forgotten-password"
                className="text-orange-500 hover:text-orange-700 font-semibold"
              >
                Send Reset Link
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
