export function validateNote(newNote, guest) {
  if (!newNote.title.trim()) {
    return "Title is required.";
  }
  if (!guest && !newNote.folderId) {
    return "Title and folder selection are required!";
  }
  return null;
}

export function buildPayload(newNote, guest) {
  return {
    ...newNote,
    folderId: guest ? null : Number(newNote.folderId),
  };
}

export function createEmptyNote() {
  return {
    title: "",
    content: "",
    folderId: "",
  };
}

