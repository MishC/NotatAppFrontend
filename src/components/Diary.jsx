import NavigationBar from "./NavigationBar";
import { useSelector } from "react-redux";
import {useState} from "react";
export default function Diary() {
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
    const user = useSelector((s) => s.auth.user);
  const guest = useSelector((s) => s.auth.guest);
  return (
     <div className="w-full m-0 p-0">
          <div className="sticky top-0 z-10 bg-white/70 backdrop-blur">
            <NavigationBar
              userName={user?.name}
              isNavItemVisble={true}
              isEmailVisible={false}
            />
          </div>
    
          <div className={error || msg ? "p-5 rounded-xl" : "p-2"}>
            {error ? (
              <div className="text-red-700 p-4 bg-red-50 rounded-xl border border-red-200">{error}</div>
            ) : msg ? (
              <div className="text-emerald-700 p-4 bg-emerald-50 rounded-xl border border-emerald-200">{msg}</div>
            ) : (
              <div>&nbsp;</div>
            )}
          </div>
          {"Flash Animation book Here"}
    </div>
    
  );
}
