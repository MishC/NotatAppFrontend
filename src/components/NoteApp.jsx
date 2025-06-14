import React, { useState, useEffect, useRef } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import Card from "./Card";

export default function NoteApp() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "", folderId: "" });
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const [gridSlots, setGridSlots] = useState([]);
  const [targetNoteId, setTargetNoteId] = useState(null);
  const [error, setError] = useState("");              // ← new

  // API Configurations
  const API_URL = "https://localhost:5001/api/notes";
  const API_URL2 = "https://localhost:5001/api/folders";

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
    fetchNotes();
    fetchFolders();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await fetchWithBrowserAPI(API_URL);
      setNotes(data);
      arrangeGrid(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setError("Error fetching notes:", error, ". Please try again later.")

    }
    setLoading(false);
  };

  const fetchFolders = async () => {
    try {
      const data = await fetchWithBrowserAPI(API_URL2);
      setFolders(data);
    } catch (error) {
      setError("Error fetching folders:", error);
      console.error("Error fetching folders:", error);
    }
  };

  const arrangeGrid = (notesList) => {
    let updatedGrid = [];
    let row = [];

    notesList.forEach((note) => {
      if (note.content && note.content.length > 50) {
        if (row.length === 1) {
          row.push({ id: 0, title: "", content: "" }); //empty slot
        }
        updatedGrid.push([{ ...note, span: 2 }]);
        row = [];
      } else {
        row.push({ ...note, span: 1 });
        if (row.length === 2) {
          updatedGrid.push([...row]);
          row = [];
        }
      }
    });

    if (row.length === 1) {
      row.push({ id: 0, title: "", content: "" });
      updatedGrid.push([...row]);
    }

    const filteredGrid = updatedGrid.filter(row => {
      const isEmptyRow = row.every(note => note.id === 0);
      if (isEmptyRow) {
        console.log("Removing empty row");
      }
      return !isEmptyRow;
    });

    setGridSlots(filteredGrid);
  };



  const handleAddNote = async () => {
    if (!newNote.title.trim() || newNote.title.length < 1 || !newNote.folderId) {
      alert("Title and folder selection are required!");
      setError("Title and folder cannot be empty. Please fill them out.");
      return;
    }
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
      setNewNote({ title: "", content: "", folderId: "" });
      arrangeGrid(updatedNotes);
    } catch (error) {
      console.error("Error adding note:", error);
      setError("Error adding note:", error);
    }
  };

  const handleDeleteNote = async (id) => {
    // if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .catch(error => { setError("Error deleting a note:", error); console.error("Error deleting:", error) });

      setNotes((prevNotes) => {
        const updatedNotes = prevNotes.filter((note) => note.id !== id);
        arrangeGrid(updatedNotes);
        return updatedNotes;
      });
    } catch (error) {
      setError("Error deleting note:", error);
      console.error("Error deleting note:", error);
    }
  };
  const swapNotes = (sourceNoteId, targetNoteId, targetRow, targetCol) => {
    setGridSlots((prevGrid) => {
      if (!sourceNoteId || (targetNoteId === undefined)) {
        console.warn(`Invalid swap attempt: ${sourceNoteId} → ${targetNoteId}`);
        return prevGrid;
      }

      console.log(`Swapping ${sourceNoteId} ↔ ${targetNoteId || "Empty Slot"}`);

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
          console.warn("Target ID is missing in onDrop.");
          return;
        }

        setTimeout(() => {
          swapNotes(source.data.sourceNoteId, targetNoteId);
        }, 50);
      },
    });
  }, [targetNoteId]);
  return (
    <div className=" min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6 mx-auto w-full max-w-8xl overflow-y-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 my-10">📒 Note Board</h1>
      <div className="max-w-xl w-full bg-white p-6 rounded-lg shadow-md my-6">
        <input
          type="text"
          placeholder="Title"
          autoFocus
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          className="
     w-full p-4 my-4

    border-2 border-gray-300 rounded-md

    text-gray-800

    transition-colors duration-200

    focus:outline-none
    focus:border-blue-300    /* same 2px thickness, just recolored */
  "
        />

        <textarea
          placeholder="Content (optional)"
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          className="
    w-full p-4 my-2 mb-4

    border-2 border-gray-300 rounded-md

    text-gray-800

    transition-colors duration-200

    focus:outline-none
    focus:border-blue-300    /* same 2px thickness, just recolored */
  "
        />

        <select
          value={newNote.folderId}
          onChange={(e) => setNewNote({ ...newNote, folderId: e.target.value })}
          className="
 w-full p-4 my-2

    border-2 border-gray-300 rounded-md

    text-gray-800

    transition-colors duration-200

    focus:outline-none
    focus:border-blue-300    /* same 2px thickness, just recolored */
  "
        >
          <option value="" disabled className="text-gray-400">
            Select a folder
          </option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>

        <div className="flex justify-center">
          <button
            onClick={handleAddNote}
            className="mt-10 mb-6  mx-auto bg-blue-500 hover:bg-blue-700 text-white p-5 px-10 font-bold rounded flex items-center"
            style={{ paddingBottom: 0 }} // Remove extra bottom padding
          >
            <span className="text-white font-bold text-2xl mb-5" aria-hidden="true" style={{ lineHeight: 1 }}>+</span>
            <span className="text-lg px-2 mb-5" style={{ lineHeight: 1 }}>&nbsp;&nbsp;Add Note</span>
          </button>
        </div>
      </div>
      {error && (
        <div className="error text-red-600 bg-red-100 p-2 rounded mb-4">
          {error}
        </div>
      )}
      <div className="mt-6">&nbsp;</div>
      {loading ? (
        <p className="text-black m-auto text-8xl">Loading...</p>
      ) : (notes.length === 0 ? (<> </>) : (
        <ul
          ref={listRef}
          className={`mt-6
    flex flex-col gap-4               /* mobile: one-column flex list */
    w-full max-w-full              /* never exceed viewport width */
    overflow-x-hidden overflow-y-auto 
    p-0 rounded-md
     sm:p-4
     md:max-w-6xl
    sm:grid sm:grid-cols-2            /* ≥640px: switch to grid with 2 columns */
    lg:grid-cols-3                   /* ≥1024px: 3 columns */
    xl:grid-cols-4                   /* ≥1280px: 4 columns */
    3xl:grid-cols-5              /* ≥1536px: 5 columns */

    bg-gray-100 
    
  `}
        >

          {gridSlots.map((row, rowIndex) =>
            row.map((note, colIndex) => (
              <Card
                key={`${rowIndex}-${colIndex}`}
                note={note}
                rowIndex={rowIndex}
                colIndex={colIndex}
                onDelete={handleDeleteNote}
                onDrop={swapNotes}
                onHover={setTargetNoteId}
              />
            ))
          )}
        </ul>
      ))}
    </div>
  );
}
