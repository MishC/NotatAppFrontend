import { useEffect, useRef, useState } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

export default function Card({ note, rowIndex, colIndex, onDelete, onUpdate, onDrop, onClick }) {
  const noteRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [folderId, setFolderId] = useState(note.folderId || "");
  const [showMenu, setShowMenu] = useState(false);



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
        "bg-white",
        "shadow-sm hover:shadow-lg transition-all duration-200 ease-out",
        // padding & spacing
        "p-4 sm:p-5 m-2",
        // grid span
        note.span === 2 ? "sm:col-span-2" : "",
        // interactions
        isDragging
          ? "opacity-75 scale-[0.98] ring-2 ring-blue-400/40"
          : "cursor-grab hover:-translate-y-0.5",
        "focus-within:ring-2 focus-within:ring-blue-400/40",
      ].join(" ")}
    >
      {/* Header row: Title and action menu */}
      <div className="flex items-start gap-2 mb-3 min-w-0">
        <h4
          className="flex-1 min-w-0 text-xl sm:text-2xl font-semibold tracking-tight text-slate-800 truncate"
          title={note.title}
        >
          {note.title}
        </h4>

        {/* Dropdown menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="p-2 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="More options"
          >
            ⋮
          </button>

          {showMenu && (
            <ul
              className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <li>
                <button
                  onClick={() => {
                    setFolderId(4);
                    onUpdate(note.id, { ...note, folderId: 4 });
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-green-600"
                >
                  ✓ Mark Complete
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onClick(note); // open modal edit
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-blue-600"
                >
                  ✏️ Edit
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onDelete(note.id, note.title);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-red-600"
                >
                  × Delete
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Content */}
      {note.content && note.content.length > 1 && (
        <p
          className={[
            "mt-3 text-slate-700 leading-relaxed",
            "bg-slate-50 border border-slate-200 rounded-xl",
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
