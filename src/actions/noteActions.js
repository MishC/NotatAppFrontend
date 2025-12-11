import {
  addNoteApi,
  deleteNoteApi,
  updateNoteApi,
  swapNotesApi,
  fetchNotesApi,
  fetchFoldersApi,
} from "../backend/notesApi";

import {
  addNoteLocal,
  deleteNoteLocal,
  updateNoteLocal,
  swapNotesLocal,
} from "../guest/guestModeApi";

/* -----------------------------------------
   1) INITIAL LOAD (guest vs backend)
------------------------------------------ */
export async function initNotesAndFoldersAction({
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
}) {
  if (guest) {
    const savedNotes = JSON.parse(localStorage.getItem("noteapp_guest_notes") || "[]");
    const savedFolders = JSON.parse(localStorage.getItem("noteapp_guest_folders") || "[]");

    setNotes(savedNotes);
    setFolders(savedFolders);

    setFolderOptions([
      { id: null, label: "All" },
      ...savedFolders.map((f) => ({ id: f.id, label: f.name }))
    ]);

    setLoading(false);
    return;
  }

  await fetchNotesApi({
    API_URL,
    activeFolder,
    setNotes,
    setLengthNotes,
    setLoading,
    setError,
  });

  await fetchFoldersApi({
    API_URL2,
    setFolders,
    setFolderOptions,
    setError,
  });
}

/* -----------------------------------------
   2) SYNC FOR GUEST mode
------------------------------------------ */
export function syncGuestAction({ guest, notes, folders }) {
  if (!guest) return;

  localStorage.setItem("noteapp_guest_notes", JSON.stringify(notes));
  localStorage.setItem("noteapp_guest_folders", JSON.stringify(folders));
}

/* -----------------------------------------
   3) ADD NOTE
------------------------------------------ */
export function addNoteAction({
  guest,
  API_URL,
  notes,
  setNotes,
  setMsg,
  setError,
  newNote,
}) {
  if (guest) {
    setNotes((prev) => addNoteLocal(prev, newNote));
    setMsg("Note added (guest mode).");
    return true;
  }

  addNoteApi({
    API_URL,
    notes,
    setNotes,
    setMsg,
    setError,
    newNote,
  });
}

/* -----------------------------------------
   4) DELETE NOTE
------------------------------------------ */
export function deleteNoteAction({
  guest,
  API_URL,
  id,
  setNotes,
  setMsg,
  setError,
}) {
  if (guest) {
    setNotes((prev) => deleteNoteLocal(prev, id));
    setMsg("Note deleted (guest mode).");
    return;
  }

  deleteNoteApi({
    API_URL,
    id,
    setNotes,
    setMsg,
    setError,
  });
}

/* -----------------------------------------
   5) UPDATE NOTE
------------------------------------------ */
export function updateNoteAction({
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
}) {
  if (guest) {
    setNotes((prev) => updateNoteLocal(prev, noteId, updatedFields));
    setMsg("Note updated (guest mode).");
    setIsModalOpen(false);
    setSelectedNote(null);
    return Promise.resolve(true);
  }

  return updateNoteApi({
    API_URL,
    noteId,
    updatedFields,
    selectedNote,
    activeFolder,
    fetchNotesFn: (af) =>
      fetchNotesApi({
        API_URL,
        activeFolder: af,
        setNotes,
        setLengthNotes,
        setLoading,
        setError,
      }),
    setIsModalOpen,
    setSelectedNote,
    setMsg,
    setError,
  });
}

/* -----------------------------------------
   6) SWAP NOTES
------------------------------------------ */
export function swapNotesAction({
  guest,
  API_URL,
  sourceId,
  targetId,
  setNotes,
  setError,
}) {
  if (guest) {
    setNotes((prev) => swapNotesLocal(prev, sourceId, targetId));
    return;
  }

  swapNotesApi({
    API_URL,
    sourceId,
    targetId,
    setNotes,
    setError,
  });
}

/* -----------------------------------------
   7) FOLDER SELECT (tiny helper)
------------------------------------------ */
export function selectFolderAction(opt, setActiveFolder) {
  setActiveFolder(opt.id);
}

/* -----------------------------------------
   8) MODAL OPEN/CLOSE
------------------------------------------ */
export function toggleModalAction(note, setIsModalOpen, setSelectedNote) {
  if (!note) {
    setIsModalOpen(false);
    setSelectedNote(null);
    return;
  }

  setSelectedNote(note);
  setIsModalOpen(true);
}
