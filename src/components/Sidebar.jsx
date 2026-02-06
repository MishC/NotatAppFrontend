export default function Sidebar({ folderOptions, activeFolder, guest, handleFolderClick }) {
  return (
    <div className="Sidebar w-[80%]  mx-auto sm:mt-20 ">
      {folderOptions.map((opt) => {
        const isActive =
          (activeFolder == null && opt.id == null) ||
          String(activeFolder) === String(opt.id);

        const label = opt.label === "All" && guest ? "Notes" : opt.label;

        const baseBtn =
          label === "Overdues"
            ? "w-full text-red-500 text-left px-6 py-4 text-lg md:text-xl lg:text-2xl font-semibold relative cursor-pointer"
            : "w-full text-left px-6 py-4 text-lg md:text-xl lg:text-2xl font-semibold relative cursor-pointer";

        return (
          <button
            key={opt.id ?? "all"}
            onClick={() => handleFolderClick(opt)}
            className={[
              baseBtn,

              // ✅ 2025 hover / focus (subtle, clean)
              "rounded-2xl transition",
              "hover:bg-black/[0.04] active:bg-black/[0.06]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10",

              // ✅ spacing for the left indicator line (still same px-6, just visual)
              "group",
            ].join(" ")}
          >
            {/* ✅ text wrapper so the left line matches text height */}
            <span
              className={[
                "relative inline-flex items-center",

                "leading-none",
              ].join(" ")}
            >
              {/* Left indicator line — relative to the text */}
              <span
                className={[
                  "absolute -left-4 top-1/2 -translate-y-1/2",
                  "w-1 rounded-full",
                  "h-[1.25em]",

                  isActive ? "bg-[rgb(var(--orange))]" : "bg-transparent",

                  // a tiny glow-ish feel on active
                  isActive ? "shadow-[0_0_0_2px_rgba(0,0,0,0.03)]" : "",
                ].join(" ")}
                aria-hidden="true"
              />

              {/* Label */}
              <span
                className={[
                  // subtle hover “lift” effect on text only
                  "transition",
                  "group-hover:translate-x-[2px]",
                  "group-hover:text-black/90",
                  isActive ? "text-black/95" : "text-black/75",

                  // keep Overdues red but nicer
                  label === "Overdues" ? "text-red-600 group-hover:text-red-700" : "",
                ].join(" ")}
              >
                {label}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
