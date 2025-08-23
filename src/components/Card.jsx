import { useEffect, useRef, useState } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

const Pencil = (p)=>(
  <svg viewBox="0 0 24 24" className="w-5 h-5" {...p}><path fill="currentColor" d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
);
const Trash = (p)=>(
  <svg viewBox="0 0 24 24" className="w-5 h-5" {...p}><path fill="currentColor" d="M6 7h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7zm3-3h6l1 2H8l1-2z"/></svg>
);

export default function Card({ note, rowIndex, colIndex, onDelete, onUpdate, onClick }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const dropConfig = dropTargetForElements({
      element: ref.current,
      getData: () => ({ type: "note-slot", targetNoteId: note.id, rowIndex, colIndex }),
      onDrop: ({ source }) => {
        if (!source?.data?.sourceNoteId || source.data.sourceNoteId === note.id) return;
        // handled in page; here we only provide draggable target
      },
    });

    const dragConfig = draggable({
      element: ref.current,
      getInitialData: () => ({ type: "note", sourceNoteId: note.id, rowIndex, colIndex }),
      onDragStart: () => setDragging(true),
      onDrop: () => setDragging(false),
    });

    return combine(dragConfig, dropConfig);
  }, [note.id, rowIndex, colIndex]);

  return (
    <li
      ref={ref}
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition cursor-pointer ${dragging ? "opacity-60" : ""} ${note.span===2 ? "sm:col-span-2" : ""}`}
    >
      <div className="flex items-start gap-3">
        <h3 className="text-xl font-bold text-gray-900 flex-1 truncate" title={note.title}>
          {note.title}
        </h3>
        <button
          onClick={(e)=>{ e.stopPropagation(); onUpdate(note.id,{ title: note.title, content: note.content, folderId: note.folderId }); }}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          title="Edit"
          aria-label="Edit"
        ><Pencil/></button>
        <button
          onClick={(e)=>{ e.stopPropagation(); onDelete(note.id, note.title); }}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-red-600"
          title="Delete"
          aria-label="Delete"
        ><Trash/></button>
      </div>

      {note.content && note.content.length>0 && (
        <div className="mt-3 text-gray-700 leading-relaxed">
          {/* style hyperlinks like mock */}
          <p className="whitespace-pre-wrap break-words [text-wrap:pretty]">
            {
              // naive link highlighter
              note.content.split(/(https?:\/\/\S+)/g).map((chunk,i)=>
                /^https?:\/\//.test(chunk)
                  ? <a key={i} href={chunk} target="_blank" rel="noreferrer" className="text-blue-600 underline underline-offset-2 break-words">{chunk}</a>
                  : <span key={i}>{chunk}</span>
              )
            }
          </p>
        </div>
      )}
    </li>
  );
}
