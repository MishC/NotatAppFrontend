import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import clsx from "clsx";


import {
  Home as HomeIcon,
  ClipboardList,
  BookOpen,
  CalendarDays,
  LogOut,
} from "lucide-react";

export default function NavigationBar({
  userName = "Guest",
  onLogout = false,
  sticky = false,
  bgColor = "bg-white",

  

}) {
  const navigate = useNavigate();
  const location = useLocation();
  const today = format(new Date(), "PPP");
 

  const items = useMemo(
    () => [
      { key: "home", label: "Home", path: "/", icon: HomeIcon },
      { key: "todo", label: "Todo", path: "/todo", icon: ClipboardList },
      { key: "diary", label: "Diary", path: "/diary", icon: BookOpen },
      { key: "calendar", label: "Calendar", path: "/calendar", icon: CalendarDays },
    ],
    []
  );

  const activeIndex = useMemo(() => {
    const p = location.pathname;
    // exact match first, then fallback to startsWith
    let idx = items.findIndex((x) => x.path === p);
    if (idx !== -1) return idx;
    idx = items.findIndex((x) => x.path !== "/" && p.startsWith(x.path));
    return idx === -1 ? 0 : idx;
  }, [items, location.pathname]);

  const active = items[activeIndex] ?? items[0];

  return (
    <div className="NavigationBar  shadow-sm">
    <header
      className={clsx(
        sticky && "sticky top-0 z-50",
        "w-full",
        "backdrop-blur-xl", bgColor
      )}
    >
      <div className="mx-auto w-full px-4 sm:px-6 py-3 flex justify-between">
        {/* Left: Brand + optional date */}

        
        <div className="flex flex-col min-w-0">
                <button
            onClick={() => navigate("/")}
            className="
              flex items-center gap-3
              rounded-2xl px-2 py-2
              hover:bg-black/5 transition
              min-w-0
            "
            title="Go Home"
          >
            <div className="h-9 w-9 rounded-2xl bg-[rgb(var(--primary))] shadow-sm shrink-0" />
            <div className="leading-tight min-w-0 hidden sm:block">
              <div className="font-semibold text-black/90 truncate">NoteApp</div>
              <div className="text-xs text-black/50 truncate">
                {active?.label ?? "Home"}
              </div>
            </div>
          </button>

        
        </div>

        {/* Center: Modern segmented nav */}
        <div
          className="
            relative
            bg-white/50
            px-1 py-1
            flex items-center
            sticky-top-0
          "
        >

          
          {/* animated active pill */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-[999px] bg-[rgb(var(--primary-soft))]"
            layout
            transition={{ type: "spring", stiffness: 520, damping: 36 }}
            style={{
              left: `calc(${activeIndex} * var(--seg-w))`,
              width: `var(--seg-w)`,
            }}
          />

          {/* buttons */}
          <div
            className="relative grid"
            style={{
              // segment width: keep consistent, looks modern
              ["--seg-w"]: "110px",
              gridTemplateColumns: `repeat(${items.length}, var(--seg-w))`,
            }}
          >
            {items.map((it, idx) => {
              const Icon = it.icon;
              const isActive = idx === activeIndex;

              return (
                <button
                  key={it.key}
                  onClick={() => navigate(it.path)}
                  className={clsx(
                    "relative z-10",
                    "h-10 rounded-[999px]",
                    "flex items-center justify-center gap-2",
                    "text-sm font-medium transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))]/40",
                    isActive ? "text-[rgb(var(--primary))]" : "text-black/70 hover:text-black/90"
                  )}
                  title={it.label}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{it.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: user + logout */}
         {onLogout && (
          
        <div className="flex items-center gap-2 mr-2">
          <div className="hidden sm:flex items-center gap-2 bg-white/50 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-[rgb(var(--success))]" />
            <span className="text-sm font-semibold text-black/80">
              {userName || "Guest"}
            </span>
          </div>

         
            <button
              onClick={onLogout}
              className="
                h-10 px-3 rounded-2xl
                bg-white/60 
                hover:bg-white transition
                flex items-center gap-2
                text-black/70 hover:text-black/90
              "
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Logout</span>
            </button>
           </div> 
          )}
        
      </div>
    </header>

        
          </div>
  );
}
