export const DEFAULT_EVENT_HOUR = 9;
export const DEFAULT_EVENT_LENGTH_MINUTES = 60;

function pad(value) {
  return String(value).padStart(2, "0");
}

export function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDatetimeLocalValue(value) {
  const date = toDate(value);
  if (!date) return "";

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

export function fromDatetimeLocalValue(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

export function getDefaultEndDate(startDate) {
  return addMinutes(startDate, DEFAULT_EVENT_LENGTH_MINUTES);
}

export function createDateForSelectedDay(date) {
  const selected = toDate(date) || new Date();
  selected.setHours(DEFAULT_EVENT_HOUR, 0, 0, 0);
  return selected;
}

export function isTaskOverdue(task) {
  const end = toDate(task?.endTimeUtc);
  return Boolean(!task?.isDone && end && end.getTime() < Date.now());
}

export function isCalendarEventOverdue(event) {
  const task = event?.extendedProps?.task;
  return isTaskOverdue(task);
}

export function taskToEvent(task) {
  const start = toDate(task.startTimeUtc);
  const end = toDate(task.endTimeUtc) || (start ? getDefaultEndDate(start) : null);

  return {
    id: String(task.id),
    title: task.title || "(untitled task)",
    start,
    end,
    allDay: false,
    classNames: [
      isTaskOverdue(task) ? "fc-task-overdue" : "",
      task.isDone ? "fc-task-done" : "",
    ].filter(Boolean),
    extendedProps: { task },
  };
}

export function buildEmptyForm(startDate = createDateForSelectedDay(new Date()), endDate = null) {
  const start = toDate(startDate) || createDateForSelectedDay(new Date());
  const end = toDate(endDate) || getDefaultEndDate(start);

  return {
    title: "",
    content: "",
    startTimeLocal: toDatetimeLocalValue(start),
    endTimeLocal: toDatetimeLocalValue(end),
    isDone: false,
  };
}

export function formFromTask(task) {
  const start = toDate(task.startTimeUtc) || createDateForSelectedDay(new Date());
  const end = toDate(task.endTimeUtc) || getDefaultEndDate(start);

  return {
    title: task.title || "",
    content: task.content || "",
    startTimeLocal: toDatetimeLocalValue(start),
    endTimeLocal: toDatetimeLocalValue(end),
    isDone: Boolean(task.isDone),
  };
}

export function payloadFromForm(form) {
  const start = fromDatetimeLocalValue(form.startTimeLocal);
  const end = fromDatetimeLocalValue(form.endTimeLocal);

  return {
    title: form.title,
    content: form.content,
    isDone: form.isDone,
    startTimeUtc: start?.toISOString() || null,
    endTimeUtc: end?.toISOString() || null,
  };
}

export function validateTaskForm(form) {
  const start = fromDatetimeLocalValue(form.startTimeLocal);
  const end = fromDatetimeLocalValue(form.endTimeLocal);

  if (!form.title.trim()) return "Title is required.";
  if (!start || !end) return "Start and end time are required.";
  if (end <= start) return "End time must be after start time.";

  return "";
}
