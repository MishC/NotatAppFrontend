import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRef, useEffect,useMemo,useState } from "react";
import { createCalendarHandlers } from "../helpers/calendarHelpers";
import { escapeHtml } from "../helpers/stringHelpers";
import { isOverdue } from "../helpers/dateHelpers";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";




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
  onOpen,
  onComplete,
  onDelete,
  onMoveDate,
}) {

//  const isMobile = useMemo(() => window.innerWidth < 640, []);
  // Source - https://stackoverflow.com/a
// Posted by Volobot Advanced Systems, modified by community. See post 'Timeline' for change history
// Retrieved 2026-01-29, License - CC BY-SA 4.0

const [width, setWidth] = useState(window.innerWidth);

function handleWindowSizeChange() {
    setWidth(window.innerWidth);
}
useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
        window.removeEventListener('resize', handleWindowSizeChange);
    }
}, []);

const isMobile = width <= 822;


  const calRef = useRef(null);
  const wrapRef = useRef(null);

  const dragFixRef = useRef({
    raf: null,
    mouseX: 10,
    mouseY: 10,
    onMove: null,
  });


  const handlers = createCalendarHandlers({
    dragFixRef,
    onOpen,
    onComplete,
    onDelete,
    onMoveDate,
  });

  const openMenu = () => {
    menu.classList.remove("hidden");

    // reset
    menu.style.left = "";
    menu.style.right = "";

    // if it would overflow, anchor to left instead
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth - 8) {
      menu.style.right = "";
      menu.style.left = "";
    }
  };

  useEffect(() => {
    if (!wrapRef.current || !calRef.current) return;
    const ro = new ResizeObserver(() => {
      calRef.current?.getApi?.()?.updateSize?.();
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);
  let __dragMoveHandler = null;


  return (
    <div className="w-[90%] mx-auto border-0 my-calendar" ref={wrapRef}>
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, interactionPlugin,listPlugin, timeGridPlugin]}
          initialView={isMobile ? "listWeek" : "dayGridMonth"}

        height="auto"
        contentHeight="auto"
        aspectRatio={isMobile ? 1.2 : 1.6}
        
        themeSystem="standard"
        firstDay={1}
        dayMaxEvents={isMobile ? 2 : 4}
         headerToolbar={{
    right: "prev,next",
    left: "title",
    center: isMobile
      ? "listWeek"
      : "dayGridMonth,listWeek",
  }}

  views={{
    dayGridMonth: { buttonText: "Month" },
    timeGridWeek: { buttonText: "Week" },
    listWeek: { buttonText: "List" },
  }}
        {...handlers}


        editable={true}
        droppable={true}
        eventStartEditable={true}
        eventDurationEditable={false}
        events={events}
        longPressDelay={350}       // aby scroll nebol “drag”
  eventLongPressDelay={350}
  selectLongPressDelay={350}

        eventClassNames={(arg) => {
    const note = arg.event.extendedProps?.note;
    const ymd = arg.event.startStr?.slice(0,10) ?? note?.scheduledAt?.slice(0,10);
    return isOverdue(ymd) ? ["fc-note-overdue"] : [];
  }}


        eventContent={(arg) => {
          const note = arg.event.extendedProps?.note;
          const title = escapeHtml(note?.title ?? arg.event.title ?? "");
          const content = escapeHtml((note?.content ?? "").trim());
          const colorClass = note?.colorClass ?? "note-color-1";

          return {
            html: `
              <div class="fc-note-card ${colorClass}" data-evt-id="${arg.event.id}" style="z-index:4">
                <div class="fc-drag-handle" title="Drag">
                <div class="fc-card-header" style="display:flex;gap:.5rem;align-items:flex-start;">
                  <div class="fc-note-title" style="flex:1; font-weight:600;">${title}</div>
                  <div class="fc-card-menu-wrap" style="position:relative;">
                    <button class="fc-card-menu-btn ${colorClass}" aria-haspopup="menu" aria-label="Actions" title="Actions" style="
                      width:2rem;height:2rem;border-radius:20px; z-index:10; cursor:pointer;
                    ">☰</button>
                   <ul class="fc-card-menu hidden" role="menu" style="
  position:absolute; right:0; top:2.25rem; min-width:11rem;
  background:white; border:1px solid #e2e8f0ff; border-radius:.5rem;
  box-shadow:0 10px 15px -3px rgba(0,0,0,.1);
  padding:.25rem .25rem;
  z-index:99999; cursor:pointer; }"
">

                      <li role="menuitem" data-act="edit" class="fc-menu-item" style="padding:.5rem .75rem;border-radius:.375rem;cursor:pointer;color:#1E90f4;">🖉 Edit</li>
                      <li role="menuitem" data-act="complete" class="fc-menu-item" style="padding:.5rem .75rem;border-radius:.375rem;cursor:pointer;color:#4a2;">✓ Mark complete</li>
                      <li role="menuitem" data-act="delete" class="fc-menu-item" style="padding:.5rem .75rem;border-radius:.375rem;cursor:pointer;color:#dc2626;">× Delete</li>
                    </ul>
                  </div>
                </div>
                ${content ? `<div class="fc-note-body" style="margin-top:.375rem;color:#334155;background:#f8fafc;border:1px solid #e2e8f0;border-radius:.75rem;padding:.5rem .75rem;">${content}</div>` : ""}
              </div>
                </div>
            `,
          };
        }}

      />
    </div>
  );
}
