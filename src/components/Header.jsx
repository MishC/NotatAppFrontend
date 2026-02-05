import { format } from "date-fns";
import clsx from "clsx";
import "./styles/Header.css";

export default function Header({
  userName = "Guest",
  onLogout,
  maxWidth = "full",        // "full" | "container" | "custom"
  bgColor = "lightGreen",   // "lightGreen" | "orange" | "custom"
  customBgClass = "",
  sticky = true,
  showDate = true
}) {
  const today = format(new Date(), "PPP");

  const widthClass =
    maxWidth === "container"
      ? "max-w-6xl mx-auto"
      : maxWidth === "custom"
      ? "mx-auto"
      : "w-full";

  const bgClass =
    bgColor === "orange"
      ? "bg-orange-200/90"
      : bgColor === "custom"
      ? customBgClass
      : "bg-green-100/90";

  return (
    <header
      className={clsx(
        "Header",
        sticky && "sticky top-0 z-40",
        "backdrop-blur-lg",
        bgClass
      )}
    >
      <div
        className={clsx(
          "flex items-center justify-between",
          "px-4 sm:px-6 py-3",
          widthClass
        )}
      >
        {/* LEFT – Date (hidden on mobile via CSS) */}
        <div className="header-date hidden sm:block">
          {today}
        </div>

        {/* RIGHT – User + actions */}
        <div className="flex items-center gap-3">
          <span className="header-user">
            {userName || "Guest"}
          </span>

          {onLogout && (
            <button
              onClick={onLogout}
              className="header-logout"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
