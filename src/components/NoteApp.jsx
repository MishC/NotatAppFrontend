// src/components/NoteApp.jsx
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetAuth, setGuest, setAuthedUser } from "../reducers/authSlice";
import { getColorClassById } from "../helpers/colors";


import Header from "./Header";
import Modal from "./modals/Modal";
import NoteFormModal from "./modals/NoteFormModal";
import Sidebar from "./Sidebar";
import Todo from "./Todo";
import Subheader from "./Subheader";
import Done from "./Done";
import Overdues from  "./Overdues";


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
import { OVERDUE_ID } from "../backend/notesApi";

export default function NoteApp() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [folderOptions, setFolderOptions] = useState([{ id: null, label: "All" }]);
  const [activeFolder, setActiveFolder] = useState(null);

  const [loading, setLoading] = useState(false);
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

  const isDoneView = activeFolder === 4;
  const isOverdueView = activeFolder === OVERDUE_ID;

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
      setLoading,
      setError,
    });
  }, [guest, activeFolder, API_URL, API_URL2]);

  useEffect(() => {
    syncGuestAction({ guest, notes, folders });
  }, [guest, notes, folders]);

  // error and msg states

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 4000);//scheduler runs immediately and after 4 sec is planned changed state of error msg
    return () => clearTimeout(t);// if error state is changed before 4 sec timeout, it will be executed -cleared timeout
  }, [error]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 4000);//scheduler runs immediately and after 4 sec is planned changed state of success msg
    return () => clearTimeout(t); // if msg state is changed before 4 sec timeout, it will be executed -cleared timeout
  }, [msg]);


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
      noteById,
      activeFolder,
      setNotes,
      setLoading,
      setError,
      setIsModalOpen,
      setSelectedNote,
      setMsg,
    });



  // derived

  const filteredNotes = useMemo(() => {
    const isRealFolder = typeof activeFolder === "number";
    if (!isRealFolder) return notes;

    return notes.filter(n => n && String(n.folderId) === String(activeFolder));
  }, [notes, activeFolder]);






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
            classNames: [
              n.folderId === 4 ? "fc-done-event" : "",
            ],
          };
        }),
    [filteredNotes]
  );

  return (
    <div className="w-full mx-auto m-0 p-0">
      {user && <Header userName={user.email} onLogout={onLogoutClick} />}
      {guest && (
        <Header
          userName="Guest"
          onLogout={() => removeGuestMode(dispatch, navigate)}
        />
      )}

      <Subheader setShowNoteModal={setShowNoteModal} />

      <div className={error||msg? "p-5 rounded-xl" : "p-2"}>
        {error ? (
          <div className="text-red-700 p-4 bg-red-50 rounded-xl border border-red-200">{error}</div>
        ) : msg ? (
          <div className="text-emerald-700 p-4 bg-emerald-50 rounded-xl border border-emerald-200">{msg}</div>
        ) : (
          <div>&nbsp;</div>
        )}
      </div>

      {loading ? (
        <p className="text-slate-800 mx-auto text-3xl text-center py-16">Loading...</p>
      ) : (
        <div className="main w-full sm:w-[80%] mx-auto md:mt-12 m-0 p-0 flex flex-col sm:flex-row sm:gap-4">
          {/** Folders sidebar  */}

          <div className="w-full sm:w-[20%] sm:items-center justify-center text-center d-block mb-10 ml-20 align-center">

          <Sidebar
            folderOptions={folderOptions}
            activeFolder={activeFolder}
            guest={guest}
            handleFolderClick={handleFolderClick}
          />
          </div>

          <div className="overflow-visible calendar-container center  justify-center items-center mx-auto w-[90%]">
             {activeFolder=== 4? (
               <Done
               notes={filteredNotes}
               onOpen={(n) => switchModalState(n)}
               folderOptions={folderOptions}
              onDelete={(n) => handleDeleteNote(n.id)}
            />
            )  : (activeFolder === OVERDUE_ID ? (
              <Overdues
                notes={filteredNotes} 
                folderOptions={folderOptions}
                onOpen={(n) => switchModalState(n)}
                onDelete={(n) => handleDeleteNote(n.id)}
              />
            )    : (
            <Todo
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
            ))
            }
          
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
