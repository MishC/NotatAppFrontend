import { useState } from 'react';

export default function Noteform({ folders, handleAddNote }) {
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    folderId: ''
  });
  const [error, setError] = useState(null);

  const addNote = (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.folderId) {
      alert("Title and folder selection are required!");
      setError("Title and folder cannot be empty. Please fill them out.");
      return;
    }
    const payload = {
      ...newNote,
      folderId: Number(newNote.folderId), 
    };
    handleAddNote(payload);
    setNewNote({ title: '', content: '', folderId: '' });
  }

  return (
    <div className="max-w-xl mx-auto w-full bg-white p-6 rounded-lg shadow-md my-10 mb-20">
      <input
        type="text"
        placeholder="Title"
        autoFocus
        value={newNote.title}
        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
        className="w-full p-4 my-4 border-2 border-gray-300 rounded-md text-gray-800 transition-colors duration-200 focus:outline-none focus:border-blue-300"
      />

      <textarea
        placeholder="Content (optional)"
        value={newNote.content}
        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
        className="w-full p-4 my-2 mb-4 border-2 border-gray-300 rounded-md text-gray-800 transition-colors duration-200 focus:outline-none focus:border-blue-300"
      />

      <select
        value={newNote.folderId}
        onChange={(e) => setNewNote({ ...newNote, folderId: e.target.value })}
        className="w-full p-4 my-2 border-2 border-gray-300 rounded-md text-gray-800 transition-colors duration-200 focus:outline-none focus:border-blue-300"
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

      <div className="flex justify-center">
        <button
          onClick={addNote}
          className="mt-10 mb-6 mx-auto bg-emerald-500 hover:bg-emerald-700 text-white p-5 px-10 font-bold rounded flex items-center"
          style={{ paddingBottom: 0 }}
        >
          <span className="text-white font-bold text-2xl mb-5" aria-hidden="true" style={{ lineHeight: 1 }}>+</span>
          <span className="text-lg px-2 mb-5" style={{ lineHeight: 1 }}>&nbsp;&nbsp;Add Note</span>
        </button>
      </div>
    </div>
  );
}
