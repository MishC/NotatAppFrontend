import { refreshAccessToken } from "./authApi";

const isGuest = () => localStorage.getItem("guest") === "true";

function getTasksBaseUrl(API_URL) {
  if (!API_URL) throw new Error("API_URL is required");

  const base = String(API_URL).replace(/\/$/, "");
  return base.endsWith("/tasks") ? base : `${base}/tasks`;
}

async function readBody(res) {
  const ct = res.headers.get("content-type") || "";

  if (res.status === 204) return null;
  if (ct.includes("application/json")) return res.json().catch(() => null);

  return res.text().catch(() => null);
}

async function apiRequest({
  url,
  method = "GET",
  body,
  expectJson = true,
  retry = true,
}) {
  const token = localStorage.getItem("accessToken");
  const guest = isGuest();
  const headers = { "Content-Type": "application/json" };

  if (token && !guest) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry && !guest && token) {
    try {
      await refreshAccessToken();
      return apiRequest({ url, method, body, expectJson, retry: false });
    } catch {
      localStorage.removeItem("accessToken");
      window.location.href = "/auth";
      throw new Error("Unauthorized");
    }
  }

  if (!res.ok) {
    const payload = await readBody(res);
    const msg =
      (typeof payload === "string" && payload) ||
      payload?.message ||
      payload?.error ||
      `HTTP error! status: ${res.status}`;

    if (res.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/auth";
    }

    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return expectJson ? readBody(res) : null;
}

export async function fetchTaskHealthApi({ API_URL } = {}) {
  const url = `${getTasksBaseUrl(API_URL)}/health`;
  return apiRequest({ url, method: "GET" });
}

export async function fetchTasksApi({ API_URL } = {}) {
  return apiRequest({ url: getTasksBaseUrl(API_URL), method: "GET" });
}

export async function fetchPendingTasksApi({ API_URL } = {}) {
  const url = `${getTasksBaseUrl(API_URL)}/pending`;
  return apiRequest({ url, method: "GET" });
}

export async function fetchDoneTasksApi({ API_URL } = {}) {
  const url = `${getTasksBaseUrl(API_URL)}/done`;
  return apiRequest({ url, method: "GET" });
}

export async function fetchOverdueTasksApi({ API_URL } = {}) {
  const url = `${getTasksBaseUrl(API_URL)}/overdues`;
  return apiRequest({ url, method: "GET" });
}

export async function fetchOverdueTasksCountApi({ API_URL } = {}) {
  const url = `${getTasksBaseUrl(API_URL)}/overdue/count`;
  return apiRequest({ url, method: "GET" });
}

export async function fetchTaskByIdApi({ API_URL, id } = {}) {
  if (id == null) throw new Error("Task ID is required");

  const url = `${getTasksBaseUrl(API_URL)}/${encodeURIComponent(id)}`;
  return apiRequest({ url, method: "GET" });
}

export async function fetchIsTaskOverdueApi({ API_URL, id } = {}) {
  if (id == null) throw new Error("Task ID is required");

  const url = `${getTasksBaseUrl(API_URL)}/overdue/${encodeURIComponent(id)}`;
  return apiRequest({ url, method: "GET" });
}

export async function createTaskApi({ API_URL, task } = {}) {
  if (!task) throw new Error("Task payload is required");

  return apiRequest({
    url: getTasksBaseUrl(API_URL),
    method: "POST",
    body: task,
  });
}

export async function updateTaskApi({ API_URL, id, task } = {}) {
  if (id == null) throw new Error("Task ID is required");
  if (!task) throw new Error("Task payload is required");

  await apiRequest({
    url: `${getTasksBaseUrl(API_URL)}/${encodeURIComponent(id)}`,
    method: "PUT",
    body: task,
    expectJson: false,
  });

  return true;
}

export async function deleteTaskApi({ API_URL, id } = {}) {
  if (id == null) throw new Error("Task ID is required");

  await apiRequest({
    url: `${getTasksBaseUrl(API_URL)}/${encodeURIComponent(id)}`,
    method: "DELETE",
    expectJson: false,
  });

  return true;
}

export const fetchTaksApi = fetchTasksApi;
