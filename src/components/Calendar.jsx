import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRef, useEffect } from "react";

import "./Calendar.css"

/**
 * props:
 *  - events: [{ id, title, start: 'YYYY-MM-DD', allDay: true, extendedProps: { note } }]
 *  - onOpen(note), onEdit(note), onDelete(note), onComplete(note)
 *  - onSaveDate(note, ymd)   // pri prijatí z externého DnD
 *  - onMoveDate(note, ymd)   // pri presune vnútri kalendára
 *  - noteById: Map<string, note> // záloha pre eventReceive, ak by extendedProps.note chýbal
 */
export default function Calendar({
  events,
  onOpen,        // (note) => void
  onComplete,    // (note) => void
  onDelete,      // (note) => void
  onMoveDate,    // (note, ymd) => Promise<boolean> | boolean

}) {

  const calRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!wrapRef.current || !calRef.current) return;
    const ro = new ResizeObserver(() => {
      const api = calRef.current?.getApi?.();
      api?.updateSize();
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="w-[90%] ml-20 border-0 my-calendar" ref={wrapRef} >
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        themeSystem="standard"

        initialView="dayGridMonth"
        height="auto"
        firstDay={1}
        editable={true}
        droppable={true}
        eventStartEditable={true}
        eventDurationEditable={false}
        events={events}

        eventDragStart={() => {
          document.body.classList.add("fc-dragging-tight");
        }}
        eventDragStop={() => {
          document.body.classList.remove("fc-dragging-tight");
        }}

        eventContent={(arg) => {
          const note = arg.event.extendedProps?.note;
          const title = escapeHtml(note?.title ?? arg.event.title ?? "");
          const content = escapeHtml((note?.content ?? "").trim());
          const colorClass = note?.colorClass ?? "note-color-1"; // fallback

          // IMPORTANT: data-attrs so we can find things in eventDidMount
          return {
            html: `
              <div class="fc-note-card ${colorClass}" data-evt-id="${arg.event.id}">
                <div class="fc-card-header" style="display:flex;gap:.5rem;align-items:flex-start;">
                  <div class="fc-note-title" style="flex:1; font-weight:600;">${title}</div>
                  <div class="fc-card-menu-wrap" style="position:relative;">
                    <button class="fc-card-menu-btn" aria-haspopup="menu" aria-label="Actions" title="Actions" style="
                      width:2rem;height:2rem;border-radius:9999px;border:1px solid #e2e8f0;background:white;
                    ">☰</button>
                    <ul class="fc-card-menu hidden" role="menu" style="
                      position:absolute;right:0;top:2.25rem;min-width:11rem;
                      background:white;border:1px solid #e2e8f0ff;border-radius:.5rem;box-shadow:0 10px 15px -3px rgba(0,0,0,.1);
                      padding:.25rem .25rem;z-index:9;
                    ">
                      <li role="menuitem" data-act="edit" class="fc-menu-item" style="padding:.5rem .75rem;border-radius:.375rem;cursor:pointer;color:#1E90f4;">🖉 Edit</li>
                      <li role="menuitem" data-act="complete" class="fc-menu-item" style="padding:.5rem .75rem;border-radius:.375rem;cursor:pointer;color:#4a2;">✓ Mark complete</li>
                      <li role="menuitem" data-act="delete" class="fc-menu-item" style="padding:.5rem .75rem;border-radius:.375rem;cursor:pointer;color:#dc2626;">× Delete</li>
                    </ul>
                  </div>
                </div>
                ${content ? `<div class="fc-note-body" style="margin-top:.375rem;color:#334155;background:#f8fafc;border:1px solid #e2e8f0;border-radius:.75rem;padding:.5rem .75rem;">${content}</div>` : ""}
              </div>
            `,
          };
        }}

        eventDidMount={(info) => {
          const el = info.el;
          const note = info.event.extendedProps?.note;
          if (!note) return false;

          const wrap = el.querySelector(".fc-card-menu-wrap");
          const btn = el.querySelector(".fc-card-menu-btn");
          const menu = el.querySelector(".fc-card-menu");
          if (!wrap || !btn || !menu) return;

          // toggle menu
          const toggleMenu = (e) => {
            e.stopPropagation();
            e.preventDefault();
            menu.classList.toggle("hidden");
          };

          // close menu on outside click
          const onDocClick = (e) => {
            if (!wrap.contains(e.target)) menu.classList.add("hidden");
          };

          // prevent drag when clicking menu button
          const stop = (e) => {
            e.stopPropagation();
            e.preventDefault();
          };

          btn.addEventListener("click", toggleMenu);
          btn.addEventListener("mousedown", stop);
          btn.addEventListener("touchstart", stop, { passive: false });

          // menu actions
          const onMenuClick = (e) => {
            const li = e.target.closest(".fc-menu-item");
            if (!li) return;
            e.stopPropagation();
            e.preventDefault();
            const act = li.getAttribute("data-act");
            menu.classList.add("hidden");
            if (act === "edit") onOpen?.(note);
            if (act === "complete") onComplete?.(note);
            if (act === "delete") onDelete?.(note);
          };
          menu.addEventListener("click", onMenuClick);

          document.addEventListener("click", onDocClick);

          // cleanup when event unmounts
          info.event.setExtendedProp("__cleanup", () => {
            btn.removeEventListener("click", toggleMenu);
            btn.removeEventListener("mousedown", stop);
            btn.removeEventListener("touchstart", stop);
            menu.removeEventListener("click", onMenuClick);
            document.removeEventListener("click", onDocClick);
          });
        }}

        eventWillUnmount={(info) => {
          const fn = info.event.extendedProps?.__cleanup;
          if (typeof fn === "function") fn();
        }}
        ////////////////////

        eventReceive={async (info) => {
          const id = String(info.event.id);
          const newDate = info.event.startStr?.slice(0, 10);
          if (!newDate) return;

          const note =
            info.event.extendedProps?.note ??
            noteById?.get(id);

          if (!note) {
            info.event.remove();
            return;
          }

          const ok = await onMoveDate?.(note, newDate);
          if (!ok) info.event.remove();
        }}


        eventDrop={async (info) => {
          const note = info.event.extendedProps?.note;
          const newDate = info.event.startStr?.slice(0, 10);
          if (!note || !newDate) return;
          const ok = await onMoveDate?.(note, newDate);
          if (!ok) info.revert();
        }}
      />
    </div>
  );
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
