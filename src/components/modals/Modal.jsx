import React, { useState, useEffect } from "react";

export default function Modal({ selectedNote, switchModal, updateNote, folders = [] }) {
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const [folderId, setFolderId] = useState(selectedNote.folderId ?? "");
  const [title, setTitle] = useState(selectedNote.title ?? "");
  const [content, setContent] = useState(selectedNote.content ?? "");

  const savingDisabled =
    (!title.trim() && !content.trim() && (folderId ?? "") === (selectedNote.folderId ?? "")) ||
    (title === selectedNote.title && content === selectedNote.content && folderId === selectedNote.folderId);

  const handleSave = async () => {
    const success = await updateNote(selectedNote.id, { title, content, folderId });
    if (!success) {
      setError("Failed to update note!");
      return;
    }
    setMsg("Note updated.");
  };

  // ESC na zavretie
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && switchModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [switchModal]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      {/* overlay (zatvára modal) */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => switchModal(null)}
        aria-hidden="true"
      />

      {/* karta */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-8 md:p-10 shadow-xl">
        <h2 className="text-3xl font-bold text-center mt-2 mb-8">Edit Note</h2>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full mb-5 px-4 py-3 text-xl rounded-lg border border-slate-300
                     text-slate-800 placeholder-slate-400
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          className="w-full mb-5 px-4 py-3 text-xl rounded-lg border border-slate-300 h-56
                     text-slate-800 placeholder-slate-400
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />

        {/* Folder select (bez labelu) */}
        <select
          value={folderId ?? ""}
          onChange={(e) => setFolderId(Number(e.target.value))}
          className="w-full mb-8 px-4 py-3 text-lg rounded-lg border border-slate-300 text-slate-800
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
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
            className="px-6 py-3 text-lg rounded-md border border-slate-800 hover:bg-blue-600 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={savingDisabled}
            className={[
              "px-6 py-3 text-lg rounded-md text-white shadow-sm transition",
              savingDisabled ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700",
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
