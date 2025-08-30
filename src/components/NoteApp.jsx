import { useState, useEffect, useRef } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import Card from "./Card";
import Modal from "./Modal";
import Noteform from "./Noteform";
import KanbanNoteIcon from "./Kanban";

export default function NoteApp() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lengthNotes, setLengthNotes] = useState(0);
  const listRef = useRef(null);
  const [gridSlots, setGridSlots] = useState([]);
  const [targetNoteId] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const [folderOptions, setFolderOptions] = useState([
    { id: null, label: "All" } // Default option to show all notes
  ]);

  // API Configurations
  //const isLocalhost = window.location.origin.includes("localhost");
  // const API_URL = isLocalhost ? "http://localhost:5001/api/notes" : "/api/notes";
  // const API_URL2 = isLocalhost ? "http://localhost:5001/api/folders" : "/api/folders";
  const API_URL = `${window.location.origin}/api/notes`;
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

  useEffect(() => {

    fetchNotes(activeFolder);
    fetchFolders();
  }, []);

  useEffect(() => { fetchNotes(activeFolder); }, [activeFolder]);

  const fetchNotes = async (activeFolder) => {
    setLoading(true);
    try {

      const data =
        (activeFolder === 4) ? await fetchWithBrowserAPI(API_URL + "/done") : await fetchWithBrowserAPI(API_URL + "/pending");



      data && setNotes(data);
      activeFolder === null ? setLengthNotes(data.length) : setLengthNotes(data.filter(note => note.folderId === activeFolder).length);
      arrangeGrid(data);

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
        ...data.map(folder => ({
          id: folder.id,
          label: folder.name
        }))
      ]);
    } catch (error) {
      setError("Error fetching folders.");
      console.error("Error fetching folders:", error);
    }
  };

  // ArrangeGrid function to create a grid layout based on note content length
  const arrangeGrid = (notesList) => {
  if (!Array.isArray(notesList)) {
    setGridSlots([]);
    return;
  }

  // clean nuull/undefined/unvalid objects
  const clean = notesList.filter(n => n && typeof n === "object");

  const updatedGrid = [];
  let row = [];

  clean.forEach((note) => {
    const len = note?.content?.length ?? 0;

    if (len > 50) {
      // long note content
      updatedGrid.push([{ ...note, span: 2 }]);
      row = [];
    } else {
      // short note content
      row.push({ ...note, span: 1 });
      if (row.length === 2) {
        updatedGrid.push([...row]);
        row = [];
      }
    }
  });

    // If there's an incomplete row (just one note left), just add it as a row of one 
    if (row.length === 1) {
      updatedGrid.push([...row]);
    }

    setGridSlots(updatedGrid);
  };

  //HandleAddNote function to add a new note, passed to the Noteform component
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
      arrangeGrid(updatedNotes);
    } catch (error) {
      console.error("Error adding note:", error);
      setError("Error adding note.");
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
        .catch(error => { setError("Error deleting a note."); console.error("Error deleting:", error) });

      setNotes((prevNotes) => {
        const updatedNotes = prevNotes.filter((note) => note.id !== id);
        arrangeGrid(updatedNotes);
        setMsg(`Note deleted successfully.`);
        return updatedNotes;
      });
    } catch (error) {
      setError("Error deleting note.");
      console.error("Error deleting note:", error);
    }
  };

  // Update note function in modal
  const updateNote = async (noteId, updatedFields) => {
    // updatedFields = { title, content, folderId }
    try {
      const response = await fetch(`${API_URL}/${updatedFields.folderId}/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...selectedNote,
          ...updatedFields,
          id: noteId, // C# expects an ID in the body
          folderId: updatedFields.folderId,
          title: updatedFields.title,
          content: updatedFields.content,
        }),
      });
      if (!response.ok) {
        setError(`HTTP error! status: ${response.status}`);
        return false;
      }
      // Success: reload notes, close modal, show message
      setMsg(`Note "${updatedFields.title}" updated successfully!`);
      fetchNotes();
      setIsModalOpen(false);
      setSelectedNote(null);
      return true;
    } catch (error) {
      setError("Error updating note.");
      return false;
    }
  };

  //
  useEffect(() => {
    if (!listRef.current) return;
    return dropTargetForElements({
      element: listRef.current,
      getData: () => ({ type: "note-list" }),
      onDrop: ({ source }) => {
        if (!source?.data?.sourceNoteId) {
          console.warn("Source ID is missing in onDrop.");
          return;
        }
        if (!targetNoteId) {
          setError("Target ID is missing. Please hover over a valid slot.");
          return;
        }
        setTimeout(() => {
          swapNotes(source.data.sourceNoteId, targetNoteId);
        }, 50);
      },
    });
  }, [targetNoteId]);

  //Open and close modal
  const switchModalState = (note) => {
    if (!note) {
      setIsModalOpen(false);
      setSelectedNote(null);
      return;
    }
    setSelectedNote(note);
    setIsModalOpen(true);
    // return;

  };

  // Swap logic
  const swapNotes = (sourceNoteId, targetNoteId, targetRow, targetCol) => {
    setGridSlots((prevGrid) => {
      if (!sourceNoteId || (targetNoteId === undefined)) {
        console.warn(`Invalid swap attempt: ${sourceNoteId} → ${targetNoteId}`);
        return prevGrid;
      }

      let newGrid = prevGrid.map(row => row.map(note => ({ ...note })));

      let sourcePos = null;
      let targetPos = { row: targetRow, col: targetCol };

      newGrid.forEach((row, rowIndex) => {
        row.forEach((note, colIndex) => {
          if (note.id === sourceNoteId) {
            sourcePos = { row: rowIndex, col: colIndex };
          }
        });
      });

      if (!sourcePos) {
        console.warn("Source position not found!");
        return prevGrid;
      }

      [newGrid[sourcePos.row][sourcePos.col], newGrid[targetPos.row][targetPos.col]] =
        [newGrid[targetPos.row][targetPos.col], newGrid[sourcePos.row][sourcePos.col]];

      return newGrid;
    });
  };


  // Clear error and message after 10 seconds

  useEffect(() => { setTimeout(() => { setError(""), setMsg("") }, 10000); }, [error.length > 1, msg.length > 1]);



///////////////////////###############################
//////////////////  Return  ###################################
  return (
    <div className=" min-h-screen flex flex-col justify-center items-center 
 background: #ADA996;  /* fallback for old browsers */
background: -webkit-linear-gradient(to bottom, #EAEAEA, #DBDBDB, #F2F2F2, #ADA996);  /* Chrome 10-25, Safari 5.1-6 */
background: linear-gradient(to bottom, #EAEAEA, #DBDBDB, #F2F2F2, #ADA996); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */


    p-6 mx-auto w-full max-w-full overflow-y-auto">
      <div className="w-full md:max-w-7xl mx-auto px-5 mt-6 mb-10">
        <div className="flex items-center gap-4 justify-center text-center">
          <KanbanNoteIcon className="text-blue-600 text-center" />
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-800 text-center">
            Note Board
          </h1>
        </div>
        <p className="mt-2 text-slate-500 text-lg">
          Organize your notes like cards on a board.
        </p>

        {/* subtle divider under header */}
        <div className="mt-4 h-px w-full bg-gradient-to-r from-slate-200 via-slate-200/60 to-transparent" />
      </div>

      <Noteform folders={folders} handleAddNote={handleAddNote} />
      {error && (
        <div className="error text-red-600 bg-red-100 mt-10 p-10 rounded mb-4 text-2xl">
          {error}
        </div>
      )}
      {msg && (
        <div className="msg text-green-600 bg-green-100 mt-10 p-10 rounded mb-4 text-2xl">
          {msg}
        </div>
      )}
      <div className="mt-6">&nbsp;</div>
      {loading ? (
        <p className="text-black m-auto text-8xl">Loading...</p>
      ) : (notes.length === 0 ? (<> </>) : (
        <>
     <div className="w-full max-w-full md:max-w-7xl mx-auto mt-6 px-6">
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
            : "text-slate-600 hover:text-blue-600",
        ].join(" ")}
      >
        {opt.label}
      </button>
    ))}
  </div>

  {/* Notes grid as white paper*/}
 <ul
  ref={listRef}
  className={[
    "w-full md:max-w-7xl mx-auto px-5",              // same width as cards
    "bg-white rounded-2xl border border-slate-200 shadow-sm",
    "overflow-x-hidden overflow-y-auto",
    "py-6",                                           // breathing room
    lengthNotes < 1
      ? "flex flex-col items-center justify-center min-h-[40vh] gap-6"
      : [
          "grid gap-6 min-h-[50vh]",                 
          "justify-center place-content-center",       // center the grid area
          "justify-items-center",                     // center items in columns
          "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]", // ✅ auto-fit & centered last row
        ].join(" ")
  ].join(" ")}
>
  {gridSlots
    .map(row => row.filter(note => note && (!activeFolder || note.folderId === activeFolder)))
    .filter(row => row.length > 0)
    .flatMap((row, rowIndex) =>
      row.map((note, colIndex) => (
        <Card
          key={`${rowIndex}-${colIndex}`}
          note={note}
          rowIndex={rowIndex}
          colIndex={colIndex}
          onDelete={handleDeleteNote}
          onUpdate={updateNote}
          onDrop={swapNotes}
          onClick={() => switchModalState(note)}
        />
      ))
    )}
</ul>

</div>

        </>
      ))}
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
