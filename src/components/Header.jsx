import { format } from "date-fns";
import "./Header.css";

export default function Header({ userName = "Guest", onLogout }) {
  const today = format(new Date(), "PPP");

  return (
    <header
      className={[
        "w-full",
        "flex items-center justify-between",
        "py-4 px-6",
        "backdrop-blur-sm"
      ].join(" ")}
    >
      {/* Left side - Date */}
      <div className="text-base font-medium text-slate-700/90 bg-white/10 p-3 rounded-md font-dancing dancing-script-header
">
        {today}
      </div>

      {/* Right side - Guest + Clear Storage */}
      <div className="flex items-center gap-4">
        <span className="text-lg font-semibold text-brown/95 bg-white/80 px-3 py-2 rounded-md">
          {userName === "" ? "Guest" : userName}
        </span>

        <button
          onClick={onLogout}
          className={[
            "text-base",
            "px-3 py-1",
            "rounded-lg",
            "border-dotted border-brown/90",
            "text-black/80",
            "cursor-pointer",
            "transition",

            "backdrop-blur-[1px]",

            "hover:bg-white/50 hover:backdrop-blur-sm",
          ].join(" ")}
        >
           {userName === "Guest" ? "Clear Data" : "Logout"}
        </button>

      </div>
    </header>
  );
}
