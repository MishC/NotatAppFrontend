export function createCalendarHandlers({
  dragFixRef,
  onOpen,
  onComplete,
  onDelete,
  onMoveDate,
  noteById,
}) {
  return {
    /** Stop FullCalendar default click */
    eventClick(info) {
      info.jsEvent.preventDefault();
      info.jsEvent.stopPropagation();
      info.jsEvent.stopImmediatePropagation?.();
    },

    /** INTERNAL drag start (calendar → calendar) */
    eventDragStart() {
      document.body.classList.add("fc-dragging-tight");
      document.body.style.cursor = "grabbing";

      const onMove = (e) => {
        dragFixRef.current.mouseX = e.clientX;
        dragFixRef.current.mouseY = e.clientY;
      };

      dragFixRef.current.onMove = onMove;
      window.addEventListener("mousemove", onMove, { passive: true });

      const tick = () => {
        const el = document.querySelector(".fc-event-dragging");
        if (el) {
          const { mouseX, mouseY } = dragFixRef.current;

          // anchor to cursor
          el.style.setProperty(
            "inset",
            `${mouseY}px auto auto ${mouseX}px`,
            "important"
          );

          // offset mirror (right + down)
          el.style.setProperty(
            "transform",
            "translate(25px, 10px)",
            "important"
          );
        }

        dragFixRef.current.raf = requestAnimationFrame(tick);
      };

      dragFixRef.current.raf = requestAnimationFrame(tick);
    },

    /** INTERNAL drag stop */
    eventDragStop() {
      document.body.classList.remove("fc-dragging-tight");
      document.body.style.cursor = "";

      if (dragFixRef.current.raf) {
        cancelAnimationFrame(dragFixRef.current.raf);
        dragFixRef.current.raf = null;
      }

      if (dragFixRef.current.onMove) {
        window.removeEventListener(
          "mousemove",
          dragFixRef.current.onMove
        );
        dragFixRef.current.onMove = null;
      }

      const el = document.querySelector(".fc-event-dragging");
      if (el) {
        el.style.removeProperty("inset");
        el.style.removeProperty("transform");
      }
    },

    /** Attach menu + handlers to event DOM */
    eventDidMount(info) {
      const el = info.el;
      const note = info.event.extendedProps?.note;
      if (!note) return;

      const wrap = el.querySelector(".fc-card-menu-wrap");
      const btn = el.querySelector(".fc-card-menu-btn");
      const menu = el.querySelector(".fc-card-menu");
      const card = el.querySelector(".fc-note-card");

      if (!wrap || !btn || !menu || !card) return;

      const toggleMenu = (e) => {
        e.stopPropagation();
        e.preventDefault();
        menu.classList.toggle("hidden");
      };

      const onCardClick = (e) => {
        if (wrap.contains(e.target)) return;
        e.stopPropagation();
        e.preventDefault();
        menu.classList.toggle("hidden");
      };

      const onDocClick = (e) => {
        if (!card.contains(e.target)) menu.classList.add("hidden");
      };

      const stop = (e) => {
        e.stopPropagation();
        e.preventDefault();
      };

      const onMenuClick = (e) => {
        const li = e.target.closest(".fc-menu-item");
        if (!li) return;

        e.stopPropagation();
        e.preventDefault();
        menu.classList.add("hidden");

        const act = li.getAttribute("data-act");
        if (act === "edit") onOpen?.(note);
        if (act === "complete") onComplete?.(note);
        if (act === "delete") onDelete?.(note);
      };

      card.addEventListener("click", onCardClick);
      btn.addEventListener("click", toggleMenu);
      btn.addEventListener("mousedown", stop);
      btn.addEventListener("touchstart", stop, { passive: false });
      menu.addEventListener("click", onMenuClick);
      document.addEventListener("click", onDocClick);

      info.event.setExtendedProp("__cleanup", () => {
        card.removeEventListener("click", onCardClick);
        btn.removeEventListener("click", toggleMenu);
        btn.removeEventListener("mousedown", stop);
        btn.removeEventListener("touchstart", stop);
        menu.removeEventListener("click", onMenuClick);
        document.removeEventListener("click", onDocClick);
      });
    },

    eventWillUnmount(info) {
      const fn = info.event.extendedProps?.__cleanup;
      if (typeof fn === "function") fn();
    },

    /** INTERNAL move (calendar → calendar) */
    async eventDrop(info) {
      const note = info.event.extendedProps?.note;
      const newDate = info.event.startStr?.slice(0, 10);
      if (!note || !newDate) return;

      const ok = await onMoveDate(note, newDate);
      if (!ok) info.revert();
    },

    /** EXTERNAL move (unscheduled → calendar) */
    async eventReceive(info) {
      const newDate = info.event.startStr?.slice(0, 10);
      if (!newDate) {
        info.event.remove();
        return;
      }

      const note =
        info.event.extendedProps?.note ??
        noteById?.get(String(info.event.id));

      if (!note) {
        info.event.remove();
        return;
      }

      const ok = await onMoveDate(note, newDate);
      if (!ok) info.event.remove();
    },
  };
}
