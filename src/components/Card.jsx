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
     className={[
        // card shell
        "group flex flex-col min-w-0 rounded-2xl border border-slate-200",
        "bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        "shadow-sm hover:shadow-lg transition-all duration-200 ease-out",
        // padding & spacing
        "p-4 sm:p-5 m-2",
        // grid span
        note.span === 2 ? "sm:col-span-2" : "",
        // interactions
        isDragging ? "opacity-75 scale-[0.98] ring-2 ring-blue-400/40" : "cursor-grab hover:-translate-y-0.5",
        "focus-within:ring-2 focus-within:ring-blue-400/40",
      ].join(" ")}
    >
      {/* Header row: Title and action buttons */}
      <div className="flex items-center gap-2 mb-3 min-w-0">
        <h3
          className="flex-1 min-w-0 text-xl sm:text-2xl font-semibold tracking-tight text-slate-800 truncate"
          title={note.title}
        >
          {note.title}
        </h3>
         <div className="flex items-center gap-2 shrink-0">

        <button
          onClick={(e) => {e.stopPropagation();setFolderId(4);onUpdate(note.id,{...note, folderId: 4})}}
          className={[
              "inline-flex items-center justify-center",
              "h-9 w-9 rounded-full",
              "bg-gradient-to-br from-emerald-400 to-teal-500",
              "text-white text-lg font-bold",
              "shadow-sm hover:shadow focus:outline-none",
              "hover:scale-105 active:scale-95",
              "focus-visible:ring-2 focus-visible:ring-emerald-300",
            ].join(" ")}
            aria-label="Mark complete"
            title="Mark complete"
        >
          ✓
        </button>
        <button
          onClick={(e) => {e.stopPropagation();onDelete(note.id, note.title)}}
     className={[
              "inline-flex items-center justify-center",
              "h-9 w-9 rounded-full",
              "bg-gradient-to-br from-rose-500 to-pink-500",
              "text-white text-xl font-bold",
              "shadow-sm hover:shadow focus:outline-none",
              "hover:scale-105 active:scale-95",
              "focus-visible:ring-2 focus-visible:ring-rose-300",
            ].join(" ")}
            aria-label="Delete note"
            title="Delete note"
        >
          ×
        </button>
        </div>
      </div>
       {/* subtle divider */}
      {/*<div className="mt-3 h-px w-full bg-gradient-to-r from-slate-200 via-slate-200/60 to-transparent" />*/}

      {/* Content */}
                

      {note.content && note.content.length > 1 && (
          <p
          className={[
            "mt-3 text-slate-700 leading-relaxed",
            "bg-slate-50/70 border border-slate-200 rounded-xl",
            "p-4 break-words",
            "group-hover:bg-slate-50",
          ].join(" ")}
        >
          {note.content}
        </p>
      )}
    </li>
  );
}
