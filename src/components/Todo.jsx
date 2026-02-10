import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";

import { createCalendarHandlers } from "../helpers/calendarHelpers";
import { escapeHtml } from "../helpers/stringHelpers";
import { isOverdue } from "../helpers/dateHelpers";
import { isMobile, isTablet } from "../helpers/screenHelpers";

import "./styles/Calendar.css";

function useWindowWidth() {
  const [w, setW] = useState(() => window.innerWidth);

  useEffect(() => {
    let raf = null;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setW(window.innerWidth));
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return w;
}

const VIEW_KEY = "noteapp.fc.view";

export default function Todo({ events, onOpen, onComplete, onDelete, onMoveDate }) {
  const calRef = useRef(null);
  const wrapRef = useRef(null);

  const dragFixRef = useRef({ raf: null, mouseX: 10, mouseY: 10, onMove: null });

  const width = useWindowWidth();
  const mobile = useMemo(() => isMobile(width), [width]);
  const tablet = useMemo(() => isTablet(width), [width]);
  const compact = mobile || tablet;

  // ✅ Default view = List, but only on first mount (persisted)
  const [initialView] = useState(() => localStorage.getItem(VIEW_KEY) || "listWeek");
  const currentViewRef = useRef(initialView);

  const handlers = useMemo(
    () =>
      createCalendarHandlers({
        dragFixRef,
        onOpen,
        onComplete,
        onDelete,
        onMoveDate,
      }),
    [onOpen, onComplete, onDelete, onMoveDate]
  );

  const headerToolbar = useMemo(
    () => ({
      right: "prev,next",
      left: "title",
      // ✅ On mobile/tablet show ONLY List button
      center: compact ? "listWeek" : "listWeek,dayGridMonth",
    }),
    [compact]
  );

  const views = useMemo(
    () => ({
      dayGridMonth: { buttonText: "Month" },
      listWeek: { buttonText: "List" },
    }),
    []
  );

  const aspectRatio = useMemo(() => (mobile ? 1.2 : 1.6), [mobile]);
  const dayMaxEvents = useMemo(() => (mobile ? 2 : 4), [mobile]);

  const eventClassNames = useCallback((arg) => {
    const note = arg.event.extendedProps?.note;
    const ymd = arg.event.startStr?.slice(0, 10) ?? note?.scheduledAt?.slice(0, 10);
    return isOverdue(ymd) ? ["fc-note-overdue"] : [];
  }, []);

  const eventContent = useCallback((arg) => {
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
            ${
              content
                ? `<div class="fc-note-body" style="margin-top:.375rem;color:#334155;background:#f8fafc;border:1px solid #e2e8f0;border-radius:.75rem;padding:.5rem .75rem;">${content}</div>`
                : ""
            }
          </div>
        </div>
      `,
    };
  }, []);

  const handleDatesSet = useCallback((arg) => {
    const v = arg?.view?.type || "listWeek";
    currentViewRef.current = v;
    localStorage.setItem(VIEW_KEY, v);
  }, []);

  useEffect(() => {
    const api = calRef.current?.getApi?.();
    if (!api) return;

    if (compact && api.view.type === "dayGridMonth") {
      api.changeView("listWeek");
      currentViewRef.current = "listWeek";
      localStorage.setItem(VIEW_KEY, "listWeek");
    }

    requestAnimationFrame(() => api.updateSize());
  }, [compact]);

  return (
    <div className=" w-full h-full border-0 my-calendar" ref={wrapRef}>
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}

        initialView={initialView}

        height="auto"
        contentHeight="auto"
        aspectRatio={aspectRatio}

        themeSystem="standard"
        firstDay={1}
        dayMaxEvents={dayMaxEvents}

        headerToolbar={headerToolbar}
        views={views}

        {...handlers}

        editable={true}
        droppable={true}
        eventStartEditable={true}
        eventDurationEditable={false}
        events={events}

        longPressDelay={350}
        eventLongPressDelay={350}
        selectLongPressDelay={350}

        eventClassNames={eventClassNames}
        eventContent={eventContent}

        datesSet={handleDatesSet}
      />
    </div>
  );
}
