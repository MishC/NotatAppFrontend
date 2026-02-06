import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { getColorClassById } from "../helpers/colors";
import { useAutoClearMessage, getNotesApiUrl, getFoldersApiUrl } from "../helpers/noteHelpers";

import Modal from "./modals/Modal";
import NoteFormModal from "./modals/NoteFormModal";
import Sidebar from "./Sidebar";
import Todo from "./Todo";
import Subheader from "./Subheader";
import Done from "./Done";
import Overdues from "./Overdues";
import NavigationBar from "./NavigationBar";

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

  // stable URLs
  const API_URL = useMemo(() => getNotesApiUrl(), []);
  const API_URL2 = useMemo(() => getFoldersApiUrl(), []);

  // auto clear messages (same behavior, cleaner)
  useAutoClearMessage(error, setError, 4000);
  useAutoClearMessage(msg, setMsg, 4000);

  // -------------------------
  // Derived data (ORDER matters)
  // -------------------------

  const filteredNotes = useMemo(() => {
    const isRealFolder = typeof activeFolder === "number";
    if (!isRealFolder) return notes;
    return notes.filter((n) => n && String(n.folderId) === String(activeFolder));
  }, [notes, activeFolder]);

  const noteById = useMemo(() => {
    const m = new Map();
    for (const n of filteredNotes) m.set(String(n.id), n);
    return m;
  }, [filteredNotes]);

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
            extendedProps: { note: { ...n, colorClass } },
            classNames: [n.folderId === 4 ? "fc-done-event" : ""],
          };
        }),
    [filteredNotes]
  );

  // -------------------------
  // Effects
  // -------------------------

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

  // -------------------------
  // Handlers (memoized)
  // -------------------------

  const switchModalState = useCallback(
    (note) => toggleModalAction(note, setIsModalOpen, setSelectedNote),
    []
  );

  const handleFolderClick = useCallback((opt) => {
    selectFolderAction(opt, setActiveFolder);
  }, []);

  const handleAddNote = useCallback(
    (newNote) =>
      addNoteAction({ guest, API_URL, notes, setNotes, setMsg, setError, newNote }),
    [guest, API_URL, notes]
  );

  const handleDeleteNote = useCallback(
    (id) => deleteNoteAction({ guest, API_URL, id, setNotes, setMsg, setError }),
    [guest, API_URL]
  );

  const handleUpdateNote = useCallback(
    (noteId, updatedFields) =>
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
      }),
    [guest, API_URL, selectedNote, noteById, activeFolder]
  );

  // -------------------------
  // UI helpers
  // -------------------------

  const navUserName = user?.email ? user.email : guest ? "Guest" : "Guest";

  return (
    <div className="w-full m-0 p-0">
      <NavigationBar userName={navUserName} bgColor="bg-white-500" />

      <div className={error || msg ? "p-5 rounded-xl" : "p-2"}>
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
        <div
          className="
        grid grid-cols-1
        sm:grid-cols-[260px_1fr]
        gap-4 md:gap-6
        md:mt-12
      "
        >
          {/* LEFT COLUMN: Sidebar */}
          <aside className="w-full min-w-0">
            <Sidebar
              folderOptions={folderOptions}
              activeFolder={activeFolder}
              guest={guest}
              handleFolderClick={handleFolderClick}
            />

          </aside>

          {/* RIGHT COLUMN: Subheader + Content */}
          <section className="w-full min-w-0">
            {/* Subheader is now aligned with content */}
            <div className="mb-4 flex ml-[10%] sm:block sm:ml-0">
              <Subheader title={"ToDo"} setShowNoteModal={setShowNoteModal} />
            </div>

            <div className="relative flex  justify-center mx-auto sm:mx-0 sm:block overflow-visible calendar-container">
              {activeFolder === 4 ? (
                <Done
                  notes={filteredNotes}
                  onOpen={(n) => switchModalState(n)}
                  folderOptions={folderOptions}
                  onDelete={(n) => handleDeleteNote(n.id)}
                />
              ) : activeFolder === OVERDUE_ID ? (
                <Overdues
                  notes={filteredNotes}
                  folderOptions={folderOptions}
                  onOpen={(n) => switchModalState(n)}
                  onDelete={(n) => handleDeleteNote(n.id)}
                />
              ) : (
                <Todo
                  events={events}
                  onOpen={(note) => switchModalState(note)}
                  onComplete={(note) => handleUpdateNote(note.id, { ...note, folderId: 4 })}
                  onDelete={(note) => handleDeleteNote(note.id)}
                  onMoveDate={(note, ymd) => handleUpdateNote(note.id, { scheduledAt: ymd })}
                />
              )}
            </div>
          </section>
        </div>
      )}

      {isModalOpen && selectedNote && (
        <Modal
          selectedNote={selectedNote}
          switchModal={(n) => switchModalState(n)}
          updateNote={handleUpdateNote}
          folders={folders}
        />
      )}

      {showNoteModal && (
        <NoteFormModal
          folders={folders}
          setShowNoteModal={setShowNoteModal}
          handleAddNote={handleAddNote}
        />
      )}
    </div>
  );
}