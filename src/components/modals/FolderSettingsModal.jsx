import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { deleteFolderAction, updateFolderAction } from "../../actions/noteActions";

export default function FolderSettingsModal({ isOpen, onClose, folder, setFolders, setError }) {
  const API_URL = import.meta.env.VITE_API_FOLDERS;
  const [name, setName] = useState("");
  const folderId = folder?.id;



  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onMouseDown={onClose} aria-hidden="true" />

      {/* card */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 md:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}>
        {/* Header */}
        <header>
          <div className="w-full flex items-center justify-between">
            <span className="text-lg font-semibold text-black/90">
              Edit Folder Name
            </span>

            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-2xl bg-white/60 hover:bg-white transition grid place-items-center cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="mt-5">
          <div className="flex flex-col gap-3">
            <div className="text-sm text-black/60">Current Name: {folder?.name}</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-300"
              placeholder="New folder name"
              autoFocus
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-6">
          <div className="w-full flex items-center justify-between gap-3">
            <button
              type="button"
              className="px-6 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition w-[45%]"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!folderId) return;
                const ok = await deleteFolderAction({ API_URL, folderId, setFolders, setError });
                console.log("DELETE ok =", ok);

                if (ok) onClose();

              }}
            >
              Delete
            </button>

            <button
              type="button"
              className="px-6 py-4 rounded-xl bg-orange-500 hover:bg-orange-700 text-white font-bold transition w-[45%]"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!folderId) return;
                const trimmed = name.trim();
                if (!trimmed) {
                  setError?.("Folder name cannot be empty.");
                  return;
                }

                const ok = await updateFolderAction({ API_URL, folderId, folderName: trimmed, setFolders, setError });
                if (ok) onClose();

              }}
            >
              Save
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
