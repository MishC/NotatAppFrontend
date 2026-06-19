import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { getColorClassById } from "../helpers/colors";
import { useAutoClearMessage} from "../helpers/noteHelpers";

import EditNoteModal from "./modals/EditNoteModal";
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
  getOverdueNotesCountAction,
  updateNoteAction,
  selectFolderAction,
  toggleModalAction,
} from "../actions/noteActions";


export default function NoteApp() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [overdueNotesCount, setOverdueNotesCount] = useState(0);

  const user = useSelector((s) => s.auth.user);
  const guest = useSelector((s) => s.auth.guest);

  // stable URLs
  const API_URL = import.meta.env.VITE_API_NOTES;
  const API_URL2 = import.meta.env.VITE_API_FOLDERS;
  // auto clear messages (same behavior, cleaner)
  useAutoClearMessage(error, setError, 4000);
  useAutoClearMessage(msg, setMsg, 4000);

  // -------------------------
  // Derived data (ORDER matters)
  // -------------------------

  const filteredNotes = useMemo(() => {
    if (!activeFolder) return notes;
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
            classNames: [n.folderId === 5 ? "fc-done-event" : ""],
          };
        }),
    [filteredNotes]
  );

  // -------------------------
  // Effects
  // -------------------------

  //Set Up notes and folders
  const refreshOverdueNotesCount = useCallback(async () => {
    const count = await getOverdueNotesCountAction({ guest, API_URL, setError });
    console.log("Overdue notes count:", count);
    setOverdueNotesCount(count);
        console.log("Overdue notes count:", count);

    return count;
  }, [guest, API_URL]);

  useEffect(() => {
    initNotesAndFoldersAction({ 
      guest,
      API_URL,
      API_URL2,
      activeFolder,
      setNotes,
      setFolders,
      setLoading,
      setError,
    });
    refreshOverdueNotesCount();
  }, [guest, activeFolder, API_URL, API_URL2, refreshOverdueNotesCount]);




// Set up a guest from local storage
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
    async (newNote) => {
      const ok = await addNoteAction({ guest, API_URL, notes, setNotes, setMsg, setError, newNote });
      if (ok) refreshOverdueNotesCount();
      return ok;
    },
    [guest, API_URL, notes, refreshOverdueNotesCount]
  );

  const handleDeleteNote = useCallback(
    async (id) => {
      const ok = await deleteNoteAction({ guest, API_URL, id, setNotes, setMsg, setError });
      if (ok) refreshOverdueNotesCount();
      return ok;
    },
    [guest, API_URL, refreshOverdueNotesCount]
  );

  const handleUpdateNote = useCallback(
    async (noteId, updatedFields) => {
      const ok = await updateNoteAction({
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
      if (ok) refreshOverdueNotesCount();
      return ok;
    },
    [guest, API_URL, selectedNote, noteById, activeFolder, refreshOverdueNotesCount]
  );

  // -------------------------
  // UI helpers
  // -------------------------

  const navUserName = user?.email ? user.email : guest ? "Guest" : "Guest"; 

  return (
    <div className="w-full m-0 p-0">
      <NavigationBar
        userName={navUserName}
        isNavItemVisble={true}
        isEmailVisible={true}
      />

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
          <aside className="w-full min-w-[30%] ml-10">
            <Sidebar
              folders={folders}
              setFolders={setFolders}
              activeFolder={activeFolder} //null => "All"
              guest={guest}
              handleFolderClick={handleFolderClick}
              setError={setError}
              overdueCount={overdueNotesCount}
            />


          </aside>

          {/* RIGHT COLUMN: Subheader + Content */}
          <section className="w-full min-w-0">
            {/* Subheader is now aligned with content */}
            <div className="mb-4 flex ml-[10%] sm:block sm:ml-0">
              <Subheader title={"ToDo"} setShowNoteModal={setShowNoteModal} />
            </div>

            <div className="relative flex  justify-center mx-auto sm:mr-20 sm:block overflow-visible calendar-container">
              {activeFolder === 5 ? (
                <Done
                  notes={filteredNotes}
                  folders={folders}
                  onOpen={(n) => switchModalState(n)}
                  onDelete={(n) => handleDeleteNote(n.id)}
                />
              ) : activeFolder === 1 ? (
                <Overdues
                  notes={filteredNotes}
                  folders={folders}
                  onOpen={(n) => switchModalState(n)}
                  onDelete={(n) => handleDeleteNote(n.id)}
                />
              ) : (
                <Todo
                  events={events}
                  onOpen={(note) => switchModalState(note)}
                  onComplete={(note) => handleUpdateNote(note.id, { ...note, folderId: 5 })}
                  onDelete={(note) => handleDeleteNote(note.id)}
                  onMoveDate={(note, ymd) => handleUpdateNote(note.id, { scheduledAt: ymd })}
                />
              )}
            </div>
          </section>
        </div>
      )}

      {isModalOpen && selectedNote && (
        <EditNoteModal
          selectedNote={selectedNote}
          folders={folders}
          switchModal={(n) => switchModalState(n)}
          updateNote={handleUpdateNote}
        />
      )}

      {showNoteModal && (
        <NoteFormModal
          folders={folders}
          setFolders={setFolders}
          setShowNoteModal={setShowNoteModal}
          handleAddNote={handleAddNote}
        />
      )}
    </div>
  );
}
