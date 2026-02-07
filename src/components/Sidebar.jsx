import React, { useMemo, useState } from "react";
import Plus from "./icons/Plus"; // uprav path
import FolderSettingsModal from "./modals/FolderSettingsModal"; // nový modal

const Sidebar = React.memo(function Sidebar({
  folderOptions,
  activeFolder,
  guest,
  handleFolderClick,
  setFolders,
  setError,
}) {
  const [openFolderId, setOpenFolderId] = useState(null);

  const folderById = useMemo(() => {
    const m = new Map();
    for (const f of folderOptions) m.set(String(f.id), f);
    return m;
  }, [folderOptions]);

  const isDeletable = (opt) => {
    if (!opt) return false;
    if (opt.id == null) return false; // All
    if (String(opt.id) === "4") return false; // done (ak nechceš mazať)
    if (String(opt.id) === "overdues") return false;
    if (opt.label === "Overdues") return false;
    return true;
  };

  return (
    <div className="Sidebar w-[80%]  mx-auto sm:mt-10 ">
      {folderOptions.map((opt) => {
        const isActive =
          (activeFolder == null && opt.id == null) ||
          String(activeFolder) === String(opt.id);

        const label = opt.label === "All" && guest ? "Notes" : opt.label;
        const deletable = isDeletable(opt);

        return (
          <div
            key={opt.id ?? "all"}
            onClick={() => handleFolderClick(opt)}
            className={
              label === "Overdues"
                ? "w-full text-red-500 text-left px-6 py-4 text-lg md:text-xl lg:text-2xl font-semibold relative cursor-pointer"
                : [
                    "w-full text-left px-6 py-4 text-lg md:text-xl lg:text-2xl font-semibold relative cursor-pointer",
                    "group", 
                  ].join(" ")
            }
          >
            <span
              className={[
                "absolute left-0 top-0.5 h-[78%] w-1",
                "transition-all duration-200 ease-out",
                isActive ? "bg-orange-500 opacity-100 " : "bg-orange-500 opacity-0 ",
              ].join(" ")}
             
              aria-hidden="true"
            />

            <span
              className={[
                "block rounded-2xl transition-colors duration-200 ease-out",
                "hover:bg-black/[0.04] active:bg-black/[0.06]",
                "pr-10", 
              ].join(" ")}
            >
              {label}
            </span>

            {deletable && (
              <span
                className={[
                  "absolute right-3 top-1/2 -translate-y-1/2",
                  "opacity-0 translate-x-2",
                  "transition-all duration-200 ease-out",
                  "group-hover:opacity-100 group-hover:translate-x-0",
                ].join(" ")}
              >
                <Plus
                  open={true}
                  size={6}
                  color="bg-orange-500 hover:bg-orange-700"
                  className="rounded-lg items-center text-base"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenFolderId(String(opt.id));
                  }}
                />
              </span>
            )}
          </div>
        );
      })}

      <FolderSettingsModal
        isOpen={openFolderId != null}
        onClose={() => setOpenFolderId(null)}
        folder={openFolderId != null ? folderById.get(String(openFolderId)) : null}
        setFolders={setFolders}
        setError={setError}
      />
    </div>
  );
});

export default Sidebar;
