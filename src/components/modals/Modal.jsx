import React, { useState } from "react";
export default function Modal({ selectedNote, switchModal, updateNote, folders }) {
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [folderId, setFolderId] = useState(selectedNote.folderId);
  const [title, setTitle] = useState(selectedNote.title);
  const [content, setContent] = useState(selectedNote.content);

  const handleSave = async () => {
    const success = await updateNote(selectedNote.id, { title, content, folderId });
    if (!success) {
      setError("Failed to update note!");
      return;
    }
    // Modal will close from NoteApp on success
  };

  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
  <div className="bg-white/90 rounded-2xl shadow-2xl p-10 w-full max-w-2xl relative">
    <button
      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl"
      onClick={() => switchModal(null)}
      aria-label="Close"
    >
      ×
    </button>

    <h2 className="text-3xl font-bold mb-6">Edit Note</h2>

    <input
      type="text"
      className="w-full mb-4 p-3 border border-gray-300 rounded"
      value={title}
      onChange={e => setTitle(e.target.value)}
    />

    <textarea
      className="w-full mb-4 p-3 border border-gray-300 rounded h-40"
      value={content}
      onChange={e => setContent(e.target.value)}
    />

    <select
      value={folderId}
      onChange={(e) => setFolderId(Number(e.target.value))}
      className="w-full p-3 mb-4 border-2 border-gray-300 rounded-md text-gray-800 transition-colors duration-200 focus:outline-none focus:border-blue-400"
    >
      <option value="" disabled className="text-gray-400">
        Select a folder
      </option>
      {folders.map((folder) => (
        <option key={folder.id} value={folder.id}>
          {folder.name}
        </option>
      ))}
    </select>

    <div className="flex justify-end gap-3">
      <button
        className="bg-blue-500 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-600 transition"
        onClick={handleSave}
      >
        Save
      </button>
      <button
        className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg shadow hover:bg-gray-300 transition"
        onClick={() => switchModal(null)}
      >
        Cancel
      </button>
    </div>

    {error && <div className="text-red-500 mt-4">{error}</div>}
    {msg && <div className="text-green-500 mt-4">{msg}</div>}
  </div>
</div>

  );
}