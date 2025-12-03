import { format } from "date-fns";

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
      <div className="text-lg font-medium text-black/90">
        Today is {today}
      </div>

      {/* Right side - Guest + Clear Storage */}
      <div className="flex items-center gap-4">
        <span className="text-lg font-semibold text-brown/95">
          {userName === "" ? "Guest" : userName}
        </span>

        <button
          onClick={onLogout}
          className={[
            "text-base",
            "px-3 py-1",
            "rounded-lg",
            "border-dotted border-brown/90",
            "hover:bg-brown/10 transition",
            "text-black/80",
            "cursor-pointer",

           "hover:bg-white/50 hover:backdrop-blur-sm",
                    "backdrop-blur-[1px]",


          ].join(" ")}
        >
          Clear data
        </button>
      </div>
    </header>
  );
}
