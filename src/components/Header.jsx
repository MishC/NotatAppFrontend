import { format } from "date-fns";
import "./Header.css";

export default function Header({ userName = "Guest", onLogout }) {
  const today = format(new Date(), "PPP");
  const isMobile = window.innerWidth < 640;

  return (
    <header
      className={[
        "Header",
        "w-full",
        "flex items-center justify-between",
        "py-4 px-6",
        "mx-0 mb-20",
        "backdrop-blur-lg",
        "bg-green-100",
        "opacity-90",
        "max-w-100vw",
        "flex-auto",
      "justify-between",
      ].join(" ")}
    >
      {/* Left side - Date */}
      {!isMobile && (
        <div className="text-base font-medium text-slate-700/90 bg-white/10 p-3 rounded-md font-dancing dancing-script-header">
          {today}
        </div>
      )}

      {/* Right side - Guest + Clear Storage */}
      <div className="flex justify-between md:d-block w-full md:w-auto items-center">
        <span className="ml-2 text-lg font-semibold text-brown/95 bg-green/80 px-3 py-2 rounded-md text-sm sm:text-base">
          {userName === "" ? "Guest" : userName}
        </span>

        <button
          onClick={onLogout}
          className={[
            "text-lg",
            "font-medium",
            "px-3 py-1",
            "rounded-lg",
            "border-dotted border-brown/90",
            "text-black/80",
            "cursor-pointer",
            "transition",
            "backdrop-blur-[1px]",
            "hover:bg-white/50 hover:backdrop-blur-sm",
            "active:bg-white/30 active:backdrop-blur-none",
            "mr-2",
          ].join(" ")}
        >
           Logout
        </button>

      </div>
    </header>
  );
}
