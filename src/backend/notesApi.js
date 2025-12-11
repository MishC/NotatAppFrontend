
export async function apiRequest({
  url,
  method = "GET",
  body,
  setError,
  expectJson = true,
}) {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
    if (response.status === 401) {
          store.dispatch(logout());

    window.location.href = "/auth";
    throw new Error("Unauthorized");
    }

  if (!res.ok) {
    const msg = `HTTP error! status: ${res.status}`;
    setError?.(msg);
    throw new Error(msg);
  }

  if (!expectJson || res.status === 204) return null;

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}


export async function fetchFoldersApi({
  API_URL2,
  setFolders,
  setFolderOptions,
  setError,
}) {
  try {
    const data = await apiRequest({
      url: API_URL2,
      setError,
    });

    const folders = data || [];
    setFolders(folders);

    setFolderOptions([
      { id: null, label: "All" },
      ...folders.map((f) => ({ id: f.id, label: f.name })),
    ]);
  } catch (err) {
    console.error("Error fetching folders:", err);
    setError("Error fetching folders.");
  }
}

export async function fetchNotesApi({
  API_URL,
  activeFolder,
  setNotes,
  setLengthNotes,
  setLoading,
  setError,
}) {
  setLoading(true);
  try {
    const url =
      activeFolder === 4 ? `${API_URL}/done` : `${API_URL}/pending`;

    const data = await apiRequest({ url, setError });
    const list = data || [];

    setNotes(list);

    setLengthNotes(
      activeFolder == null
        ? list.length
        : list.filter((n) => n.folderId === activeFolder).length
    );
  } catch (err) {
    console.error("Error fetching notes:", err);
    setError("Error fetching notes. Please try again later.");
  } finally {
    setLoading(false);
  }
}

export async function addNoteApi({
  API_URL,
  notes,
  setNotes,
  setMsg,
  setError,
  newNote,
}) {
  try {
    const created = await apiRequest({
      url: API_URL,
      method: "POST",
      body: newNote,
      setError,
    });

    setNotes([...(notes || []), created]);
    setMsg("Note added.");
  } catch (err) {
    console.error("Error adding note:", err);
    setError("Error adding note.");
  }
}

export async function deleteNoteApi({
  API_URL,
  id,
  setNotes,
  setMsg,
  setError,
  confirmFn = window.confirm,
}) {
  const ok = confirmFn("Are you sure you want to delete this note?");
  if (!ok) return;

  try {
    await apiRequest({
      url: `${API_URL}/${id}`,
      method: "DELETE",
      setError,
      expectJson: false,
    });

    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      setMsg("Note deleted successfully.");
      return updated;
    });
  } catch (err) {
    console.error("Error deleting note:", err);
    setError("Error deleting note.");
  }
}

export async function updateNoteApi({
  API_URL,
  noteId,
  updatedFields,
  selectedNote,
  activeFolder,
  fetchNotesFn,
  setIsModalOpen,
  setSelectedNote,
  setMsg,
  setError,
}) {
  try {
    const payload = {
      ...selectedNote,
      ...updatedFields,
      id: noteId,
      folderId: updatedFields.folderId,
      title: updatedFields.title,
      content: updatedFields.content,
    };

    await apiRequest({
      url: `${API_URL}/${payload.folderId}/${noteId}`,
      method: "PUT",
      body: payload,
      setError,
    });

    setMsg(`Note "${updatedFields.title}" updated successfully!`);

    await fetchNotesFn(activeFolder);

    setIsModalOpen(false);
    setSelectedNote(null);
    return true;
  } catch (err) {
    console.error("Error updating note:", err);
    setError("Error updating note.");
    return false;
  }
}

export async function swapNotesApi({
  API_URL,
  sourceId,
  targetId,
  setNotes,
  setError,
}) {
  // optimistic swap
  setNotes((prev) => {
    const next = prev.map((n) => ({ ...n }));
    const a = next.find((n) => n.id === sourceId);
    const b = next.find((n) => n.id === targetId);
    if (!a || !b) return prev;

    const tmp = a.orderIndex ?? 0;
    a.orderIndex = b.orderIndex ?? 0;
    b.orderIndex = tmp;

    next.sort((x, y) => (x.orderIndex ?? 0) - (y.orderIndex ?? 0));
    return next;
  });

  try {
    await apiRequest({
      url: `${API_URL}/swap`,
      method: "POST",
      body: { SourceId: sourceId, TargetId: targetId },
      setError,
    });
  } catch (err) {
    console.error("Swap failed:", err);
    // revert
    setNotes((prev) => {
      const next = prev.map((n) => ({ ...n }));
      const a = next.find((n) => n.id === sourceId);
      const b = next.find((n) => n.id === targetId);
      if (a && b) {
        const tmp = a.orderIndex ?? 0;
        a.orderIndex = b.orderIndex ?? 0;
        b.orderIndex = tmp;
        next.sort((x, y) => (x.orderIndex ?? 0) - (y.orderIndex ?? 0));
      }
      setError("Swap failed on server.");
      return next;
    });
  }
}
