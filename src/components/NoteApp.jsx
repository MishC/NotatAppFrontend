import { useState, useEffect } from "react";
import Card from "./Card";
import Modal from "./Modal";
import Noteform from "./Noteform";
import KanbanNoteIcon from "./Kanban";

export default function NoteApp() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lengthNotes, setLengthNotes] = useState(0);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const [folderOptions, setFolderOptions] = useState([
    { id: null, label: "All" },
  ]);

  const API_URL = `${window.location.origin}/api/notes`;
  const API_URL2 = `${window.location.origin}/api/folders`;

  useEffect(() => {
    async function fetchAll() {
      await fetchNotes(activeFolder);
      await fetchFolders();
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchNotes(activeFolder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFolder]);

  useEffect(() => {
    const t = setTimeout(() => {
      setError("");
      setMsg("");
    }, 10000);
    return () => clearTimeout(t);
  }, [error, msg]);

  // Generic fetch
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

  // Fetch notes
  const fetchNotes = async (activeFolder) => {
    setLoading(true);
    try {
      const data =
        activeFolder === 4
          ? await fetchWithBrowserAPI(API_URL + "/done")
          : await fetchWithBrowserAPI(API_URL + "/pending");

      if (data) setNotes(data);
      setLengthNotes(
        activeFolder === null
          ? data.length
          : data.filter((note) => note.folderId === activeFolder).length
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
      setFolders(data);
      setFolderOptions([
        { id: null, label: "All" },
        ...data.map((folder) => ({
          id: folder.id,
          label: folder.name,
        })),
      ]);
    } catch (error) {
      setError("Error fetching folders.");
      console.error("Error fetching folders:", error);
    }
  };

  // Add
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
      const updatedNotes = [...notes, data];
      setNotes(updatedNotes);
      setMsg("Note added.");
    } catch (error) {
      console.error("Error adding note:", error);
      setError("Error adding note.");
    }
  };

  // Delete
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

  // Update (modal)
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

  // Swap notes (DnD) – zostáva
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

  const switchModalState = (note) => {
    if (!note) {
      setIsModalOpen(false);
      setSelectedNote(null);
      return;
    }
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full p-6">
      {/* pozadie */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#EAEAEA] via-[#DBDBDB] to-[#ADA996]" />

      <div className="w-full md:max-w-7xl mx-auto px-5 mt-6 mb-10">
        <div className="flex items-center gap-4 justify-center text-center">
          <KanbanNoteIcon className="text-blue-600 text-center" />
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-800 text-center">
            Note Board
          </h1>
        </div>
        <p className="mt-2 text-slate-600 text-lg text-center">
          Organize your notes like cards on a board.
        </p>
        <div className="mt-4 h-px w-full bg-gradient-to-r from-slate-200 via-slate-200/60 to-transparent" />
      </div>

      <div className="mb-20">
        <Noteform folders={folders} handleAddNote={handleAddNote} />
      </div>

      {error && (
        <div className="error text-red-700 bg-red-50 mt-8 p-4 rounded-xl mb-4 text-base border border-red-200">
          {error}
        </div>
      )}
      {msg && (
        <div className="msg text-emerald-700 bg-emerald-50 mt-8 p-4 rounded-xl mb-4 text-base border border-emerald-200">
          {msg}
        </div>
      )}

      {loading ? (
        <p className="text-slate-800 mx-auto text-3xl text-center py-16">
          Loading...
        </p>
      ) : notes.length === 0 ? (
        <></>
      ) : (
        <div className="w-full md:max-w-7xl mx-auto mt-6 px-6">
          {/* Folder menu */}
          <div className="inline-flex w-full rounded-t-xl border border-slate-300 bg-slate-100 p-1 shadow-inner">
            {folderOptions.map((opt) => (
              <button
                key={opt.id ?? "all"}
                onClick={() => setActiveFolder(opt.id)}
                className={[
                  "flex-1 px-6 py-4 text-2xl font-semibold rounded-lg transition",
                  activeFolder === opt.id
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-slate-700 hover:text-blue-600",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Masonry: žiadne prekrytie, výška rastie automaticky */}
          <ul
            className={[
              "w-full mx-auto bg-white rounded-b-2xl border border-slate-2 00 shadow-sm",
              "py-6 px-5",
              // multi-column layout
              "columns-1 sm:columns-2 xl:columns-3 2xl:columns-4",
              "gap-6", // medzera medzi kolónami
            ].join(" ")}
          >
            {notes
              .filter(
                (note) =>
                  note && (activeFolder == null || note.folderId === activeFolder)
              )
              .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
              .map((note, idx) => (
                <Card
                  key={note.id}
                  note={note}
                  rowIndex={Math.floor(idx / 4)}
                  colIndex={idx % 4}
                  onDelete={handleDeleteNote}
                  onUpdate={updateNote}
                  onDrop={swapNotes}
                  onClick={() => switchModalState(note)}
                />
              ))}
          </ul>
        </div>
      )}

      {isModalOpen && selectedNote && (
        <Modal
          selectedNote={selectedNote}
          switchModal={switchModalState}
          updateNote={updateNote}
          folders={folders}
        />
      )}
    </div>
  );
}
