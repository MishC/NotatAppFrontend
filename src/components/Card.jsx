import  { useEffect, useRef, useState } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

export default function Card({ note, rowIndex, colIndex, onDelete, onUpdate, onDrop, onClick }) {
  const noteRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [folderId, setFolderId] = useState(note.folderId || "");



  useEffect(() => {
    if (!noteRef.current) return;

    const dropConfig = dropTargetForElements({
      element: noteRef.current,
      getData: () => ({
        type: "note-slot",
        targetNoteId: note.id,
        rowIndex,
        colIndex
      }),
      onDrop: ({ source }) => {
        if (!source?.data?.sourceNoteId || source.data.sourceNoteId === note.id) return;
        onDrop(source.data.sourceNoteId, note.id, rowIndex, colIndex);
      },
    });

    const dragConfig = draggable({
      element: noteRef.current,
      getInitialData: () => ({
        type: "note",
        sourceNoteId: note.id,
        rowIndex,
        colIndex
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });

    const cleanup = combine(dragConfig, dropConfig);
    return () => cleanup();
  }, [note.id, rowIndex, colIndex, onDrop]);

  return (
    <li
      ref={noteRef}
      key={note.id}
      onClick={onClick}
      className={`flex flex-col bg-white rounded-xl shadow-lg border-4 border-dashed border-white p-6 m-3 min-w-0
        ${isDragging ? "opacity-50" : "cursor-grab"}
        ${note.span === 2 ? "sm:col-span-2" : ""}
        cursor-pointer hover:shadow-lg transition duration-150 ease-in-out
      `}
    >
      {/* Header row: Title and action buttons */}
      <div className="flex items-center gap-2 mb-3 min-w-0">
        <h3
          className="text-2xl font-extrabold text-black truncate flex-grow min-w-0"
          title={note.title}
        >
          {note.title}
        </h3>
        <button
          onClick={(e) => {e.stopPropagation();setFolderId(4);onUpdate(note.id,{...note, folderId: 4})}}
          className="ml-2 bg-gradient-to-r from-green-400 to-teal-400 hover:from-green-500 hover:to-teal-500 text-white
          font-bold rounded-md transition duration-150 ease-in-out 
          hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-300
          flex items-center justify-center
          w-14 aspect-[2/1]   // 2:1 ratio
          text-2xl"
          aria-label="Mark complete"
          title="Mark complete"
        >
          ✓
        </button>
        <button
          onClick={(e) => {e.stopPropagation();onDelete(note.id, note.title)}}
          className="ml-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white
    font-bold rounded-md transition duration-150 ease-in-out hover:scale-110
    focus:outline-none focus:ring-2 focus:ring-red-400
    flex items-center justify-center
    w-14 aspect-[2/1]   // 2:1 ratio
    text-2xl"
          aria-label="Delete note"
          title="Delete note"
        >
          ×
        </button>
      </div>
      {/* Content */}
      {note.content && note.content.length > 1 && (
        <p className="mt-2 text-gray-700 text-justify border border-gray-200 bg-amber-50 p-4 rounded-lg break-words">
          {note.content}
        </p>
      )}
    </li>
  );
}
