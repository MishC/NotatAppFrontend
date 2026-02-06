import React, { useMemo } from "react";

const Sidebar = React.memo(function Sidebar({ folderOptions, activeFolder, guest, handleFolderClick }) {
  return (
    <div className="Sidebar w-[80%]  mx-auto sm:mt-20 ">
      {folderOptions.map((opt) => {
        const isActive =
          (activeFolder == null && opt.id == null) ||
          String(activeFolder) === String(opt.id);

        const label = opt.label === "All" && guest ? "Notes" : opt.label;

        return (
          <button
            key={opt.id ?? "all"}
            onClick={() => handleFolderClick(opt)}
            className={
              label === "Overdues"
                ? "w-full text-red-500 text-left px-6 py-4 text-lg md:text-xl lg:text-2xl font-semibold relative cursor-pointer"
                : ["w-full text-left px-6 py-4 text-lg md:text-xl lg:text-2xl font-semibold relative cursor-pointer",
                   "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10"]
            }
          >
            <span
              className={[
                "absolute left-0 top-0.5 h-[70%] w-1",

                "rounded-full transition-all duration-200 ease-out",
                "will-change-transform",

                isActive ? "bg-orange-500 opacity-100 scale-y-100" : "bg-orange-500 opacity-0 scale-y-90",
              ].join(" ")}
              aria-hidden="true"
            />
            <span
              className={[
                // ✅ modern hover without moving layout
                "block rounded-2xl transition-colors duration-200 ease-out",
                "hover:bg-black/[0.04] active:bg-black/[0.06]",
              ].join(" ")}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
});

export default Sidebar;
