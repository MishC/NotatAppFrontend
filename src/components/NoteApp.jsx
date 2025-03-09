import React, { useState, useEffect, useRef, use } from "react";
import axios from "axios";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import Card from "./Card";

export default function NoteApp() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "", folderId: "" });
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const [targetNoteId, setTargetNoteId] = useState(null); // ✅ Track target dynamically

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

  const handleAddNote = async () => {
    if (!newNote.title.trim() || newNote.title.length < 3 || !newNote.folderId) {
      alert("Title and folder selection are required, with at least 3 characters in the title.");
      return;
    }
    try {
      const response = await axios.post(API_URL, newNote);
      setNotes([...notes, response.data]);
      setNewNote({ title: "", content: "", folderId: "" });
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const swapNotes = (sourceNoteId, targetNoteId) => {
    setNotes((prevNotes) => {
      if (!sourceNoteId || !targetNoteId || sourceNoteId === targetNoteId) {
        console.warn(`Invalid swap attempt: sourceNoteId=${sourceNoteId} → targetNoteId=${targetNoteId}`);
        return prevNotes;
      }
  
      const sourceIndex = prevNotes.findIndex((n) => n.id === sourceNoteId);
      const targetIndex = prevNotes.findIndex((n) => n.id === targetNoteId);
  
      if (sourceIndex === -1 || targetIndex === -1) {
        console.warn(`Invalid indexes: sourceIndex=${sourceIndex}, targetIndex=${targetIndex}`);
        return prevNotes;
      }
  
      console.log(`Swapping: sourceNoteId=${sourceNoteId} <-> targetNoteId=${targetNoteId}`);
  
      const updatedNotes = [...prevNotes];
      [updatedNotes[sourceIndex], updatedNotes[targetIndex]] = [
        updatedNotes[targetIndex],
        updatedNotes[sourceIndex],
      ];
  
      return updatedNotes;
    });
  };
  
  
  useEffect(() => {
    if (!listRef.current) return;
  
    return dropTargetForElements({
      element: listRef.current,
      getData: () => ({ type: "note-list" }),
      onDrop: ({ source }) => {
  
        if (source && targetNoteId) {
          console.log(`Attempting to swap: Dragged ${source.noteId} → Target ${targetNoteId}`);
          swapNotes(source.noteId, targetNoteId);
        } else {
          console.warn("Swap failed: Source or target missing!");
        }
      },
    });
  }, [targetNoteId]);
  
  

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4 mx-auto w-full max-w-4xl">
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
          <button onClick={handleAddNote} className="my-5 w-50 mx-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded">➕ &nbsp; Add Note</button>
        </div>
      </div>
      {loading ? <p className="text-black">Loading...</p> : (
        <ul ref={listRef} className="overflow-y-auto space-y-4 flex flex-row flex-wrap justify-center p-3 fit-content">
          {notes.map((note) => (
             <Card
             key={note.id}
             note={note}
             onDelete={handleDeleteNote}
             onSwap={swapNotes}
             setTargetNoteId={setTargetNoteId} // ✅ Pass target tracking function
           />
          ))}
        </ul>
      )}
    </div>
  );
}
