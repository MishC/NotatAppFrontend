import React,{ useEffect, useMemo, useState } from "react";
import Plus from "./icons/Plus"; // uprav path
import FolderSettingsModal from "./modals/FolderSettingsModal"; // nový modal
import { fetchAllFoldersAction } from "../actions/noteActions";
function Sidebar({
  activeFolder,
  guest,
  handleFolderClick,
  setFolders,
  setError,
}) {
  const [openFolderId, setOpenFolderId] = useState(null); //toggle FolderSettingsModal: let you make optional folder in modal window
  const API_URL = import.meta.env.VITE_API_FOLDERS;
  useEffect(() => {
    try {
      const folders = fetchAllFoldersAction({ API_URL, setFolders, setError });
      setFolders(folders);
    } catch (error) {
      setError(error.message);
    }
  }, [API_URL]);


  const isDeletable = (opt) => {
    if (!opt) return false;
    if (opt.id == null) return false; // All
    if (String(opt.id) <= "5") return false;
  };


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
      {folders.map((opt) => {
        const deletable = isDeletable(opt.id);
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
              {opt.name}
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
        folder={activeFolder}
        setFolders={setFolders}
        setError={setError}
      />
    </div>

  );
};

export default React.memo(Sidebar);
