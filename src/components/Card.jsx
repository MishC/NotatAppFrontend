import React, { useEffect, useRef, useState } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

export default function Card({ note, rowIndex, colIndex, onDelete, onDrop }) {
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
      className={`bg-white p-6 rounded-xl shadow-lg border-4 border-white flex justify-between items-start m-3 
        ${isDragging ? "opacity-50" : "cursor-grab"} 
        ${normalizedNote.id === 0 ? "empty-slot" : ""} 
        ${normalizedNote.span === 2 ? "sm:col-span-2" : ""}`}  
    >
      {normalizedNote.id !== 0 ? (
        <>
          <div className="break-words flex-grow w-65">
            <h3 className="text-xl font-bold text-black">{normalizedNote.title}</h3>
            <p className="text-gray-600 text-black p-5 mr-5">{normalizedNote.content}</p>
          </div>
          <div className="justify-left pt-5 mt-5">
            <button
              onClick={() => onDelete(note.id)}
              className="
                bg-red-400
                hover:bg-red-500
                text-white
                font-size-16
                font-bold
                py-1
                px-3
                rounded
                transition
                duration-150
                ease-in-out
                hover:scale-[1.18]
              "
              style={{
                fontSize: "16px",
                transition: "transform 0.15s, font-size 0.15s",
              }}
            >
              🗑 
            </button>
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
