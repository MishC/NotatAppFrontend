// src/components/Unscheduled.jsx
import { useEffect, useRef } from "react";
import { Draggable } from "@fullcalendar/interaction";
import HamburgerIcon from "./icons/HamburgerIcon";
import { getColorClassById } from "../helpers/colors";


export default function Unscheduled({ notes, onOpen, onDelete, onComplete, onEdit }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const d = new Draggable(containerRef.current, {
      itemSelector: ".fc-external",
      eventData: (el) => {
        const id = el.getAttribute("data-id");
        const json = el.getAttribute("data-note");
        let note = null;
        try { note = JSON.parse(json); } catch {}
        return {
          id,
          title: note?.title ?? el.getAttribute("data-title") ?? "",
          allDay: true,
          extendedProps: { note }, // <<< posielame celý note
        };
      },
    });
    return () => d.destroy();
  }, []);

  return (
    <div className="mt-20 ml-20 w-[90%]">
      <h3 className="text-2xl text-slate-800 mb-20 text-left ml-8 text-blue-400 text-[1.75em]">Unscheduled</h3>
      <ul
        ref={containerRef}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
      >
        {notes.map((n) => { const colorClass = getColorClassById(n.id);
          const noteWithColor = { ...n, colorClass };
          return (
          <li
            key={n.id}
              className={`fc-external group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm p-4 
                hover:-translate-y-0.5 transition will-change-transform cursor-grab ${colorClass}`}
              data-id={String(n.id)}
            data-title={n.title}
            data-note={JSON.stringify(n)}   
            onClick={() => onOpen(n)}
            title={n.title}
          >
            <div className="flex items-start gap-3 mb-3">
              <h4 className="flex-1 text-xl sm:text-2xl font-semibold tracking-tight text-slate-800 truncate">
                {n.title}
              </h4>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const menu = e.currentTarget.nextElementSibling;
                    if (menu) menu.classList.toggle("hidden");
                  }}
                  className="h-10 w-10 inline-flex items-center justify-center rounded-full
                             text-slate-700 hover:text-blue-600 hover:bg-slate-100
                             focus:outline-none focus:ring-2 focus:ring-blue-300"
                  title="Actions"
                  aria-label="Actions"
                >
                  <HamburgerIcon />
                </button>

                <ul
                  className="relative hidden absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 z-[1000] overflow-visible"
                  onClick={(e) => e.stopPropagation()}
                >
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 text-green-600"
                      onClick={() => onComplete(n)}
                    >
                      <span className="text-xl mr-2" aria-hidden>✓</span>
                      Mark complete
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 text-blue-600"
                      onClick={() => onEdit(n)}
                    >
                      <span className="text-base mr-2" aria-hidden>🖉</span>
                      Edit
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 text-red-600"
                      onClick={() => onDelete(n.id, n.title)}
                    >
                      <span className="text-xl mr-2" aria-hidden>×</span>
                      Delete
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {n.content?.trim() && (
              <p className="mt-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-4 break-words">
                {n.content}
              </p>
            )}
          </li>
        )
        })}
      </ul>
    </div>
  );
}
