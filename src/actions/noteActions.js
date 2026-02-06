import {
  addNoteApi,
  deleteNoteApi,
  updateNoteApi,
  swapNotesApi,
  fetchNotesApi,
  fetchFoldersApi,
  OVERDUE_ID,
  createFolderApi
} from "../backend/notesApi";

import {
  addNoteLocal,
  deleteNoteLocal,
  updateNoteLocal,
  swapNotesLocal,
} from "../guest/guestModeApi";

import { normalizeFolderId, validateNote } from "../helpers/noteHelpers";
import { isOverdue, todayYYYYMMDD, formatDateDDMMYYYY } from "../helpers/dateHelpers";


const load = (k) => JSON.parse(localStorage.getItem(k) || "[]");
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* 1) INITIAL LOAD */
export async function initNotesAndFoldersAction({
  guest,
  API_URL,
  API_URL2,
  activeFolder,
  setNotes,
  setFolders,
  setFolderOptions,
  setLoading,
  setError,
}) {
  
  setLoading(true);

  if (guest) {
    const savedNotes = load("noteapp_guest_notes") || [];
    const savedFolders = load("noteapp_guest_folders") || [];

    setNotes(savedNotes);
    setFolders(savedFolders); // now is only All folder allowed
    setFolderOptions([{ id: null, label: "All" }]);


    setLoading(false);
    return true;
  }

  try {

    await Promise.all([
      (async () => {
        
        const list = await fetchNotesApi({ API_URL, activeFolder }); 
        setNotes(list);
      
      })(),
      (async () => {
        const folders = await fetchFoldersApi({ API_URL2 });
        setFolders(folders);

        const isDone = (f) => (f?.name || "").trim().toLowerCase() === "done";
        setFolderOptions([
          { id: null, label: "All" },
          ...folders.filter(f => !isDone(f)).map(f => ({ id: f.id, label: f.name })),
          ...folders.filter(isDone).map(f => ({ id: f.id, label: f.name })),
          { id: OVERDUE_ID, label: "Overdues" }

        ]);
        
      })(),
    ]);
        setLoading(false);


    return true;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Init failed.");
    return false;
  } finally {
    setLoading(false);
  }
}

/* 2) SYNC GUEST */
export function syncGuestAction({ guest, notes, folders }) {
  if (!guest) return;
  save("noteapp_guest_notes", notes);
  save("noteapp_guest_folders", folders);
}

/* 3) ADD NOTE */
export async function addNoteAction({
  guest,
  API_URL,
  notes,
  setNotes,
  setMsg,
  setError,
  newNote,
}) {
    

 const validationError = validateNote(newNote);

  if (validationError) {
    setError(validationError);
    return false;
  }

  if (guest) {
   
    setNotes((prev) => addNoteLocal(prev, newNote));
    setMsg("Note added (guest mode).");
    return true;
  }

  try {
    const created = await addNoteApi({ API_URL, newNote });
    setNotes([...(notes || []), created]);
    setMsg("Note added.");
    return true;
  } catch (e) {
    console.error(e);
    setError("Error adding note.");
    return false;
  }
}

/* 4) DELETE NOTE */
export async function deleteNoteAction({
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
    return true;
  }

  try {
    await deleteNoteApi({ API_URL, id });
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setMsg("Note deleted successfully.");
    return true;
  } catch (e) {
    console.error(e);
    setError("Error deleting note.");
    return false;
  }
}

/* 5) UPDATE NOTE */
export async function updateNoteAction({
  guest,
  API_URL,
  noteId,
  updatedFields,
  selectedNote,
  noteById,          // NEW (Map)
  activeFolder,
  setNotes,
  setLoading,
  setError,
  setIsModalOpen,
  setSelectedNote,
  setMsg,
}) {
  // find base note safely (modal note OR lookup)
  const base = selectedNote ?? noteById?.get(String(noteId));
  if (!guest && !base) {
    setError?.("No base note found for update.");
    return false;
  }

const nextScheduledAt =
    updatedFields.scheduledAt !== undefined
      ? (typeof updatedFields.scheduledAt === "string"
          ? (updatedFields.scheduledAt.trim() || null)
          : updatedFields.scheduledAt)
      : (base?.scheduledAt ?? null);

  // Scheduleat cannot be past today
  if (nextScheduledAt && isOverdue(nextScheduledAt)) {
    const formatted = formatDateDDMMYYYY(todayYYYYMMDD());

    setError(`Deadline must be today or in the future. (today: ${formatted})`);
    return false;
  }
  
if (guest) {
    setNotes((prev) => updateNoteLocal(prev, noteId, { ...updatedFields, scheduledAt: nextScheduledAt }));
    setMsg("Note updated (guest mode).");
    setIsModalOpen(false);
    setSelectedNote(null);
    return true;
  }

  // if we still don't have a base note, we can only update fields that backend accepts without full object.
  // if your backend requires full payload, bail out safely:
  if (!base) {
    setError("Cannot update: note not found (missing base note).");
    return false;
  }


  // IMPORTANT: folder/title/content optional, never read selectedNote directly
  const payload = {
    ...base,
    ...updatedFields,
    id: noteId,

    // folderId optional:
    // - if updatedFields.folderId exists -> use it
    // - else use base.folderId
    // - else null

    folderId: normalizeFolderId(
      updatedFields.folderId !== undefined ? updatedFields.folderId : base.folderId
    ),
    // title optional
    title:
      updatedFields.title !== undefined
        ? updatedFields.title
        : (base.title ?? ""),

    // content optional
    content:
      updatedFields.content !== undefined
        ? updatedFields.content
        : (base.content ?? ""),

    // scheduledAt optional
    scheduledAt:
      nextScheduledAt,
  };

  try {
    await updateNoteApi({ API_URL, noteId, payload });
    setMsg(`Note "${payload.title}" updated successfully!`);

    setLoading(true);
    const list = await fetchNotesApi({ API_URL, activeFolder });
    setNotes(list);

    setIsModalOpen(false);
    setSelectedNote(null);
    return true;
  } catch (e) {
    const msg = e?.message || "";
    setError(msg.includes("Deadline") ? msg : `Error updating note "${payload.title}".`);
    return false;
  } finally {
    setLoading(false);
  }
}

/* 6) SWAP NOTES */
export async function swapNotesAction({
  guest,
  API_URL,
  sourceId,
  targetId,
  setNotes,
  setError,
}) {
  if (guest) {
    setNotes((prev) => swapNotesLocal(prev, sourceId, targetId));
    return true;
  }

  // optimistic swap
  const applySwap = (prev) => {
    const next = prev.map((n) => ({ ...n }));
    const a = next.find((n) => n.id === sourceId);
    const b = next.find((n) => n.id === targetId);
    if (!a || !b) return prev;

    const tmp = a.orderIndex ?? 0;
    a.orderIndex = b.orderIndex ?? 0;
    b.orderIndex = tmp;

    next.sort((x, y) => (x.orderIndex ?? 0) - (y.orderIndex ?? 0));
    return next;
  };

  setNotes(applySwap);

  try {
    await swapNotesApi({ API_URL, sourceId, targetId });
    return true;
  } catch (e) {
    console.error(e);
    setError("Swap failed on server.");
    setNotes(applySwap); // revert
    return false;
  }
}

/* 7) FOLDER SELECT */
export function selectFolderAction(opt, setActiveFolder) {
  setActiveFolder(opt.id);
  return true;
}

/* 8) MODAL OPEN/CLOSE */
export function toggleModalAction(note, setIsModalOpen, setSelectedNote) {
  if (!note) {
    setIsModalOpen(false);
    setSelectedNote(null);
    return true;
  }
  setSelectedNote(note);
  setIsModalOpen(true);
  return true;
}


//Folders
export async function createFolderAction({ API_URL, folderName, setFolders, setError }) {
  try {
    const newFolder = await createFolderApi({ API_URL, folderName });
    setFolders((prev) => [...prev, newFolder]);
  } catch (error) {
    setError(error.message);
  }
}
