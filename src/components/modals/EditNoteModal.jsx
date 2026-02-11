import React, { useEffect, useMemo, useState } from "react";
import { todayYYYYMMDD } from "../../helpers/dateHelpers";

export default function EditModal({
  selectedNote,
  folders = [],
  switchModal,
  updateNote,
}) {
  const minDate = todayYYYYMMDD();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folderId, setFolderId] = useState("");     // string for select
  const [scheduledAt, setScheduledAt] = useState(""); // YYYY-MM-DD

  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const close = () => switchModal(null);

  // ✅ IMPORTANT: init only when note ID changes (modal opened for another note)
  useEffect(() => {
    if (!selectedNote) return;

    setTitle(selectedNote.title ?? "");
    setContent(selectedNote.content ?? "");
    setFolderId(selectedNote.folderId != null ? String(selectedNote.folderId) : "");
    setScheduledAt(selectedNote.scheduledAt ?? "");

    setError(null);
    setMsg(null);
    setSaving(false);
  }, [selectedNote?.id]); // <--- THIS is the fix

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const original = useMemo(() => {
    return {
      title: selectedNote?.title ?? "",
      content: selectedNote?.content ?? "",
      folderId: selectedNote?.folderId != null ? String(selectedNote.folderId) : "",
      scheduledAt: selectedNote?.scheduledAt ?? "",
    };
  }, [selectedNote?.id]); // tie original hodnoty tiež naviaž na id

  const savingDisabled =
    !selectedNote ||
    (title === original.title &&
      content === original.content &&
      folderId === original.folderId &&
      scheduledAt === original.scheduledAt);

  const handleSave = async () => {
    if (!selectedNote || saving || savingDisabled) return;

    // validate deadline
    if (scheduledAt && scheduledAt < minDate) {
      setError("Deadline cannot be in the past.");
      return;
    }

    setSaving(true);
    setError(null);
    setMsg(null);

    const patch = {
      title: title.trim(),
      content: content ?? "",
      folderId: folderId === "" ? null : Number(folderId), // ✅ send as number
      scheduledAt: scheduledAt?.trim() ? scheduledAt.trim() : null,
    };

    try {
      const ok = await updateNote(selectedNote.id, patch);
      if (!ok) {
        setError("Failed to update note.");
        return;
      }
      setMsg("Note updated.");
    } finally {
      setSaving(false);
    }
  };

  if (!selectedNote) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={close} aria-hidden="true" />

      {/* card */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-8 md:p-10 shadow-xl">
        <button
          onClick={close}
          className="absolute top-4 right-4 px-3 py-1 rounded-md border border-slate-800 hover:bg-blue-600 hover:text-white"
          aria-label="Close"
          type="button"
        >
          Close
        </button>

        <h2 className="text-3xl font-bold text-center mt-2 mb-8">Edit Note</h2>

        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setMsg(null); }}
          placeholder="Title"
          className="w-full mb-5 px-4 py-3 text-xl rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />

        <textarea
          value={content}
          onChange={(e) => { setContent(e.target.value); setMsg(null); }}
          placeholder="Content"
          className="w-full mb-5 px-4 py-3 text-xl rounded-lg border border-slate-300 h-56 text-slate-800 placeholder-slate-400
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />

        {/* ✅ select is controlled by folderId state */}
        <select
          value={folderId}
          onChange={(e) => { setFolderId(e.target.value); setMsg(null); }}
          className="w-full p-4 my-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-300"
        >
          <option value="" disabled>
            Select a folder
          </option>
          {folders.map((f) => (
            <option key={f.id} value={String(f.id)}>
              {f.name}
            </option>
          ))}
        </select>

        {/* Deadline */}
        <div className="w-full mb-8">
          <div className="flex items-center gap-3">
            <span className="mt-1 text-red-400">Deadline</span>
            <input
              type="date"
              value={scheduledAt}
              onChange={(e) => { setScheduledAt(e.target.value); setMsg(null); }}
              min={minDate}
              className="w-full px-4 py-3 text-lg rounded-lg border border-slate-300 text-slate-800
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={close}
            className="px-6 py-3 text-lg rounded-md border border-slate-800 hover:bg-blue-600 hover:text-white"
            type="button"
          >
            Close
          </button>

          <button
            onClick={handleSave}
            disabled={savingDisabled || saving}
            className={[
              "px-6 py-3 text-lg rounded-md text-white shadow-sm transition",
              savingDisabled || saving
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700",
            ].join(" ")}
            type="button"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {error && <div className="text-red-700 bg-red-50 mt-6 p-3 rounded-md border border-red-200">{error}</div>}
        {msg && <div className="text-emerald-700 bg-emerald-50 mt-6 p-3 rounded-md border border-emerald-200">{msg}</div>}
      </div>
    </div>
  );
}
