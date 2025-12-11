import { useSelector } from "react-redux";
import Noteform from "../Noteform";

export default function NoteFormModal({ setShowNoteModal, handleAddNote }) {
  const guest = useSelector((s) => s.auth.guest);
  const folders = useSelector((s) => s.notes?.folders) || []; // fallback []

  const loadingFolders = folders.length === 0 && !guest; 

 

  return (
    <div className="NoteFormModal fixed inset-0 z-50 grid place-items-center p-4">
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setShowNoteModal(false)}
      aria-hidden="true"
    />
    <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-center mt-8">Add Note</h3>
           

      
  
     
      <Noteform folders={folders} handleAddNote={handleAddNote} guest={guest} setShowNoteModal={setShowNoteModal}/>
        <button
          onClick={() => setShowNoteModal(false)}
          className="px-5 py-2  mb-5 text-xl rounded-md border border-slate-800 hover:bg-blue-600 hover:text-white"
        >
          Close
        </button>
    </div>
    
  </div>
  );
}
