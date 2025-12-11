import { useState, useEffect, useMemo} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetAuth, setGuest, setAuthedUser, setUser } from "../reducers/authSlice";

import Header from "./Header";
import Card from "./Card";
import Modal from "./modals/Modal";
import NoteFormModal from "./modals/NoteFormModal";
import Plus from  "./icons/Plus" ; 

import { logoutAction, removeGuestMode } from "../actions/authActions";

import {
  initNotesAndFoldersAction,
  syncGuestAction,
  addNoteAction,
  deleteNoteAction,
  updateNoteAction,
  swapNotesAction,
  selectFolderAction,
  toggleModalAction,
} from "../actions/noteActions";

import AllNotes from "./AllNotes";

export default function NoteApp() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [folderOptions, setFolderOptions] = useState([{ id: null, label: "All" }]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lengthNotes, setLengthNotes] = useState(0);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const user = useSelector((s) => s.auth.user);
  const guest = useSelector((s) => s.auth.guest);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const API_URL = `${window.location.origin}/api/notes`;
  const API_URL2 = `${window.location.origin}/api/folders`;



  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const email = localStorage.getItem("email");

    if (token && email) {
      dispatch(setGuest(false));
      dispatch(setAuthedUser(email));
    }
  }, [dispatch]);



  useEffect(() => {
    initNotesAndFoldersAction({
      guest,
      API_URL,
      API_URL2,
      activeFolder,
      setNotes,
      setFolders,
      setFolderOptions,
      setLengthNotes,
      setLoading,
      setError,
    });
  }, [guest, activeFolder, API_URL, API_URL2]);

  useEffect(() => {
    syncGuestAction({ guest, notes, folders });
  }, [guest, notes, folders]);

  useEffect(() => {
    if (!error && !msg) return;
    const t = setTimeout(() => {
      setError("");
      setMsg("");
    }, 10000);
    return () => clearTimeout(t);
  }, [error, msg]);

  const onLogoutClick = async () => {
    await logoutAction({ dispatch, navigate }).finally(() => {
      dispatch(resetAuth());
    });
  };

  const switchModalState = (note) =>
    toggleModalAction(note, setIsModalOpen, setSelectedNote);

  const handleFolderClick = (opt) =>
    selectFolderAction(opt, setActiveFolder);

  const handleAddNote = (newNote) =>
    addNoteAction({ guest, API_URL, notes, setNotes, setMsg, setError, newNote });

  const handleDeleteNote = (id) =>
    deleteNoteAction({ guest, API_URL, id, setNotes, setMsg, setError });

  const handleUpdateNote = (noteId, updatedFields) =>
    updateNoteAction({
      guest,
      API_URL,
      noteId,
      updatedFields,
      selectedNote,
      activeFolder,
      setNotes,
      setLengthNotes,
      setLoading,
      setError,
      setIsModalOpen,
      setSelectedNote,
      setMsg,
    });

  const handleSwapNotes = (sourceId, targetId) =>
    swapNotesAction({ guest, API_URL, sourceId, targetId, setNotes, setError });

  return (
    <div className="w-full">
      {user && <Header userName={user.email} onLogout={onLogoutClick} />}
      {guest && <Header userName="Guest" onLogout={() => removeGuestMode(dispatch, navigate)} />
      }

      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(10.9deg, rgb(240, 213, 190) 8.1%, rgb(249, 240, 206) 16.5%, rgb(253, 244, 210) 27.3%, rgb(222, 248, 226) 85.2%, rgb(200, 247, 242) 100%)",
        }}
      />

      <div className="w-full md:max-w-7xl mx-auto px-5 mt-6 mb-15">
        <div className="flex items-center gap-4 justify-center text-center">
          <Plus onClick={() => setShowNoteModal(true)} className="rounded-2xl
           text-white text-3xl leading-none grid place-items-center shadow-lg transition"/>


            <h1 className="text-5xl md:text-6xl  font-extrabold tracking-tight text-slate-800 text-center">
              Note Board
            </h1>
        

        </div>

        <p className="mt-2 text-slate-600 text-xl text-center">
          Add Notes        </p>

      </div>

      {error && (
        <div className="error text-red-700 bg-red-50 mt-8 p-4 rounded-xl mb-4 text-base border border-red-200">
          {error}
        </div>
      )}
      {msg && (
        <div className="msg text-emerald-700 bg-emerald-50 mt-8 p-4 rounded-xl mb-4 text-base border border-emerald-200">
          {msg}
        </div>
      )}

      {loading ? (
        <p className="text-slate-800 mx-auto text-3xl text-center py-16">
          Loading...
        </p>
      ) : (
        <div className=" w-[80%] flex space-between mx-auto mt-20 px-6">
        <div className="w-[20%] flex flex-col rounded-lg">
  {folderOptions.map((opt) => {
    const isActive = activeFolder === opt.id;
    const label = (opt.label === "All" && guest) ? "Notes" : opt.label;

    return (
      <button
      key={opt.id ?? "all"}
      onClick={() => handleFolderClick(opt)}
      className={[
        "w-full text-left px-6 py-4 text-2xl font-semibold rounded-lg transition-transform duration-200 ease-out will-change-transform relative cursor-pointer",
        isActive
        ? "bg-yellow-100/60 text-slate-900 translate-x-1"
        : "text-slate-700 hover:text-orange-600 hover:bg-white/40 -translate-x-0.5 hover:translate-x-3",
      ].join(" ")}
      >
      <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[70%] w-1 bg-orange-500"

        aria-hidden="true"
      />
      {label}
      </button>
    );
  })}
</div>


  {activeFolder === null && <AllNotes />}

         <ul
  className={[
    "w-[70%]",
    "mx-auto rounded-lg",
    "p-0",
    "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
    "gap-6",
  ].join(" ")}
>
  {notes
    .filter((note) => note && (activeFolder == null || note.folderId === activeFolder))
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    .map((note, idx) => (
      <div className="px-6 py-6" key={note.id}>
        <Card
          note={note}
          rowIndex={Math.floor(idx / 4)}
          colIndex={idx % 4}
          onDelete={handleDeleteNote}
          onUpdate={handleUpdateNote}
          onDrop={handleSwapNotes}
          onClick={() => switchModalState(note)}
        />
      </div>
    ))}
</ul>

        </div>
      )}

      {isModalOpen && selectedNote && (
        <Modal
          selectedNote={selectedNote}
          switchModal={switchModalState}
          updateNote={handleUpdateNote}
          folders={folders}
        />
      )}
 
   {showNoteModal && (
  <NoteFormModal
    setShowNoteModal={setShowNoteModal}
    handleAddNote={handleAddNote}
  />
)}


    </div>
  );
}
