import { useState, useEffect, useRef, use } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import Card from "./Card";
import Modal from "./Modal";
import Noteform from "./Noteform";

export default function NoteApp() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lengthNotes, setLengthNotes] = useState(0);
  const listRef = useRef(null);
  const [gridSlots, setGridSlots] = useState([]);
  const [targetNoteId, setTargetNoteId] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const [folderOptions, setFolderOptions] = useState([
    { id: null, label: "All" } // Default option to show all notes
  ]);

  // API Configurations
  let API_URL = "http://51.20.51.192:5001/api/notes";
  let API_URL2 = "http://51.20.51.192:5001/api/folders";



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
    try {
      fetchNotes(activeFolder);
      fetchFolders();
    }
    catch (error) {
      API_URL = "http://localhost:5001/api/notes"; // Fallback to local API
      API_URL2 = "http://localhost:5001/api/folders"; // Fallback to local API
      fetchNotes(activeFolder);
      fetchFolders();
    }
  }, []);

  useEffect(() => { fetchNotes(activeFolder); }, [activeFolder]);

  const fetchNotes = async (activeFolder) => {
    setLoading(true);
    try {

      const data =
        (activeFolder === 4) ? await fetchWithBrowserAPI(API_URL + "/done") : await fetchWithBrowserAPI(API_URL + "/pending");



      data&& setNotes(data);
      activeFolder===null?setLengthNotes(data.length):setLengthNotes(data.filter(note => note.folderId === activeFolder).length);
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
    let updatedGrid = [];
    let row = [];

    notesList.forEach((note) => {
      if (note.content && note.content.length > 50) {
        updatedGrid.push([{ ...note, span: 2 }]); //span 2 cols for long content
        row = [];
      } else {
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




  return (
    <div className=" min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6 
       mx-auto w-full max-w-full overflow-y-auto">
      <h1 className="text-6xl font-bold text-gray-800 mb-6 my-10">📒 Note Board</h1>
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
          <div className="flex justify-center gap-6 m-6 text-xl">
            {folderOptions.map(opt => (
              <button
                key={opt.id ?? "all"}
                onClick={() => setActiveFolder(opt.id)}
                className={`px-10 py-4 rounded-full  font-semibold transition
                  ${activeFolder === opt.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-blue-100"}
                  `} >{opt.label} </button>
            ))}
          </div>

          <ul
            ref={listRef}
            className={`mt-6 w-full max-w-full overflow-x-hidden overflow-y-auto
    p-0 rounded-md sm:p-4 md:max-w-7xl bg-gray-100
    ${(lengthNotes<3)
                ? "flex flex-col items-center justify-center min-h-[20vh] gap-4"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-4"
              }`
            }
          >
            {gridSlots
              .map(row => row.filter(note =>
                !activeFolder || note.folderId === activeFolder
              ))
              .filter(row => row.length > 0).map((row, rowIndex) =>
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
