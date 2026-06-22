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

export function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfNextLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function isLocalMidnight(date) {
  return date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0;
}

function getAllDayDisplayEnd(start, end) {
  const startDay = startOfLocalDay(start);
  if (!end) return startOfNextLocalDay(startDay);

  const endDay = startOfLocalDay(end);
  if (isLocalMidnight(end) && endDay > startDay) return endDay;

  return startOfNextLocalDay(end);
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
  const isAllDay = Boolean(task.isAllDay);

  return {
    id: String(task.id),
    title: task.title || "(untitled task)",
    start: isAllDay && start ? startOfLocalDay(start) : start,
    end: isAllDay && start ? getAllDayDisplayEnd(start, end) : end,
    allDay: isAllDay,
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
    isAllDay: false,
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
    isAllDay: Boolean(task.isAllDay),
    isDone: Boolean(task.isDone),
  };
}

export function payloadFromForm(form) {
  const startValue = fromDatetimeLocalValue(form.startTimeLocal);
  const endValue = fromDatetimeLocalValue(form.endTimeLocal);
  const isAllDay = Boolean(form.isAllDay);
  const start = isAllDay && startValue ? startOfLocalDay(startValue) : startValue;
  const end = isAllDay && endValue ? startOfNextLocalDay(endValue) : endValue;

  return {
    title: form.title,
    content: form.content,
    isAllDay,
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
