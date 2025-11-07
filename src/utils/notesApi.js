// src/utils/notesApi.js
export function createNotesApi({
  API_URL,
  API_URL2,
  notes,
  setNotes,
  setFolders,
  setFolderOptions,
  setLoading,
  setLengthNotes,
  setError,
  setMsg,
  selectedNote,
  setSelectedNote,
  setIsModalOpen,
  activeFolder,
}) {
  const fetchWithBrowserAPI = async (url, options = {}) => {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      credentials: "include",
      ...options,
    });

    if (!res.ok) {
      setError(`HTTP error! status: ${res.status}`);
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    if (res.status === 204) return null;

    const text = await res.text();
    return text ? JSON.parse(text) : null;
  };

  const fetchNotes = async (af) => {
    setLoading(true);
    try {
      const data =
        af === 4
          ? await fetchWithBrowserAPI(API_URL + "/done")
          : await fetchWithBrowserAPI(API_URL + "/pending");

      if (data) setNotes(data);
      setLengthNotes(
        af === null
          ? data.length
          : data.filter((note) => note.folderId === af).length
      );
    } catch (error) {
      console.error("Error fetching notes:", error);
      setError("Error fetching notes. Please try again later.");
    }
    setLoading(false);
  };

  const fetchFolders = async () => {
    try {
      const data = await fetchWithBrowserAPI(API_URL2);
      setFolders(data || []);
      setFolderOptions([
        { id: null, label: "All" },
        ...(data || []).map((folder) => ({
          id: folder.id,
          label: folder.name,
        })),
      ]);
    } catch (error) {
      setError("Error fetching folders.");
      console.error("Error fetching folders:", error);
    }
  };

  const handleAddNote = async (newNote) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newNote),
      });
      if (!response.ok) {
        setError(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const updatedNotes = [...(notes || []), data];
      setNotes(updatedNotes);
      setMsg("Note added.");
    } catch (error) {
      console.error("Error adding note:", error);
      setError("Error adding note.");
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }).catch((error) => {
        setError("Error deleting a note.");
        console.error("Error deleting:", error);
      });

      setNotes((prevNotes) => {
        const updatedNotes = prevNotes.filter((note) => note.id !== id);
        setMsg(`Note deleted successfully.`);
        return updatedNotes;
      });
    } catch (error) {
      setError("Error deleting note.");
      console.error("Error deleting note:", error);
    }
  };

  const updateNote = async (noteId, updatedFields) => {
    try {
      const response = await fetch(
        `${API_URL}/${updatedFields.folderId}/${noteId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...selectedNote,
            ...updatedFields,
            id: noteId,
            folderId: updatedFields.folderId,
            title: updatedFields.title,
            content: updatedFields.content,
          }),
        }
      );
      if (!response.ok) {
        setError(`HTTP error! status: ${response.status}`);
        return false;
      }
      setMsg(`Note "${updatedFields.title}" updated successfully!`);
      await fetchNotes(activeFolder);
      setIsModalOpen(false);
      setSelectedNote(null);
      return true;
    } catch (error) {
      setError("Error updating note.");
      return false;
    }
  };

  const swapNotes = async (sourceId, targetId) => {
    // optimistic swap
    setNotes((prev) => {
      const next = prev.map((n) => ({ ...n }));
      const a = next.find((n) => n.id === sourceId);
      const b = next.find((n) => n.id === targetId);
      if (!a || !b) return prev;

      const temp = a.orderIndex ?? 0;
      a.orderIndex = b.orderIndex ?? 0;
      b.orderIndex = temp;

      next.sort((x, y) => (x.orderIndex ?? 0) - (y.orderIndex ?? 0));
      return next;
    });

    // persist
    try {
      await fetch(`${API_URL}/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ SourceId: sourceId, TargetId: targetId }),
      });
    } catch (err) {
      // revert on failure
      setNotes((prev) => {
        const next = prev.map((n) => ({ ...n }));
        const a = next.find((n) => n.id === sourceId);
        const b = next.find((n) => n.id === targetId);
        if (a && b) {
          const temp = a.orderIndex ?? 0;
          a.orderIndex = b.orderIndex ?? 0;
          b.orderIndex = temp;
          next.sort((x, y) => (x.orderIndex ?? 0) - (y.orderIndex ?? 0));
        }
        setError("Swap failed on server.");
        return next;
      });
    }
  };

  return {
    fetchWithBrowserAPI,
    fetchNotes,
    fetchFolders,
    handleAddNote,
    handleDeleteNote,
    updateNote,
    swapNotes,
  };
}
