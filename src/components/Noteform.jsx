import { useState } from 'react';
import { validateNote, buildPayload, createEmptyNote } from "../helpers/noteHelpers";


export default function Noteform({ folders, handleAddNote, guest=false, setShowNoteModal}) {
  //states
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    folderId: '',
    scheduledAt: '',
  });
  const [error, setError] = useState(null);

  //onClick event
 const addNote = (e) => {
  e.preventDefault();
  setError(null);

  const validationError = validateNote(newNote, guest);
  if (validationError) {
    alert(validationError);
    setError(validationError);
    return;
  }

 const payload = buildPayload(
  {
    ...newNote,
    folderId: guest ? null : Number(newNote.folderId || 0),
    scheduledAt: newNote.scheduledAt?.trim() ? newNote.scheduledAt.trim() : null,
  },
  guest
);

  const res=  handleAddNote(payload);

   if (res) {
  setNewNote({ title: "", content: "", folderId: "", scheduledAt:""});
  setShowNoteModal(false);   
}

};
///////
  return (
    <div className="max-w-xl mx-auto w-full bg-white p-6 rounded-lg  ">
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
           { !guest&& (
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

       {/* Scheduled at */}
       
         <div className="w-full flex mb-5 py-3 text-xl"><span className="mt-3 mr-7 text-red-400">Deadline</span>
         <input
          type='date'
          value={newNote.scheduledAt}
          onChange={(e) => setNewNote({ ...newNote, scheduledAt: e.target.value })
}
          placeholder="YEAR-MM-DD"
           className="w-full mb-8 px-4 py-3 text-lg rounded-lg border border-slate-300 text-slate-800
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        /></div>

      

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
