import React, { useState, useEffect } from "react";
import axios from "axios";

export default function NoteApp() {
  //const API_URL = "http://localhost:5152/api/notes"; 
  const API_URL = "https://localhost:5001/api/notes"; 
  const API_URL2 = "https://localhost:5001/api/folders";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Allows cookies & sessions
});
const axiosInstance2 = axios.create({
  baseURL: API_URL2,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Allows cookies & sessions
});

  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "", folderId:""});
  const [loading, setLoading] = useState(false);

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
    if (!newNote.title.trim()) {
      alert("Title is required!");
      return;
    }
    if (!newNote.folderId) {
      alert("Please select a folder!");
      return;
    }
    if (!newNote.content.trim().length>500) {
      alert("Max number of characters are 500!");
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
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };


  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4 mx-auto w-full max-w-4xl">
    <h1 className="text-4xl font-bold text-gray-800 mb-6">📒 Note App</h1>

      {/* New Note Form */}
      <div className=" max-w-lg bg-white p-6 rounded-lg shadow-md my-6">
         {/* <h2 className="text-2xl font-semibold mb-4 text-black">Add a Note</h2>*/}

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
         {/* Folder Selection Dropdown */}
        <select
          className="w-full p-2 mb-6 border rounded-md focus:outline-none focus:ring focus:ring-gray-300 text-black bg-white"
          value={newNote.folderId}
          onChange={(e) => setNewNote({ ...newNote, folderId: e.target.value })}
        >
          <option value="" disabled className="text-gray-200">
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
          className=" my-5 w-50 mx-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
        >
          ➕ &nbsp; Add Note
        </button></div>
      </div>

      {/* Notes List */}
      {loading ? (
        <p className="text-black">Loading...</p>
      ) : (
        <div className="w-full">
          {notes.length === 0 ? (
            <p className="text-gray-500 text-black">No notes found.</p>
          ) : (
            <ul className="space-y-4 flex flex-row flex-wrap justify-center p-3">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="bg-white p-4 m-4 rounded-lg shadow-md flex justify-between items-center w-full max-w-sm"
                >
                  <div className="w-full">
                    <h3 className="text-xl font-bold text-black">{note.title}</h3>
                    <p className="text-gray-600 text-black text-justify p-5">{note.content}</p>
                  </div>
                  <div className="flex flex-col items-end mt-0 justify-end h-full">
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="bg-red-300 transparent hover:bg-red-400 text-white px-2 py-2 rounded justify-bottom text-sm"
                  >
                    🗑 
                  </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
