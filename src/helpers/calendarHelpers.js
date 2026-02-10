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
  /*   eventClick(info) {
      info.jsEvent.preventDefault();
      info.jsEvent.stopPropagation();
      info.jsEvent.stopImmediatePropagation?.();
    }, */

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

  const harness = el.closest(".fc-daygrid-event-harness");
  const isMobile = window.matchMedia("(pointer: coarse)").matches;

  const setOpen = (open) => {
    menu.classList.toggle("hidden", !open);

    // lift event + harness so nothing covers the dropdown
    el.classList.toggle("fc-menu-open", open);
    harness?.classList.toggle("fc-menu-open", open);
  };

  const stop = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // Desktop: toggle menu (only from button)
  const toggleMenu = (e) => {
    stop(e);
    const open = menu.classList.contains("hidden");
    setOpen(open);
  };

  // Mobile: tap on card opens modal (NOT menu)
  const onCardPointerDown = (e) => {
    if (!isMobile) return;

    // ignore tap on button/menu area if you still want the menu to work
    // if you don't want menu at all on mobile, remove this if-block
    if (wrap.contains(e.target)) return;

    stop(e);
    setOpen(false);
    onOpen?.(note);
  };

  // Desktop: click on card toggles menu (optional behavior)
  // If you want card-click menu ONLY on desktop, keep this:
  const onCardClickDesktop = (e) => {
    if (isMobile) return;
    if (wrap.contains(e.target)) return;
    stop(e);
    const open = menu.classList.contains("hidden");
    setOpen(open);
  };

  const onDocClick = (e) => {
    if (!card.contains(e.target)) setOpen(false);
  };

  const onMenuClick = (e) => {
    const li = e.target.closest(".fc-menu-item");
    if (!li) return;

    stop(e);
    setOpen(false);

    const act = li.getAttribute("data-act");
    if (act === "edit") onOpen?.(note);
    if (act === "complete") onComplete?.(note);
    if (act === "delete") onDelete?.(note);
  };

  card.addEventListener("pointerdown", onCardPointerDown, { passive: false });

  // Desktop behavior:
  card.addEventListener("click", onCardClickDesktop);

  btn.addEventListener("click", toggleMenu);
  btn.addEventListener("pointerdown", stop, { passive: false }); // prevent drag start from button
  menu.addEventListener("click", onMenuClick);
  document.addEventListener("click", onDocClick);

  info.event.setExtendedProp("__cleanup", () => {
    card.removeEventListener("pointerdown", onCardPointerDown);
    card.removeEventListener("click", onCardClickDesktop);

    btn.removeEventListener("click", toggleMenu);
    btn.removeEventListener("pointerdown", stop);

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

// Dragging a note
export function onDrag(e) {
    const ghost = document.createElement("div");
    ghost.textContent = e.currentTarget.getAttribute("data-title") || "";
    ghost.style.position = "absolute";
    ghost.style.top = "-9999px";
    ghost.style.left = "-9999px";
    ghost.style.padding = "8px 12px";
    ghost.style.borderRadius = "12px";
    ghost.style.background = "white";
    ghost.style.border = "1px solid #e2e8f0";
    ghost.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,.1)";
    document.body.appendChild(ghost);


    e.dataTransfer.setDragImage(ghost, -20, 10);

    setTimeout(() => ghost.remove(), 0);
  }