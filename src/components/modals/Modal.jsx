import React, { useState } from "react";

export default function Modal({ selectedNote, switchModal, updateNote, folders = [] }) {
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [folderId, setFolderId] = useState(selectedNote.folderId ?? "");
  const [title, setTitle] = useState(selectedNote.title ?? "");
  const [content, setContent] = useState(selectedNote.content ?? "");
  const savingDisabled =
    !title.trim() && !content.trim() && (folderId ?? "") === (selectedNote.folderId ?? "");

  const handleSave = async () => {
    const success = await updateNote(selectedNote.id, { title, content, folderId });
    if (!success) {
      setError("Failed to update note!");
      return;
    }
    // ak chceš zavrieť hneď po úspechu:
    // switchModal(null);
    setMsg("Note updated.");
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => switchModal(null)}
        aria-hidden="true"
      />

      {/* card */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        {/* close (rovnaká logika farieb ako v NoteFormModal) */}
        <button
          onClick={() => switchModal(null)}
          className="absolute top-4 right-4 px-3 py-1 rounded-md border border-slate-800 hover:bg-blue-600 hover:text-white"
          aria-label="Close"
        >
          Close
        </button>

        <h2 className="text-2xl font-bold text-center mt-8 mb-6">Edit Note</h2>

        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input
          type="text"
          className="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
        <textarea
          className="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md h-40 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Folder</label>
        <select
          value={folderId ?? ""}
          onChange={(e) => setFolderId(Number(e.target.value))}
          className="w-full mb-6 px-3 py-2 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          disabled={!folders.length}
        >
          <option value="" disabled className="text-slate-400">
            {folders.length ? "Select a folder" : "No folders available"}
          </option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => switchModal(null)}
            className="px-5 py-2 text-base rounded-md border border-slate-800 hover:bg-blue-600 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={savingDisabled}
            className={[
              "px-5 py-2 text-base rounded-md text-white shadow-sm transition",
              savingDisabled
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700",
            ].join(" ")}
          >
            Save
          </button>
        </div>

        {error && (
          <div className="text-red-700 bg-red-50 mt-6 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}
        {msg && (
          <div className="text-emerald-700 bg-emerald-50 mt-6 p-3 rounded-md border border-emerald-200">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
