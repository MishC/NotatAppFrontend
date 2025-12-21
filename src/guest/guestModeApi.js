export function addNoteLocal(prevNotes, { title, content, folderId }) {
  try {
  const newNote = {
    id: Date.now(),
    title,
    content,
    folderId: folderId ?? null,
    orderIndex: prevNotes.length,
    createdAt: new Date().toISOString(),
  };
   
  return [...prevNotes, newNote];}
  catch (err) {
    console.error("Error adding note:", err);
    return false;
  }
}

// DELETE 
export function deleteNoteLocal(prevNotes, id) {
  const filtered = prevNotes.filter((n) => n.id !== id);
  return filtered.map((n, idx) => ({ ...n, orderIndex: idx }));
}

// UPDATE
export function updateNoteLocal(prevNotes, id, updatedFields) {
  return prevNotes.map((note) =>
    note.id === id ? { ...note, ...updatedFields } : note
  );
}

// SWAP (drag & drop) – swap orderIndex
export function swapNotesLocal(prevNotes, dragId, dropId) {
  const arr = [...prevNotes];
  const dragIndex = arr.findIndex((n) => n.id === dragId);
  const dropIndex = arr.findIndex((n) => n.id === dropId);

  if (dragIndex === -1 || dropIndex === -1) return prevNotes;

  const temp = arr[dragIndex].orderIndex ?? dragIndex;
  arr[dragIndex].orderIndex = arr[dropIndex].orderIndex ?? dropIndex;
  arr[dropIndex].orderIndex = temp;

  arr.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  return arr;
}
