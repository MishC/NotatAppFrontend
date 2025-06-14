import React, { useEffect, useRef, useState } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

export default function Card({ note, rowIndex, colIndex, onDelete, onUpdate, onDrop }) {
  const noteRef = useRef(null);
  const contentRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  const normalizedNote = note === null ? { id: 0, title: '', content: '' } : note;

  useEffect(() => {
    if (!noteRef.current) return;

    // Make all cards droppable
    const dropConfig = dropTargetForElements({
      element: noteRef.current,
      getData: () => ({
        type: "note-slot",
        targetNoteId: normalizedNote.id,
        rowIndex,
        colIndex
      }),
      onDrop: ({ source }) => {
        if (!source?.data?.sourceNoteId) {
          console.warn("Missing source ID");
          return;
        }
        
        if (source.data.sourceNoteId === normalizedNote.id) {
         // console.log("Cannot drop on self");
          return;
        }

        //console.log(`Swapping: ${source.data.sourceNoteId} ↔ ${normalizedNote.id}`);
        onDrop(source.data.sourceNoteId, normalizedNote.id, rowIndex, colIndex);
      },
    });

    // Make all cards draggable (including empty slots)
    const dragConfig = draggable({
      element: noteRef.current,
      getInitialData: () => ({
        type: "note",
        sourceNoteId: normalizedNote.id,
        rowIndex,
        colIndex
      }),
      onDragStart: () => {
        setIsDragging(true);
       // console.log(`Started dragging: ${normalizedNote.id}`);
      },
      onDrop: () => {
        setIsDragging(false);
       // console.log(`Finished dragging: ${normalizedNote.id}`);
      },
    });

    const cleanup = combine(dragConfig, dropConfig);
    return () => cleanup();

  }, [normalizedNote.id, rowIndex, colIndex, onDrop]);

  return (
    <li
      ref={noteRef}
      key={normalizedNote.id}
      className={`bg-white p-6 rounded-xl shadow-lg border-4 border-white flex  px-2 items-start m-3 
        ${isDragging ? "opacity-50" : "cursor-grab"} 
        ${normalizedNote.id === 0 ? "empty-slot" : ""} 
        ${normalizedNote.span === 2 ? "sm:col-span-2" : ""}`}  
    >
      {normalizedNote.id !== 0 ? (
        <>
       <div className="break-words flex-grow w-65">
  {/* Header row: title on the left, delete button on the right */}
  <div className="flex  items-center mb-4">
    <h3 className="text-2xl font-extrabold text-black truncate max-w-[80%]">
      {normalizedNote.title}
    </h3>
    <button
  onClick={() => onUpdate(4,note.id)}
  className="ml-6 mr-1
    bg-gradient-to-r from-green-400 to-teal-400
    hover:from-green-500 hover:to-teal-500
    text-white font-bold
    rounded-md
    transition duration-150 ease-in-out
    hover:scale-110
    focus:outline-none focus:ring-2 focus:ring-green-300
    flex items-center justify-center
    w-10 h-8
    text-3xl
  "
  aria-label="Mark complete"
  title="Mark complete"
>
  ✓
</button>

    <button
      onClick={() =>onDelete(note.id)}
      className="mr-auto
        bg-gradient-to-r from-red-500 to-pink-500
        hover:from-red-600 hover:to-pink-600
        text-white font-bold
           rounded-md
        transition duration-150 ease-in-out
        hover:scale-110
        focus:outline-none focus:ring-1 focus:ring-red-400
        text-3xl flex items-center justify-center
        w-10 h-8
      "
      aria-label="Delete note"
      title="Delete note"
    >
      ×
    </button>
  </div>
  <p className="mt-3 mr-10 text-gray-600 text-justify">
    {normalizedNote.content}
  </p>
</div>
          
        </>
      ) : (
        <div ref={contentRef} className="w-full h-full flex items-center justify-center">
          <span className="drop-target text-gray-500"></span>
          <span className="hidden group-hover:inline">Drag&Drop</span>
        </div>
      )}
    </li>
  );
}
