import React from "react";
import { useState } from "react";

export default function Modal({ selectedNote, switchModal  }  ) { 
    const updateNote = async (ID) => {
    try {
      const response = await fetch(`${API_URL}/${selectedNote.id}/${folderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ folderId }),
      });
      if (!response.ok) {
        setError(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (response.status === 204) {
        setMsg(`Note "${title}" is done!`);
        fetchNotes();
        return;
      }
    } catch (error) {
      setError("Error updating note.");
      console.error("Error updating note:", error);
    }
  };
    return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
        onClick={() => switchModal(null)}
        aria-label="Close"
      >
        ×
      </button>
      <h2 className="text-2xl font-bold mb-4">Edit Note</h2>
      <input
        type="text"
        className="w-full mb-3 p-2 border border-gray-300 rounded"
        value={selectedNote.title}
        onChange={e =>
          setSelectedNote({ ...selectedNote, title: e.target.value })
        }
      />
      <textarea
        className="w-full mb-3 p-2 border border-gray-300 rounded"
        value={selectedNote.content}
        onChange={e =>
          setSelectedNote({ ...selectedNote, content: e.target.value })
        }
      />
      <div className="flex justify-end">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          onClick={() => {
            // save changes here
            // (e.g., call your API, update state)
            setIsModalOpen(false);
          }}
        >
          Save
        </button>
        <button
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
          onClick={() => setIsModalOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
    );

}