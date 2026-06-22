import {
  createTaskApi,
  deleteTaskApi,
  fetchDoneTasksApi,
  fetchIsTaskOverdueApi,
  fetchOverdueTasksApi,
  fetchOverdueTasksCountApi,
  fetchPendingTasksApi,
  fetchTaskByIdApi,
  fetchTaskHealthApi,
  fetchTasksApi,
  updateTaskApi,
} from "../backend/calendarApi";

const GUEST_TASKS_KEY = "calendar_guest_tasks";

const load = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function buildCreateTaskPayload(task = {}) {
  return {
    title: String(task.title || "").trim(),
    content: task.content?.trim?.() || task.content || null,
    startTimeUtc: task.startTimeUtc || null,
    endTimeUtc: task.endTimeUtc || null,
  };
}

function buildUpdateTaskPayload(task = {}) {
  const payload = {};

  if (task.title !== undefined) payload.title = String(task.title || "").trim();
  if (task.content !== undefined) payload.content = task.content?.trim?.() || task.content || null;
  if (task.isDone !== undefined) payload.isDone = Boolean(task.isDone);
  if (task.startTimeUtc !== undefined) payload.startTimeUtc = task.startTimeUtc || null;
  if (task.endTimeUtc !== undefined) payload.endTimeUtc = task.endTimeUtc || null;

  return payload;
}

function getGuestTasksByFilter(tasks, filter = "all") {
  const now = new Date().toISOString();

  if (filter === "pending") return tasks.filter((task) => !task.isDone);
  if (filter === "done") return tasks.filter((task) => task.isDone);
  if (filter === "overdues") {
    return tasks.filter((task) => !task.isDone && task.endTimeUtc && task.endTimeUtc < now);
  }

  return tasks;
}

async function fetchTasksByFilter({ API_URL, filter = "all" }) {
  if (filter === "pending") return fetchPendingTasksApi({ API_URL });
  if (filter === "done") return fetchDoneTasksApi({ API_URL });
  if (filter === "overdues") return fetchOverdueTasksApi({ API_URL });

  return fetchTasksApi({ API_URL });
}

export function syncGuestCalendarTasksAction({ guest, tasks }) {
  if (!guest) return;
  save(GUEST_TASKS_KEY, tasks || []);
}

export async function getTaskHealthAction({ API_URL, setError } = {}) {
  try {
    return await fetchTaskHealthApi({ API_URL });
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Could not reach task service.");
    return null;
  }
}

export async function initCalendarTasksAction({
  guest,
  API_URL,
  filter = "all",
  setTasks,
  setLoading,
  setError,
} = {}) {
  setLoading?.(true);

  if (guest) {
    const tasks = getGuestTasksByFilter(load(GUEST_TASKS_KEY), filter);
    setTasks?.(tasks);
    setLoading?.(false);
    return true;
  }

  try {
    const tasks = await fetchTasksByFilter({ API_URL, filter });
    setTasks?.(Array.isArray(tasks) ? tasks : []);
    return true;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Could not load tasks.");
    return false;
  } finally {
    setLoading?.(false);
  }
}

export async function getCalendarTasksAction({ guest, API_URL, filter = "all", setError } = {}) {
  if (guest) return getGuestTasksByFilter(load(GUEST_TASKS_KEY), filter);

  try {
    const tasks = await fetchTasksByFilter({ API_URL, filter });
    return Array.isArray(tasks) ? tasks : [];
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Could not load tasks.");
    return [];
  }
}

export async function getTaskByIdAction({ guest, API_URL, id, setError } = {}) {
  if (guest) {
    return load(GUEST_TASKS_KEY).find((task) => String(task.id) === String(id)) || null;
  }

  try {
    return await fetchTaskByIdApi({ API_URL, id });
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Could not load task.");
    return null;
  }
}

export async function isTaskOverdueAction({ guest, API_URL, id, setError } = {}) {
  if (guest) {
    const task = load(GUEST_TASKS_KEY).find((item) => String(item.id) === String(id));
    return Boolean(task && !task.isDone && task.endTimeUtc && task.endTimeUtc < new Date().toISOString());
  }

  try {
    return Boolean(await fetchIsTaskOverdueApi({ API_URL, id }));
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Could not check overdue status.");
    return false;
  }
}

export async function getOverdueTasksCountAction({ guest, API_URL, setError } = {}) {
  if (guest) return getGuestTasksByFilter(load(GUEST_TASKS_KEY), "overdues").length;

  try {
    const payload = await fetchOverdueTasksCountApi({ API_URL });
    return Number(payload?.numberOfOverdue ?? 0) || 0;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Could not load overdue task count.");
    return 0;
  }
}

export async function createTaskAction({
  guest,
  API_URL,
  task,
  setTasks,
  setMsg,
  setError,
} = {}) {
  const payload = buildCreateTaskPayload(task);

  if (!payload.title) {
    setError?.("Task title is required.");
    return null;
  }

  if (guest) {
    const created = { ...payload, id: Date.now() };
    setTasks?.((prev) => [...(prev || []), created]);
    setMsg?.("Task created (guest mode).");
    return created;
  }

  try {
    const created = await createTaskApi({ API_URL, task: payload });
    setTasks?.((prev) => [...(prev || []), created]);
    setMsg?.("Task created.");
    return created;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Could not create task.");
    return null;
  }
}

export async function updateTaskAction({
  guest,
  API_URL,
  id,
  task,
  setTasks,
  setMsg,
  setError,
} = {}) {
  const payload = buildUpdateTaskPayload(task);

  if (id == null) {
    setError?.("Task ID is required.");
    return false;
  }

  if (guest) {
    setTasks?.((prev) =>
      (prev || []).map((item) => (String(item.id) === String(id) ? { ...item, ...payload, id } : item))
    );
    setMsg?.("Task updated (guest mode).");
    return true;
  }

  try {
    await updateTaskApi({ API_URL, id, task: payload });
    setTasks?.((prev) =>
      (prev || []).map((item) => (String(item.id) === String(id) ? { ...item, ...payload, id } : item))
    );
    setMsg?.("Task updated.");
    return true;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Could not update task.");
    return false;
  }
}

export async function deleteTaskAction({
  guest,
  API_URL,
  id,
  setTasks,
  setMsg,
  setError,
} = {}) {
  if (id == null) {
    setError?.("Task ID is required.");
    return false;
  }

  if (guest) {
    setTasks?.((prev) => (prev || []).filter((task) => String(task.id) !== String(id)));
    setMsg?.("Task deleted (guest mode).");
    return true;
  }

  try {
    await deleteTaskApi({ API_URL, id });
    setTasks?.((prev) => (prev || []).filter((task) => String(task.id) !== String(id)));
    setMsg?.("Task deleted.");
    return true;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Could not delete task.");
    return false;
  }
}
