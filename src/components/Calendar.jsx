import { useCallback, useEffect, useMemo, useState } from "react";
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
  taskToEvent,
  validateTaskForm,
} from "../helpers/calendarTaskHelpers";
import "./styles/Calendar.css";

export default function Calendar() {
  const user = useSelector((s) => s.auth.user);
  const guest = useSelector((s) => s.auth.guest);
  const API_URL = import.meta.env.VITE_API_TASKS || import.meta.env.VITE_API_URL;

  const [tasks, setTasks] = useState([]);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedTask, setSelectedTask] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [hasLoadedTasks, setHasLoadedTasks] = useState(false);

  const events = useMemo(() => tasks.map(taskToEvent), [tasks]);

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
    const end = changeInfo.event.end || getDefaultEndDate(start);

    if (!task || !start || !end) {
      changeInfo.revert();
      return;
    }

    const ok = await updateTaskAction({
      guest,
      API_URL,
      id: task.id,
      task: {
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
            overdueOnly={overdueOnly}
            onOverdueOnlyToggle={() => setOverdueOnly((value) => !value)}
          />

          <div className="calendar-container min-w-0">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              initialView="dayGridMonth"
              editable
              selectable
              selectMirror
              dayMaxEvents
              nowIndicator
              weekends={weekendsVisible}
              events={events}
              select={handleDateSelect}
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
