import React, { useEffect, useRef, useState } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

export default function Card({ note, onDelete, onSwap, setTargetNoteId }) {
  const noteRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!noteRef.current) return;

    return combine(
      draggable({
        element: noteRef.current,
        getInitialData: () => {
          console.log(`Setting drag data: sourceNoteId=${note.id}`);
          return { type: "note", sourceNoteId: note.id };
        },
        onDragStart: () => {
          console.log(`Dragging: sourceNoteId=${note.id}`);
          setIsDragging(true);
        },
        onDrop: () => {
          console.log(`Dropped: sourceNoteId=${note.id}`);
          setIsDragging(false);
        },
      }),

      dropTargetForElements({
        element: noteRef.current,
        getData: () => {
          console.log(`Setting drop target: targetNoteId=${note.id}`);
          return { type: "note", targetNoteId: note.id };
        },
        onDragOver: ({ source }) => {
          if (source && source.data && source.data.sourceNoteId) {
            console.log(`Dragged over targetNoteId=${note.id} from sourceNoteId=${source.data.sourceNoteId}`);
          } else {
            console.warn("Dragging over but sourceNoteId is missing!");
          }
        },
        onDrop: ({ source }) => {
          if (source && source.data && source.data.sourceNoteId) {
            console.log(`Swapping sourceNoteId=${source.data.sourceNoteId} ↔ targetNoteId=${note.id}`);
            onSwap(source.data.sourceNoteId, note.id);
          } else {
            console.warn(`Cannot swap - sourceNoteId is missing!`);
          }
        },
      })
    );
  }, [note.id]);


  return (

    <li
      ref={noteRef}
      className={`bg-white p-4 rounded-lg shadow-md flex justify-between items-start w-full m-3 cursor-grab 
        ${isDragging ? "opacity-50" : ""}
        ${!note.content || note.content.length < 50 ? "max-50" : "col-span-2"}`}
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