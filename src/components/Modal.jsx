import React, { useState } from "react";

export default function Modal({ selectedNote, switchModal, updateNote, folders }) {
  const [error, setError]   = useState(null);
  const [folderId, setFolderId] = useState(selectedNote.folderId);
  const [title, setTitle]   = useState(selectedNote.title);
  const [content, setContent] = useState(selectedNote.content ?? "");

  const handleSave = async () => {
    const ok = await updateNote(selectedNote.id, { title, content, folderId });
    if (!ok) setError("Failed to update note!");
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
          onClick={() => switchModal(null)}
          aria-label="Close"
        >×</button>

        <h2 className="text-2xl font-bold mb-4">Edit Note</h2>

        <label className="block mb-3">
          <span className="text-sm text-gray-600">Title</span>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm text-gray-600">Content</span>
          <textarea
            rows={5}
            className="mt-1 w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={content}
            onChange={(e)=>setContent(e.target.value)}
          />
        </label>

        <select
          value={folderId}
          onChange={(e)=>setFolderId(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 mb-4"
        >
          <option value="" disabled>Select a folder</option>
          {folders.map(f=> <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Save</button>
          <button onClick={()=>switchModal(null)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
        </div>

        {error && <div className="text-red-600 mt-4">{error}</div>}
      </div>
    </div>
  );
}
