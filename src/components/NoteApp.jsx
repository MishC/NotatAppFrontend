import { useState, useEffect, useRef } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import Card from "./Card";
import Modal from "./Modal";
import Noteform from "./Noteform";

// simple inline icons (no extra libs)
const BagIcon   = (p)=>(<svg viewBox="0 0 24 24" className="w-4 h-4" {...p}><path fill="currentColor" d="M7 7V6a5 5 0 0 1 10 0v1h2a1 1 0 0 1 1 1l-1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 8a1 1 0 0 1 1-1h2zm2 0h6V6a3 3 0 1 0-6 0v1z"/></svg>);
const DotIcon   = (p)=>(<svg viewBox="0 0 24 24" className="w-4 h-4" {...p}><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>);
const BulbIcon  = (p)=>(<svg viewBox="0 0 24 24" className="w-4 h-4" {...p}><path fill="currentColor" d="M9 21h6v-2H9v2zm3-20a7 7 0 0 0-4 12v3h8v-3a7 7 0 0 0-4-12z"/></svg>);
const DraftIcon = (p)=>(<svg viewBox="0 0 24 24" className="w-4 h-4" {...p}><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v13l5-3h11a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></svg>);

export default function NoteApp() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lengthNotes, setLengthNotes] = useState(0);
  const listRef = useRef(null);
  const [gridSlots, setGridSlots] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);

  const [folderOptions, setFolderOptions] = useState([
    { id: null, label: "Work",   key: "work",    icon: <BagIcon/>   },
    { id: 1,    label: "Personal", key: "personal", icon: <DotIcon/>  },
    { id: 2,    label: "Ideas",  key: "ideas",   icon: <BulbIcon/> },
    { id: 3,    label: "Drafts", key: "drafts",  icon: <DraftIcon/>}
  ]);

  const API_URL  = `${window.location.origin}/api/notes`;
  const API_URL2 = `${window.location.origin}/api/folders`;

  const fetchWithBrowserAPI = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      credentials: "include",
      ...options,
    });
    if (!response.ok) {
      setError(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  useEffect(() => { fetchNotes(activeFolder); fetchFolders(); }, []);
  useEffect(() => { fetchNotes(activeFolder); }, [activeFolder]);

  const fetchNotes = async (activeFolder) => {
    setLoading(true);
    try {
      const data = (activeFolder === 4)
        ? await fetchWithBrowserAPI(API_URL + "/done")
        : await fetchWithBrowserAPI(API_URL + "/pending");

      setNotes(data);
      activeFolder===null
        ? setLengthNotes(data.length)
        : setLengthNotes(data.filter(n => n.folderId === activeFolder).length);
      arrangeGrid(data);
    } catch (e) {
      setError("Error fetching notes. Please try again later.");
    }
    setLoading(false);
  };

  const fetchFolders = async () => {
    try {
      const data = await fetchWithBrowserAPI(API_URL2);
      setFolders(data);
      // keep pretty pills but ensure ids exist
      setFolderOptions((pills)=>[
        { id: null, label: "Work",   key:"work",   icon:<BagIcon/> },
        { id: data.find(f=>/personal/i.test(f.name))?.id ?? 1, label:"Personal", key:"personal", icon:<DotIcon/> },
        { id: data.find(f=>/idea/i.test(f.name))?.id ?? 2, label:"Ideas", key:"ideas", icon:<BulbIcon/> },
        { id: data.find(f=>/draft/i.test(f.name))?.id ?? 3, label:"Drafts", key:"drafts", icon:<DraftIcon/> },
      ]);
    } catch (e) {
      setError("Error fetching folders.");
    }
  };

  const arrangeGrid = (notesList) => {
    let updatedGrid = [], row = [];
    notesList.forEach((note) => {
      if (note.content && note.content.length > 120) {
        updatedGrid.push([{ ...note, span: 2 }]);
        row = [];
      } else {
        row.push({ ...note, span: 1 });
        if (row.length === 2) { updatedGrid.push([...row]); row = []; }
      }
    });
    if (row.length === 1) updatedGrid.push([...row]);
    setGridSlots(updatedGrid);
  };

  const handleAddNote = async (newNote) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newNote),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const updated = [...notes, data];
      setNotes(updated);
      arrangeGrid(updated);
      setMsg("Note added!");
    } catch { setError("Error adding note."); }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      fetch(`${API_URL}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } })
        .catch(()=> setError("Error deleting a note."));
      setNotes(prev => {
        const updated = prev.filter(n => n.id !== id);
        arrangeGrid(updated);
        setMsg("Note deleted.");
        return updated;
      });
    } catch { setError("Error deleting note."); }
  };

  const updateNote = async (noteId, updatedFields) => {
    try {
      const res = await fetch(`${API_URL}/${updatedFields.folderId}/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...updatedFields, id: noteId }),
      });
      if (!res.ok) { setError(`HTTP error! status: ${res.status}`); return false; }
      setMsg(`Note "${updatedFields.title}" updated!`);
      fetchNotes(activeFolder);
      setIsModalOpen(false);
      setSelectedNote(null);
      return true;
    } catch { setError("Error updating note."); return false; }
  };

  useEffect(() => {
    if (!listRef.current) return;
    return dropTargetForElements({
      element: listRef.current,
      getData: () => ({ type: "note-list" }),
    });
  }, []);

  const switchModalState = (note) => {
    if (!note) { setIsModalOpen(false); setSelectedNote(null); return; }
    setSelectedNote(note); setIsModalOpen(true);
  };

  useEffect(() => {
    if (!error && !msg) return;
    const t = setTimeout(()=>{ setError(""); setMsg(""); }, 6000);
    return ()=>clearTimeout(t);
  }, [error, msg]);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="max-w-4xl mx-auto px-4 pt-10 pb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Notes</h1>
        <p className="text-gray-500">https://noteappsolutions.com/</p>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Input card */}
        <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6">
          <Noteform folders={folders} handleAddNote={handleAddNote} />
          <div className="h-2" />
          <div className="flex flex-wrap gap-3 pt-5 mt-5 justify-center">
            {folderOptions.map(opt => {
              const active = activeFolder === opt.id;
              const base = "px-4 py-2 rounded-full font-medium inline-flex items-center gap-2 transition";
              const style = active
                ? "text-white bg-blue-600 shadow"
                : ({
                    work: "bg-blue-100 text-blue-800",
                    personal: "bg-green-100 text-green-800",
                    ideas: "bg-rose-100 text-rose-800",
                    drafts: "bg-gray-200 text-gray-700",
                  }[opt.key] || "bg-gray-200 text-gray-700");
              return (
                <button
                  key={opt.key}
                  onClick={() => setActiveFolder(opt.id)}
                  className={`${base} ${style}`}
                >
                  <span className="opacity-90">{opt.icon}</span>{opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* feedback */}
        {error && <div className="text-red-700 bg-red-100 border border-red-200 rounded-lg p-4">{error}</div>}
        {msg &&   <div className="text-green-700 bg-green-100 border border-green-200 rounded-lg p-4">{msg}</div>}

        {/* Notes grid */}
        {loading ? (
          <p className="text-center text-4xl py-16">Loading…</p>
        ) : (
          <ul
            ref={listRef}
            className={`w-full ${lengthNotes<3
              ? "flex flex-col items-stretch gap-4"
              : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"}`}
          >
            {gridSlots
              .map(row => row.filter(n => activeFolder==null || n.folderId===activeFolder))
              .filter(row => row.length>0)
              .map((row,rowIndex)=>
                row.map((note,colIndex)=>(
                  <Card
                    key={`${rowIndex}-${colIndex}`}
                    note={note}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                    onDelete={handleDeleteNote}
                    onUpdate={updateNote}
                    onClick={()=>switchModalState(note)}
                  />
                ))
              )}
          </ul>
        )}
      </main>

      {isModalOpen && selectedNote && (
        <Modal
          selectedNote={selectedNote}
          switchModal={switchModalState}
          updateNote={updateNote}
          folders={folders}
        />
      )}
      <div className="pb-10" />
    </div>
  );
}
