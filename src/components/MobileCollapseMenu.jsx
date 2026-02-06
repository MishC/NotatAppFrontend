import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { LogOut } from "lucide-react";

export default function MobileCollapseMenu({ open, items, activePath, onGo, onLogout, userName}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="mobile-collapse"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="sm:hidden border-t border-black/10 overflow-hidden"
        >
          <div className="px-4 py-3">
            <div className="rounded-3xl bg-white/70 border border-black/10 shadow-sm overflow-hidden backdrop-blur-xl">
              {items.map((it) => {
                const Icon = it.icon;
                const isActive = activePath === it.path;

                return (
                  <button
                    key={it.key}
                    onClick={() => onGo(it.path)} 
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition",
                      "hover:bg-black/5",
                      isActive && "bg-[rgb(var(--primary-soft))]"
                    )}
                  >
                    <Icon className="h-5 w-5 text-[rgb(var(--primary))]" />
                    <div className="flex-1">
                      <div className="font-medium text-black/90">{it.label}</div>
                      <div className="text-xs text-black/50">{it.path}</div>
                    </div>
                  </button>
                );
              })}
                 {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 border-t border-black/10"
                  >
                    <LogOut className="h-5 w-5 text-black/70" />
                    <div className="flex-1">
                      <div className="font-medium text-black/90">Logout</div>
                      <div className="text-xs text-black/50">
                        {userName || "Guest"}
                      </div>
                    </div>
                  </button>
                )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
