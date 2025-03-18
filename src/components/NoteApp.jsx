import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
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

  // API Configurations
  const API_URL = "https://localhost:5001/api/notes"; 
  const API_URL2 = "https://localhost:5001/api/folders";
  
  const axiosInstance = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" }, withCredentials: true });

  useEffect(() => {
    fetchNotes();
    fetchFolders();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/");
      setNotes(response.data);
      arrangeGrid(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
    setLoading(false);
  };

  const fetchFolders = async () => {
    try {
      const response = await axios.get(API_URL2);
      setFolders(response.data);
    } catch (error) {
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
        console.log("🗑️ Removing empty row");
      }
      return !isEmptyRow; 
    });
  
    setGridSlots(filteredGrid);
  };
  
  

  const handleAddNote = async () => {
    if (!newNote.title.trim() || newNote.title.length < 3 || !newNote.folderId) {
      alert("Title and folder selection are required, with at least 3 characters in the title.");
      return;
    }
    try {
      const response = await axios.post(API_URL, newNote);
      const updatedNotes = [...notes, response.data];
      setNotes(updatedNotes);
      setNewNote({ title: "", content: "", folderId: "" });
      arrangeGrid(updatedNotes);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setNotes((prevNotes) => {
        const updatedNotes = prevNotes.filter((note) => note.id !== id);
        arrangeGrid(updatedNotes);
        return updatedNotes;
      });
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };
  const swapNotes = (sourceNoteId, targetNoteId, targetRow, targetCol) => {
    setGridSlots((prevGrid) => {
      if (!sourceNoteId || (targetNoteId === undefined)) {
        console.warn(`⚠️ Invalid swap attempt: ${sourceNoteId} → ${targetNoteId}`);
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
        console.warn("⚠️ Source position not found!");
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
          console.warn("Target ID is missing in onDrop.");
          return;
        }
  
        console.log(`Swapping: ${source.data.sourceNoteId} ↔ ${targetNoteId}`);
  
        setTimeout(() => {
          swapNotes(source.data.sourceNoteId, targetNoteId);
        }, 50); 
      },
    });
  }, [targetNoteId]);
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4 mx-auto w-full max-w-4xl overflow-y-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">📒 Note App</h1>
      <div className="max-w-lg bg-white p-6 rounded-lg shadow-md my-6">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-3 mb-3 border rounded-md text-black focus:outline-none focus:ring focus:ring-blue-300 my-2"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
        />
        <textarea
          placeholder="Content (optional)"
          className="w-full p-3 mb-3 border rounded-md text-black focus:outline-none focus:ring focus:ring-blue-300"
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
        />
        <select
          className="w-full p-2 mb-6 border rounded-md focus:outline-none focus:ring focus:ring-gray-300 text-black bg-white"
          value={newNote.folderId}
          onChange={(e) => setNewNote({ ...newNote, folderId: e.target.value })}
        >
          <option value="" disabled className="text-gray-200">Select a folder</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>{folder.name}</option>
          ))}
        </select>
        <div className="flex justify-center">
          <button onClick={handleAddNote} className="my-5 w-50 mx-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded">➕ &nbsp; Add Note</button>
        </div>
      </div>
      {loading ? (
        <p className="text-black">Loading...</p>
      ) : (
        <ul ref={listRef} className="grid grid-cols-2 gap-4 p-4 w-full max-w-2xl bg-white shadow-md rounded-md">
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
      )}
    </div>
  );
}
