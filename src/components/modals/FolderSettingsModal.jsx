import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import EditNoteModal from "./EditNoteModal" 
import { deleteFolderAction, updateFolderAction } from "../../actions/noteActions"; 

export default function FolderSettingsModal({ isOpen, onClose, folder, setFolders, setError }) {
  const API_URL = useMemo(() => import.meta.env.VITE_API_URL + "/api/folders", []);
  const [name, setName] = useState("");

  useEffect(() => {
    setName(folder?.name ?? folder?.title ?? "");
  }, [folder]);

  if (!isOpen) return null;

  const folderId = folder?.id;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose()} aria-hidden="true" />
      {/* card */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-8 md:p-10 shadow-xl">
        <button
          onClick={() => onClose()}
          className="absolute top-4 right-4 px-3 py-1 rounded-md border border-slate-800 hover:bg-blue-600 hover:text-white"
          aria-label="Close"
        >
          Close
        </button>

      <main>
        <div className="flex flex-col gap-3">
          <div className="text-sm text-black/60">Folder title</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-300"
            placeholder="Folder name"
            autoFocus
          />
        </div>
      </main>

      <footer>
        <div className="w-full flex items-center justify-between gap-3">
          {/* BIG red delete left */}
          <button
            type="button"
            className="px-6 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition w-[45%]"
            onClick={async () => {
              if (!folderId) return;
              const ok = await deleteFolderAction({ API_URL, folderId, setFolders, setError });
              if (ok) onClose();
            }}
          >
            Delete
          </button>

          {/* Orange save right */}
          <button
            type="button"
            className="px-6 py-4 rounded-xl bg-orange-500 hover:bg-orange-700 text-white font-bold transition w-[45%]"
            onClick={async () => {
              if (!folderId) return;
              const trimmed = name.trim();
              if (!trimmed) {
                setError?.("Folder name cannot be empty.");
                return;
              }

              const ok = await updateFolderAction({
                API_URL,
                folderId,
                folderName: trimmed,
                setFolders,
                setError,
              });

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
