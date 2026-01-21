export function validateNote(newNote, guest) {
  if (!newNote.title.trim()) {
    return "Title is required.";
  }

  return null;
}
export function normalizeFolderId(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const t = v.trim();
    if (t === "") return null;
    const num = Number(t);
    return Number.isFinite(num) ? num : null;
  }
  return null;
};
/* Guest Only */
export function buildPayload(newNote, guest) {
  const folderId = normalizeFolderId(newNote.folderId);

  return {
    title: (newNote.title || "").trim(),
    content: newNote.content?.trim() || null,
    folderId: guest ? null : folderId,
    scheduledAt: newNote.scheduledAt || null,
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

