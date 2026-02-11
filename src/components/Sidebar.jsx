import React,{ useEffect, useMemo, useState } from "react";
import Plus from "./icons/Plus"; // uprav path
import FolderSettingsModal from "./modals/FolderSettingsModal"; // nový modal
function Sidebar({
  folders,
  setFolders,
  activeFolder,
  guest = false,
  handleFolderClick,
  setError,
}) {
  const [openFolderId, setOpenFolderId] = useState(null); //toggle FolderSettingsModal


  const sortedFolders = useMemo(() => {
  return [...folders].sort((a, b) => {
    const aDefault = +a.id <= 5; //1-5 is default from backend, >6 custom
    const bDefault = +b.id <= 5;

    if (aDefault !== bDefault) return aDefault ? -1 : 1;
    if (aDefault) return +b.id - +a.id;

    return 0;
  });
}, [folders]);


  return (
    <div className="Sidebar w-[90%]  mx-auto sm:mt-10 ">
      <div key="all"
        onClick={() => handleFolderClick("all")}
        className={

          "w-full text-left px-6 py-4 text-lg md:text-xl lg:text-2xl font-semibold relative cursor-pointer"

        }
      >

        <span
          className={[
            "absolute left-0 top-0.5 h-[78%] w-1",
            "transition-all duration-200 ease-out",
            activeFolder===null ? "bg-orange-500 opacity-100 " : "bg-orange-500 opacity-0 ",
          ].join(" ")}

          aria-hidden="true"
        />

        <span
          className={[
            "block rounded-2xl transition-colors duration-200 ease-out",
            "hover:bg-black/[0.04] active:bg-black/[0.06]",
            "pr-10",
          ].join(" ")}
        > All
        </span>

      </div>
{!guest &&
  sortedFolders.map((opt) => {
      const isActive = String(activeFolder) === String(opt.id);

      return (
        
        <div
          key={opt.id}
          onClick={() => handleFolderClick(opt)}
          className={
            opt.id === 1
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
              isActive ? "bg-orange-500 opacity-100" : "bg-orange-500 opacity-0",
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
            {opt.name}
          </span>

          {opt.id>5&& (
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
        folder={activeFolder}
        setFolders={setFolders}
        setError={setError}
      />
    </div>

  );
};

export default React.memo(Sidebar);
