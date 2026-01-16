// src/components/NoteApp.jsx
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetAuth, setGuest, setAuthedUser } from "../reducers/authSlice";
import { getColorClassById } from "../helpers/colors";


import Header from "./Header";
import Modal from "./modals/Modal";
import NoteFormModal from "./modals/NoteFormModal";
import Plus from "./icons/Plus";

import Calendar from "./Calendar";
import Unscheduled from "./Unscheduled";

import { logoutAction, removeGuestMode } from "../actions/authActions";
import {
  initNotesAndFoldersAction,
  syncGuestAction,
  addNoteAction,
  deleteNoteAction,
  updateNoteAction,
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

  const user = useSelector((s) => s.auth.user);
  const guest = useSelector((s) => s.auth.guest);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL + "/api/notes";
  const API_URL2 = import.meta.env.VITE_API_URL + "/api/folders";

  // auth preload
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const email = localStorage.getItem("email");
    if (token && email) {
      dispatch(setGuest(false));
      dispatch(setAuthedUser(email));
    }
  }, [dispatch]);

  // data load
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
    }, 6000);
    return () => clearTimeout(t);
  }, [error, msg]);

  // actions
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
amburger      noteById,
      activeFolder,
      setNotes,
      setLengthNotes,
      setLoading,
      setError,
      setIsModalOpen,
      setSelectedNote,
      setMsg,
    });

    

  // callendar callbacks - will be transfered soon

  const onSaveDate = async (note, ymd) =>
    updateNoteAction({
      guest,
      API_URL,
      noteId: note.id,
      updatedFields: { ...note, scheduledAt: ymd },
      selectedNote: note,
      activeFolder,
      setNotes,
      setLengthNotes,
      setLoading,
      setError,
      setIsModalOpen,
      setSelectedNote,
      setMsg,
    });

  const onMoveDate = onSaveDate;

  // derived
  const filteredNotes = useMemo(
    () => notes.filter((n) => n && (activeFolder == null || n.folderId === activeFolder)),
    [notes, activeFolder]
  );

  const noteById = useMemo(() => {
    const m = new Map();
    for (const n of filteredNotes) m.set(String(n.id), n);
    return m;
  }, [filteredNotes]);

  const unscheduled = useMemo(
    () => filteredNotes.filter((n) => !n.scheduledAt),
    [filteredNotes]
  );

  const events = useMemo(
    () =>
      filteredNotes
        .filter((n) => !!n.scheduledAt)
        .map((n) => {
          const colorClass = getColorClassById(n.id);
          return {
            id: String(n.id),
            title: n.title,
            start: n.scheduledAt,
            allDay: true,
            extendedProps: { note: { ...n, colorClass } }, // <<< color
          };
        }),
    [filteredNotes]
  );
  return (
    <div className="w-full">
      {user && <Header userName={user.email} onLogout={onLogoutClick} />}
      {guest && (
        <Header
          userName="Guest"
          onLogout={() => removeGuestMode(dispatch, navigate)}
        />
      )}

      <div className="w-full md:max-w-7xl mx-auto px-5 mt-6">
        <div className="flex items-center gap-4 justify-center">
          <Plus onClick={() => setShowNoteModal(true)} className="rounded-2xl text-white text-3xl grid place-items-center shadow-lg transition" />
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-800">
            Note Board
          </h1>
        </div>
        <p className="mt-2 text-slate-600 text-xl text-center">Calendar</p>
      </div>

      {error && <div className="text-red-700 bg-red-50 mt-6 p-4 rounded-xl mb-4 border border-red-200">{error}</div>}
      {msg && <div className="text-emerald-700 bg-emerald-50 mt-6 p-4 rounded-xl mb-4 border border-emerald-200">{msg}</div>}

      {loading ? (
        <p className="text-slate-800 mx-auto text-3xl text-center py-16">Loading...</p>
      ) : (
        <div className=" w-[80%] flex space-between mx-auto mt-20 px-6">
          {/** Folders sidebar  */}

               <div className="w-[20%] flex flex-col rounded-lg">
        {folderOptions.map((opt) => {
          const isActive =
            (activeFolder == null && opt.id == null) ||
            String(activeFolder) === String(opt.id);

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
                className={["absolute left-0 top-0.1 h-[70%] w-1", isActive ? "bg-orange-500" : "bg-transparent"].join(" ")}
                aria-hidden="true"
              />
              {label}
            </button>
          );
        })}

      </div>
 
      <div className="overflow-visible calendar-container center flex flex-col">
        <Calendar
          events={events}
          onOpen={(note) => switchModalState(note)}
          onComplete={(note) =>
            handleUpdateNote(note.id, { ...note, folderId: 4 /* done */ })
          }
          onDelete={(note) => handleDeleteNote(note.id)}
          onMoveDate={(note, ymd) =>
  handleUpdateNote(note.id, { scheduledAt: ymd })
}

          
        />


        <Unscheduled
          notes={unscheduled}
          onOpen={(n) => switchModalState(n)}
          onDelete={(id) => handleDeleteNote(id)}
          onComplete={(n) => handleUpdateNote(n.id, { ...n, folderId: 4 })}
          onEdit={(n) => switchModalState(n)}
        />
      </div>
    </div>
  )
}

{
  isModalOpen && selectedNote && (
    <Modal
      selectedNote={selectedNote}
      switchModal={(n) => switchModalState(n)}
      updateNote={handleUpdateNote}
      folders={folders}
    />
  )
}

{
  showNoteModal && (
    <NoteFormModal
      folders={folders}
      setShowNoteModal={setShowNoteModal}
      handleAddNote={handleAddNote}
    />
  )
}
    </div >
    
  );
}
