import { useState } from "react";
import { register } from "../utils/auth";
import { useNavigate } from "react-router-dom";




export default function Subscribe(){
const [email, setEmail] = useState("");
const [pwd, setPwd] = useState("");
const [phone, setPhone] = useState(null);
const [msg, setMsg] = useState("");


const navigate = useNavigate();
const onSubscribe=async ()=>{const msg=await register(email, pwd,phone); setMsg(msg); 
navigate("/auth");}

return (
    
<div className="Subscribe">
<div className="error"></div>
<div className="msg">{msg.length>2? msg: ""}</div>
<form className="max-w-md my-auto mx-auto">
<input type="text" placeholder="Email" className="border-1" value={email} onChange={e=>setEmail(e.target.value)} />
<input type="number" placeholder="Phone number"  className="border-1" value={phone} onChange={e=>setPhone(e.target.value)}  />
<input type="password" placeholder="Password"  className="border-1" value={pwd} onChange={e=>setPwd(e.target.value)} />
<button className="btn bg-orange-400 text*white p-5" onClick={onSubscribe}>Subscribe</button>
</form>

</div>

)
}