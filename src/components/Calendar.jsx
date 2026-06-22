import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import NavigationBar from "./NavigationBar";
import CalendarEventContent from "./calendar/CalendarEventContent";
import CalendarSidebar from "./calendar/CalendarSidebar";
import TaskEventModal from "./calendar/TaskEventModal";
import {
  createTaskAction,
  deleteTaskAction,
  initCalendarTasksAction,
  syncGuestCalendarTasksAction,
  updateTaskAction,
} from "../actions/calendarActions";
import {
  buildEmptyForm,
  createDateForSelectedDay,
  formFromTask,
  getDefaultEndDate,
  payloadFromForm,
  startOfNextLocalDay,
  taskToEvent,
  validateTaskForm,
} from "../helpers/calendarTaskHelpers";
import "./styles/Calendar.css";

function getLocalDateKey(date) {
  if (!date) return "";
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getTaskDateKeys(task) {
  const start = task?.startTimeUtc ? new Date(task.startTimeUtc) : null;
  const end = task?.endTimeUtc ? new Date(task.endTimeUtc) : null;
  if (!start || Number.isNaN(start.getTime())) return [];

  if (!end || Number.isNaN(end.getTime())) return [getLocalDateKey(start)];

  const keys = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  if (task.isAllDay && end.getHours() === 0 && end.getMinutes() === 0 && last > cursor) {
    last.setDate(last.getDate() - 1);
  }

  while (cursor <= last) {
    keys.push(getLocalDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

function setDayCellActionLabel(el, label) {
  const baseLabel = (el.getAttribute("aria-label") || "").replace(/\. (Create|Edit) Event$/, "");
  el.title = label;
  el.setAttribute("aria-label", baseLabel ? `${baseLabel}. ${label}` : label);
}

export default function Calendar() {
  const user = useSelector((s) => s.auth.user);
  const guest = useSelector((s) => s.auth.guest);
  const API_URL = import.meta.env.VITE_API_TASKS || import.meta.env.VITE_API_URL;
  const calendarWrapRef = useRef(null);

  const [tasks, setTasks] = useState([]);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedTask, setSelectedTask] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [hasLoadedTasks, setHasLoadedTasks] = useState(false);

  const events = useMemo(() => tasks.map(taskToEvent), [tasks]);
  const eventDateKeys = useMemo(() => new Set(tasks.flatMap(getTaskDateKeys)), [tasks]);

  const loadTasks = useCallback(async () => {
    const ok = await initCalendarTasksAction({
      guest,
      API_URL,
      filter: "all",
      setTasks,
      setLoading,
      setError,
    });
    if (ok) setHasLoadedTasks(true);
    return ok;
  }, [guest, API_URL]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!hasLoadedTasks) return;
    syncGuestCalendarTasksAction({ guest, tasks });
  }, [guest, hasLoadedTasks, tasks]);

  useEffect(() => {
    if (!error && !msg) return undefined;
    const timer = setTimeout(() => {
      setError("");
      setMsg("");
    }, 3500);
    return () => clearTimeout(timer);
  }, [error, msg]);

  const openCreateModal = (startDate, endDate) => {
    setModalMode("create");
    setSelectedTask(null);
    setForm(buildEmptyForm(startDate, endDate));
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setModalMode("edit");
    setSelectedTask(task);
    setForm(formFromTask(task));
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const handleDateSelect = (selectInfo) => {
    selectInfo.view.calendar.unselect();

    if (selectInfo.allDay) {
      const start = createDateForSelectedDay(selectInfo.start);
      openCreateModal(start, getDefaultEndDate(start));
      return;
    }

    openCreateModal(selectInfo.start, selectInfo.end || getDefaultEndDate(selectInfo.start));
  };

  const handleDayCellDidMount = useCallback((cellInfo) => {
    if (cellInfo.isDisabled) return;

    const dateKey = getLocalDateKey(cellInfo.date);
    setDayCellActionLabel(cellInfo.el, eventDateKeys.has(dateKey) ? "Edit Event" : "Create Event");
  }, [eventDateKeys]);

  useEffect(() => {
    const root = calendarWrapRef.current;
    if (!root) return;

    root.querySelectorAll(".fc-daygrid-day[data-date], .fc-timegrid-col[data-date]").forEach((el) => {
      const dateKey = el.getAttribute("data-date");
      if (!dateKey) return;
      setDayCellActionLabel(el, eventDateKeys.has(dateKey) ? "Edit Event" : "Create Event");
    });
  }, [currentEvents, eventDateKeys]);

  const handleEventClick = (clickInfo) => {
    const task = clickInfo.event.extendedProps.task;
    if (task) openEditModal(task);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateTaskForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = payloadFromForm(form);

    if (modalMode === "create") {
      const created = await createTaskAction({
        guest,
        API_URL,
        task: payload,
        setTasks,
        setMsg,
        setError,
      });
      if (created) closeModal();
      return;
    }

    const ok = await updateTaskAction({
      guest,
      API_URL,
      id: selectedTask?.id,
      task: payload,
      setTasks,
      setMsg,
      setError,
    });
    if (ok) closeModal();
  };

  const handleDelete = async () => {
    const ok = await deleteTaskAction({
      guest,
      API_URL,
      id: selectedTask?.id,
      setTasks,
      setMsg,
      setError,
    });
    if (ok) closeModal();
  };

  const updateEventDates = async (changeInfo) => {
    const task = changeInfo.event.extendedProps.task;
    const start = changeInfo.event.start;
    const isAllDay = Boolean(changeInfo.event.allDay);
    const end = changeInfo.event.end || (isAllDay ? startOfNextLocalDay(start) : getDefaultEndDate(start));

    if (!task || !start || !end) {
      changeInfo.revert();
      return;
    }

    const ok = await updateTaskAction({
      guest,
      API_URL,
      id: task.id,
      task: {
        isAllDay,
        startTimeUtc: start.toISOString(),
        endTimeUtc: end.toISOString(),
      },
      setTasks,
      setMsg,
      setError,
    });

    if (!ok) changeInfo.revert();
  };

  return (
    <div className="w-full m-0">
      <NavigationBar
        userName={user?.email || user?.name || "Guest"}
        isNavItemVisble={true}
        isEmailVisible={true}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className={error || msg ? "mb-5 rounded-xl" : "mb-5"}>
          {error ? (
            <div className="text-red-700 p-4 bg-red-50 rounded-xl border border-red-200">{error}</div>
          ) : msg ? (
            <div className="text-emerald-700 p-4 bg-emerald-50 rounded-xl border border-emerald-200">{msg}</div>
          ) : (
            <div>&nbsp;</div>
          )}
        </div>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
          <CalendarSidebar
            weekendsVisible={weekendsVisible}
            onWeekendsToggle={() => setWeekendsVisible((value) => !value)}
            currentEvents={currentEvents}
            loading={loading}
            onEventClick={(event) => {
              const task = event.extendedProps?.task;
              if (task) openEditModal(task);
            }}
          />

          <div ref={calendarWrapRef} className="calendar-container calendar-task-grid min-w-0">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              initialView="dayGridMonth"
              height="auto"
              contentHeight="auto"
              aspectRatio={1.6}
              expandRows={false}
              editable
              eventDurationEditable
              eventStartEditable
              eventResizableFromStart
              selectable
              selectMirror
              dayMaxEvents
              nowIndicator
              weekends={weekendsVisible}
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                meridiem: "short",
                omitZeroMinute: true,
              }}
              events={events}
              select={handleDateSelect}
              dayCellDidMount={handleDayCellDidMount}
              eventContent={CalendarEventContent}
              eventClick={handleEventClick}
              eventDrop={updateEventDates}
              eventResize={updateEventDates}
              eventsSet={setCurrentEvents}
            />
          </div>
        </section>
      </main>

      {modalOpen && (
        <TaskEventModal
          form={form}
          mode={modalMode}
          onChange={setForm}
          onClose={closeModal}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
