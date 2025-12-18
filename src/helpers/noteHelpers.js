export function validateNote(newNote, guest) {
  if (!newNote.title.trim()) {
    return "Title is required.";
  }
 /*  if (!guest && !newNote.folderId) {
    return "Title and folder selection are required!";
  } */
  return null;
}

/* Guest Only */
export function buildPayload(newNote, guest) {
  return {
    title: (newNote.title || "").trim(),
    content: newNote.content?.trim() || null,
    folderId: guest
      ? null
      : (newNote.folderId ? Number(newNote.folderId) : null),
    // DateOnly? only "YYYY-MM-DD" or null
    scheduledAt: newNote.scheduledAt ? newNote.scheduledAt : null,
  };
}

export function createEmptyNote() {
  return {
    title: "",
    content: "",
    folderId: "",
    scheduledAt: null
  };
}

