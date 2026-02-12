import { useSelector } from "react-redux";
import Noteform from "../Noteform";

export default function NoteFormModal({ folders, setFolders, setShowNoteModal, handleAddNote }) {
  const guest = useSelector((s) => s.auth.guest);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setShowNoteModal(false)}
        aria-hidden="true"
      />
      {/* card */}
      <div
        className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-center mt-2 mb-6">Add Note</h3>

        <Noteform
          folders={folders}
          setFolders={setFolders}
          handleAddNote={handleAddNote}
          guest={guest}
          setShowNoteModal={setShowNoteModal}
        />

        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setShowNoteModal(false)}
            className="px-5 py-2 text-lg rounded-md border border-slate-800 hover:bg-blue-600 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
