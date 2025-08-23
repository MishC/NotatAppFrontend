import { useState } from "react";

export default function Noteform({ folders, handleAddNote }) {
  const [newNote, setNewNote] = useState({ title: "", content: "", folderId: "" });
  const [err, setErr] = useState("");

  const addNote = (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.folderId) {
      setErr("Title and folder are required.");
      return;
    }
    handleAddNote({ ...newNote, folderId: Number(newNote.folderId) });
    setNewNote({ title: "", content: "", folderId: "" });
    setErr("");
  };

  return (
    <form onSubmit={addNote} className="space-y-3">
      {/* floating label inputs */}
      <div className="relative">
        <input
          id="title"
          type="text"
          value={newNote.title}
          onChange={(e)=>setNewNote(v=>({ ...v, title: e.target.value }))}
          className="peer w-full rounded-xl border border-gray-300 p-4 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Title"
          autoFocus
        />
        <label htmlFor="title" className="absolute left-4 -top-2.5 px-1 bg-white text-xs text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600">
          Title
        </label>
      </div>

      <div className="relative">
        <textarea
          id="content"
          value={newNote.content}
          onChange={(e)=>setNewNote(v=>({ ...v, content: e.target.value }))}
          className="peer w-full rounded-xl border border-gray-300 p-4 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Content (optional)"
          rows={4}
        />
        <label htmlFor="content" className="absolute left-4 -top-2.5 px-1 bg-white text-xs text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600">
          Content (optional)
        </label>
      </div>

      <div className="relative">
        <select
          value={newNote.folderId}
          onChange={(e)=>setNewNote(v=>({ ...v, folderId: e.target.value }))}
          className="peer w-full appearance-none rounded-xl border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="" disabled>Select a folder</option>
          {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
        <label className="absolute left-4 -top-2.5 px-1 bg-white text-xs text-gray-500">Folder</label>
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}

      <button
        type="submit"
        className="w-100 mt-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 transition shadow"
      >
        + Add Note
      </button>
    </form>
  );
}
