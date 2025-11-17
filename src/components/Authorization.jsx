// src/auth/Login.tsx
import { useState } from "react";
import { loginStart, verify2fa } from "../utils/auth.js";
import { Link } from 'react-router-dom';



export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [channel, setChannel] = useState("email");
  const [flowId, setFlowId] = useState(null);
  const [code, setCode] = useState("");

  const onStart = async () => {
    const { flowId } = await loginStart(email, pwd, channel);
    setFlowId(flowId);
  };

  const onVerify = async () => {
    const { accessToken } = await verify2fa(flowId, code, channel);
    localStorage.setItem("accessToken", accessToken);
    // now you can call your Note API with Authorization: Bearer ...
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow my-auto border-2">
      {!flowId ? (
        <>
          <input className="input border-1" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input border-1" type="password" placeholder="Password" value={pwd} onChange={e=>setPwd(e.target.value)} />
          <div className="mt-2 flex gap-4">
            <label><input type="radio" checked={channel==="email"} onChange={()=>setChannel("email")} /> Email code</label>
            <label><input type="radio" checked={channel==="sms"} onChange={()=>setChannel("sms")} /> SMS code</label>
          </div>
          <button className="btn mt-4 bg-blue-400 text-white mt-10 mb-6 mx-auto" onClick={onStart}>Login</button>

                    <p>New user? <Link  to="/subscribe">Subscribe</Link></p>

        </>
      ) : (
        <>
          <p>We sent you a code via {channel}.</p>
          <input className="input" placeholder="Enter code" value={code} onChange={e=>setCode(e.target.value)} />
          <button className="btn mt-4" onClick={onVerify}>Verify</button>
        </>
      )}
    </div>
  );
}
