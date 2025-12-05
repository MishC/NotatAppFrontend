import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetAuth, setGuest, setAuthedUser, setUser } from "../reducers/authSlice";


import Header from "./Header";
import Card from "./Card";
import Modal from "./Modal";
import Noteform from "./Noteform";
import KanbanNoteIcon from "./Kanban";

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
  const [isauthenticated, setIsAuthenticated] = useState(false);

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
          <button
            type="button"
            onClick={() => setShowNoteModal(true)}
            className="inline-flex items-center gap-6 cursor-pointer select-none group"

            aria-label="Add note"
          >     <span className="w-12 h-12 rounded-2xl bg-orange-500 hover:bg-orange-700
           text-white text-3xl leading-none grid place-items-center shadow-lg transition">+</span>

            <h1 className="text-5xl md:text-6xl  font-extrabold tracking-tight text-slate-800 text-center">
              Note Board
            </h1>
          </button>

        </div>

        <p className="mt-2 text-slate-600 text-xl text-center">
          Add Notes        </p>


        {/* <div className="mt-4 h-px w-full bg-gradient-to-r from-slate-200 via-slate-200/60 to-transparent" /> */}
      </div>

      {/* <div className="mb-25">
        <Noteform folders={folders} handleAddNote={handleAddNote} guest={guest} />
      </div>
 */}
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
            " w-full text-left px-6 py-4 text-2xl font-semibold rounded-lg transition relative",
            isActive
              ? "bg-white text-slate-900 translate-x-1 shadow-sm"
              : "text-slate-700 hover:text-orange-600 hover:bg-white/70 -translate-x-0.5 hover:translate-x-0"
          ].join(" ")}
        >
          {/* tenká lišta pre aktívny */}
          <span
            className={["absolute left-0 top-0 h-full w-1", isActive ? "bg-orange-500" : "bg-transparent"].join(" ")}
            aria-hidden="true"
          />
          {label}
        </button>
      );
    })}
  </div>
          <ul
            className={[
              "w-[70%]",
              "h-min-[0px]",
              "mx-auto bg-white rounded-lg",
               "p-0",
              "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
              "gap-6",
            ].join(" ")}
          >
            {notes
              .filter(
                (note) =>
                  note &&
                  (activeFolder == null || note.folderId === activeFolder)
              )
              .sort(
                (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
              )
              .map((note, idx) => (
                <div className="px-6 py-6">
                <Card
                  key={note.id}
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
  <div className="fixed inset-0 z-50 grid place-items-center p-4">
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setShowNoteModal(false)}
      aria-hidden="true"
    />
    <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-center mt-8">Add Note</h3>
           

      
  
     
      <Noteform folders={folders} handleAddNote={handleAddNote} guest={guest}/>
        <button
          onClick={() => setShowNoteModal(false)}
          className="px-5 py-2  mb-5 text-xl rounded-md border border-slate-800 hover:bg-blue-600 hover:text-white"
        >
          Close
        </button>
    </div>
    
  </div>
)}

    </div>
  );
}
