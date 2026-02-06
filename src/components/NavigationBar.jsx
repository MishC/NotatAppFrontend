import  { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import clsx from "clsx";
import MobileCollapseMenu from "./MobileCollapseMenu";
import { useLogout } from "../helpers/authhelpers";



import {
  Home as HomeIcon,
  ClipboardList,
  BookOpen,
  CalendarDays,
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function NavigationBar({
  userName = "Guest",
  sticky = false,
  bgColor = "bg-white/70",
  isEmailVisible = false,
  isNavItemVisble=true,
}) {


 const onLogout = useLogout();

  
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [open, setOpen] = useState(false);
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



  // functions

  const active = items[activeIndex] ?? items[0];

  const go = (path) => {
    navigate(path);
    setOpen(false);
  };

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);



  return (
    <div className={`NavigationBar`}>
      <header
        className={clsx(
          sticky && "sticky top-0 z-50",
          "w-full",
          "backdrop-blur-xl", bgColor, "border-b border-[rgb(var(--border-soft))]"
        )}
      >
<motion.div
  layout
  className={clsx(
    "mx-auto px-4 py-3 flex items-center justify-between",
    isHome ? "max-w-6xl" : "w-full"
  )}
>
          {/* Left: Brand + optional date */}


          <div className={clsx("flex", isHome?"items-center gap-3" :"gap-8 min-w-0")}>
            <button
              onClick={() => go("/")}
              className="
              flex items-center gap-3
              rounded-2xl px-2 py-2
              hover:bg-black/5 transition
              min-w-0 cursor-pointer
            "
              title="Go Home"
            >
              <div className="h-9 w-10 rounded-lg bg-[rgb(var(--primary))] shrink-0 flex items-center justify-center">
  <img src="/vite.svg" alt="Logo" className="h-9 w-9 rounded-2xl" />
</div>

              <div className="leading-tight min-w-0 hidden sm:block">
                <div className="font-semibold text-black/90 truncate">NoteApp</div>
                <div className="text-xs text-black/50 truncate">
                  {active?.label==="Home"?"Todo • Calendar • Diary":`${active?.label}`}
                </div>
              </div>
            </button>

            {/* Center: Modern segmented nav */}

            {isNavItemVisble && (
            <div className="hidden sm:flex items-center">

              <div
                className="
            relative
            bg-white/50
            px-1 py-1
            flex items-center justify-left
            sticky top-0
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
                          "text-sm font-medium transition", "cursor-pointer", "hover:bg-black/7",
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
            </div>)}
          </div>

          {/* Right: Mobile Menu collapse+ user + logout */}          
        <div className="flex items-center gap-2">
          {/* Mobile Collapse Menu - only visible for mobiles */}
         {isNavItemVisble && <button
            onClick={() => setOpen((v) => !v)}   
            className="
              sm:hidden 
              h-10 w-10 rounded-2xl
              bg-white/60 border border-black/10
              hover:bg-white transition
              grid place-items-center
            "
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>}
              

          <div className="flex items-center gap-2 mr-2">
           {isEmailVisible && (<div className="hidden sm:flex items-center gap-2 bg-white/50 px-3 py-2">
         
          <div className="h-2 w-2 rounded-full bg-[rgb(var(--success))]" />
          <span className="text-sm font-semibold text-black/80">
                    {userName || "Guest"}
                  </span>
          </div>)}
          {onLogout&& (
            
            <button
              onClick={onLogout}
              className={clsx(
                isHome ? "flex" : "hidden sm:flex",
                "h-10 px-3 rounded-2xl",
                "bg-white/60 border border-black/10",
                "hover:bg-white transition",
                "items-center gap-2",
                "text-black/70 hover:text-black/90"
              )}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline text-sm font-medium">Logout</span>
            </button>
          )}
        </div>
      </div>
      </motion.div>

      {/* Mobile collapse panel (no z-index drama) */}
      <MobileCollapseMenu
        open={open}
        items={items}
        activePath={location.pathname}
        onGo={go}
        onLogout={onLogout}
  userName={userName}
      />
    </header>
   
    </div>
  );
}
