// src/NoteApp.jsx
import { useState, useEffect, useMemo } from "react";
import { createNotesApi } from "../utils/notesApi";
import Header from "./Header";

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

  // Build the API object; 
  const api = useMemo(
    () =>
      createNotesApi({
        API_URL,
        API_URL2,
        notes,
        setNotes,
        folders,
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
        
      }),
    // Recreate when these change to avoid stale closures:
    [API_URL, API_URL2, notes, folders, selectedNote, activeFolder]
  );

  // Initial load
  useEffect(() => {
    (async () => {
      await api.fetchNotes(activeFolder);
      await api.fetchFolders();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch notes when active folder changes
  useEffect(() => {
    api.fetchNotes(activeFolder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFolder]);

  // Auto-clear messages
  useEffect(() => {
    const t = setTimeout(() => {
      setError("");
      setMsg("");
    }, 10000);
    return () => clearTimeout(t);
  }, [error, msg]);

  const switchModalState = (note) => {
    if (!note) {
      setIsModalOpen(false);
      setSelectedNote(null);
      return;
    }
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleFolderClick = (opt) => {
    setActiveFolder(opt.id);
  };

  return (
    <div className="relative min-h-screen w-full p-6">
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(10.9deg, rgb(240, 213, 190) 8.1%, rgb(249, 240, 206) 16.5%, rgb(253, 244, 210) 27.3%, rgb(222, 248, 226) 85.2%, rgb(200, 247, 242) 100%)",
        }}
      />

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
        <Noteform folders={folders} handleAddNote={api.handleAddNote} />
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
        <div className="w-full w-min-[60%] md:max-w-7xl mx-auto mt-6 px-6">
          <div className="inline-flex w-full rounded-t-xl border border-slate-300 bg-slate-100 p-1 shadow-inner">
            {folderOptions.map((opt) => (
              <button
                key={opt.id ?? "all"}
                onClick={() => handleFolderClick(opt)}
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

          <ul
            className={[
              "w-full max-w-7xl min-w-[60%]",
              "mx-auto bg-white rounded-b-2xl",
              "py-6 px-5",
              // grid layout
              "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
              "gap-6",
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
                  onDelete={api.handleDeleteNote}
                  onUpdate={api.updateNote}
                  onDrop={api.swapNotes}
                  onClick={() => switchModalState(note)}
                />
              ))}
          </ul>
        </div>
      )}
 user? <Header userName={user.name} onLogout={handleLogout} />:<></>


      {isModalOpen && selectedNote && (
        <Modal
          selectedNote={selectedNote}
          switchModal={switchModalState}
          updateNote={api.updateNote}
          folders={folders}
        />
      )}
    </div>
  );
}
