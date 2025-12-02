import { useState, useEffect } from "react";
import { loginStartAction, verify2faAction, enterGuestMode } from "../actions/authActions.js";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { setAuthedUser, setUser, setGuest } from "../reducers/authSlice";


import AuthButton from "./auth/AuthButton.jsx";
import AuthTitle from "./auth/AuthTitle.jsx";
import AuthAlert from "./auth/AuthAlert.jsx";
import BaseInputField from "./auth/BaseInputField.jsx";
import EmailIcon from "./icons/EmailIcon.jsx";
import EyeIcon from "./icons/EyeIcon.jsx";
import RadioOption from "./auth/RadioOption.jsx";

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
  const [showPwd, setShowPwd] = useState(false);



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

      const { flowId: newFlowId } = await loginStartAction(email, pwd, channel);
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

      const { accessToken } = await verify2faAction(flowId, code, channel);

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

  const handleGuest = () => {
    localStorage.removeItem("accessToken");
    // guest mode
    dispatch(setAuthedUser(null));
    dispatch(setUser(null));
    dispatch(setGuest(true));
    // save to localStorage
    localStorage.setItem("noteapp_guestMode", "1");
    navigate("/");
  };

  return (
    <div className="Login">
      <div className="w-full min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 bg-slate-100 p-6 sm:p-2">

        <AuthTitle
          smallText="Sign In"
          bigText="Sign Into Your Account"
          autoRunActive={autoRunActive}
        />        <form
          onSubmit={!flowId ? onStart : onVerify}
          className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-10 space-y-6 text-lg md:mr-30"
        >


          <AuthAlert err={err} msg={msg} />

          {!flowId ? (
            // --- Login Start Form ---
            <>
              {/* Larger Input Fields (p-4) */}
              <BaseInputField
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                rightIcon={<EmailIcon />}
              />
              <BaseInputField
                type={showPwd ? "text" : "password"}
                placeholder="Password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                rightIcon={
                  <EyeIcon isOpen={showPwd} onClick={() => setShowPwd((v) => !v)} />
                } />

              <div className="flex gap-8 pt-3 pb-1 items-center">
                <p className="text-slate-600 font-medium whitespace-nowrap">
                  Verification Channel:
                </p>

                <RadioOption
                  label="Email"
                  name="channel"
                  value="email"
                  checked={channel === "email"}
                  onChange={() => setChannel("email")}
                />

                <RadioOption
                  label="SMS"
                  name="channel"
                  value="sms"
                  checked={channel === "sms"}
                  onChange={() => setChannel("sms")}
                />
              </div>


              <AuthButton loading={loading} label="Login" />



              <p className="text-center text-slate-600 pt-2 text-base">
                New user? <Link to="/subscribe" className="text-orange-500 hover:text-orange-700 font-semibold">Create an Account</Link>
              </p>
              <p
                className="text-center text-slate-600 pt-2 cursor-pointer text-base"
                onClick={() => enterGuestMode(dispatch, navigate)}
              >
                Enter as a guest
              </p>

            </>
          ) : (
            // --- 2FA Verification Form ---
            <>
              <p className="text-center text-slate-700">
                Please enter the 6-digit code sent to you via **{channel.toUpperCase()}**.
              </p>
              <BaseInputField
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                inputClass="text-2xl text-center tracking-widest font-mono"
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