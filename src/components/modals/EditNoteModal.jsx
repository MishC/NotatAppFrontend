import React, { useState, useEffect } from "react";
import { todayYYYYMMDD } from "../../helpers/dateHelpers";

export default function Modal({ selectedNote, switchModal, updateNote, folders = [] }) {
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const [folderId, setFolderId] = useState(selectedNote.folderId ?? "");
  const [title, setTitle] = useState(selectedNote.title ?? "");
  const [content, setContent] = useState(selectedNote.content ?? "");
  const [scheduledAt, setScheduledAt] = useState(selectedNote.scheduledAt ?? "");

  const savingDisabled =
    title === (selectedNote.title ?? "") &&
    content === (selectedNote.content ?? "") &&
    (folderId ?? "") === (selectedNote.folderId ?? "") &&
    (scheduledAt ?? "") === (selectedNote.scheduledAt ?? "");

    const minDate = todayYYYYMMDD();


  const handleSave = async () => {
    const success = await updateNote(selectedNote.id, {
      title,
      content,
      folderId,
      scheduledAt: scheduledAt?.trim() ? scheduledAt.trim() : null,
    });
    if (scheduledAt && scheduledAt < minDate) {
  setError("Deadline cannot be in the past.");
  return;
}

    if (!success) {
      setError("Failed to update note!");
      return;
    }
    setMsg("Note updated.");
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && switchModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [switchModal]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={() => switchModal(null)} aria-hidden="true" />
      {/* card */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-8 md:p-10 shadow-xl">
        <button
          onClick={() => switchModal(null)}
          className="absolute top-4 right-4 px-3 py-1 rounded-md border border-slate-800 hover:bg-blue-600 hover:text-white"
          aria-label="Close"
        >
          Close
        </button>

        <h2 className="text-3xl font-bold text-center mt-2 mb-8">Edit Note</h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full mb-5 px-4 py-3 text-xl rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          className="w-full mb-5 px-4 py-3 text-xl rounded-lg border border-slate-300 h-56 text-slate-800 placeholder-slate-400
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />

        <select
          value={folderId ?? ""}
          onChange={(e) => setFolderId(Number(e.target.value))}
          className="w-full mb-6 px-4 py-3 text-lg rounded-lg border border-slate-300 text-slate-800
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

        {/* DateOnly (Deadline) */}
        <div className="w-full mb-8">
          <div className="flex items-center gap-3">
            <span className="mt-1 text-red-400">Deadline</span>
            <input
              type="date"
              value={scheduledAt} // "YYYY-MM-DD"
              onChange={(e) => setScheduledAt(e.target.value)}
              placeholder="YEAR-MM-DD"
              min={minDate}
              className="w-full px-4 py-3 text-lg rounded-lg border border-slate-300 text-slate-800
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

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

        {error && <div className="text-red-700 bg-red-50 mt-6 p-3 rounded-md border border-red-200">{error}</div>}
        {msg && <div className="text-emerald-700 bg-emerald-50 mt-6 p-3 rounded-md border border-emerald-200">{msg}</div>}
      </div>
    </div>
  );
}
