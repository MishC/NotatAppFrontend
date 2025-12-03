import { useState } from 'react';

export default function Noteform({ folders, handleAddNote, guest=false}) {
  //states
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    folderId: ''
  });
  const [error, setError] = useState(null);

  //onClick event
  const addNote = (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || (!guest && !newNote.folderId)) {
      const msg = guest
        ? "Title is required."
        : "Title and folder selection are required!";
      alert(msg);
      setError(msg);
      return;
    }


   const payload = {
      ...newNote,
      folderId: guest
        ? null 
        : Number(newNote.folderId),
    };

    handleAddNote(payload);

    setNewNote({ title: '', content: '', folderId: '' });
  }
///////
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
      {/* Folder selection for guest and user*/}
           {!guest && (
        <select
          value={newNote.folderId}
          onChange={(e) =>
            setNewNote({ ...newNote, folderId: e.target.value })
          }
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
      )}

      <div className="flex justify-center">
        <button
          onClick={addNote}
          className="mt-10 mb-6 mx-auto bg-orange-400 hover:bg-orange-700 text-white p-5 px-10 font-bold rounded flex items-center pb-0"
        >
          <span className="text-white font-bold text-2xl mb-5" aria-hidden="true" style={{ lineHeight: 1 }}>+</span>
          <span className="text-lg px-2 mb-5" style={{ lineHeight: 1 }}>&nbsp;&nbsp;Add Note</span>
        </button>
      </div>
    </div>
  );
}
