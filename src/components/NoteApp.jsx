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
    await logoutAction({dispatch, navigate}).finally(() => {
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
      {guest && <Header userName="Guest" onLogout={()=>removeGuestMode(dispatch, navigate)} />
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
          <KanbanNoteIcon className="text-blue-600 text-center" />
          <h1 className="text-5xl md:text-6xl  font-extrabold tracking-tight text-slate-800 text-center">
            Note Board
          </h1>
        </div>
        <p className="mt-2 text-slate-600 text-lg text-center">
          Organize your notes like cards on a board.
        </p>
        {/* <div className="mt-4 h-px w-full bg-gradient-to-r from-slate-200 via-slate-200/60 to-transparent" /> */}
      </div>

      <div className="mb-25">
        <Noteform folders={folders} handleAddNote={handleAddNote} guest={guest} />
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
      ) :  (
        <div className="w-full w-min-[70%] md:max-w-7xl mx-auto mt-6 px-6">
          <div className="inline-flex w-full  rounded-lg">
            {folderOptions.map((opt) => (
              <button
                key={opt.id ?? "all"}
                onClick={() => handleFolderClick(opt)}
                className={[
                  "flex-1 px-6 py-4 text-2xl font-semibold  transition",
                  activeFolder === opt.id
                    ? "bg-white text-slate-800 shadow-md"
                    : "text-slate-700 hover:text-blue-600",
                ].join(" ")}
              >
                {opt.label==="All"?"Notes":opt.label}
              </button>
            ))}
          </div>

          <ul
            className={[
              "w-full w-min-[70%]",
              "h-min-[0%]",
              "mx-auto bg-white rounded-b-2xl",
              "py-6 px-5",
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
    </div>
  );
}
