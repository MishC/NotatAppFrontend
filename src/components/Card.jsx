import React, { useEffect, useRef, useState } from "react"; 
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
export default function Card({ note, onDelete }) {
  const noteRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!noteRef.current) return;

    return draggable({
      element: noteRef.current,
      getInitialData: () => ({ type: "note", noteId: note.id }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [note.id]);

  return (
    <li
      ref={noteRef}
      className={`bg-white p-4 rounded-lg shadow-md flex justify-between items-center w-full m-3 cursor-grab 
        ${isDragging ? "opacity-50" : ""}
        ${!note.content || note.content.length < 50 ? "max-w-sm" : "w-full"}`}
    >
      <div className="w-full">
        <h3 className="text-xl font-bold text-black">{note.title}</h3>
        <p className="text-gray-600 text-black text-justify p-5">{note.content}</p>
      </div>
      <div className="flex flex-col items-end">
        <button
          onClick={() => onDelete(note.id)}
          className="bg-red-300 hover:bg-red-400 text-white px-2 py-2 rounded text-sm"
        >
          🗑 
        </button>
      </div>
    </li>
  );
}

