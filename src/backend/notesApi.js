import { refreshAccessToken } from "./authApi";

const isGuest = () => localStorage.getItem("guest") === "true";

async function readBody(res) {
  const ct = res.headers.get("content-type") || "";
  if (res.status === 204) return null;
  if (ct.includes("application/json")) return res.json().catch(() => null);
  return res.text().catch(() => null);
}

async function apiRequest({ url, method = "GET", body, expectJson = true, retry = true }) {
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

export async function fetchFoldersApi({ API_URL2 } = {}) {
  if (!API_URL2) throw new Error("API_URL is required");
  return (await apiRequest({ url: API_URL2 })) || [];
}

export const OVERDUE_ID = "overdues";

export async function fetchNotesApi({ API_URL, activeFolder }) {
  let url;

  if (!API_URL) throw new Error("API_URL is required");

  if (activeFolder === OVERDUE_ID) url = `${API_URL}/overdues`;
  else if (activeFolder === 4) url = `${API_URL}/done`;
  else url = `${API_URL}/pending`;

  return (await apiRequest({ url, method: "GET" })) || [];
}

export async function fetchOverdueNotesApi({ API_URL } = {}) {
  if (!API_URL) throw new Error("API_URL is required");
  return apiRequest({ url: `${API_URL}/overdues`, method: "GET" });
}


export async function addNoteApi({ API_URL, newNote }) {
  if (!API_URL) throw new Error("API_URL is required"); 
  return apiRequest({ url: API_URL, method: "POST", body: newNote });
}

export async function deleteNoteApi({ API_URL, id }) {
  await apiRequest({ url: `${API_URL}/${id}`, method: "DELETE", expectJson: false });
  return true;
}

export async function updateNoteApi({ API_URL, noteId, payload }) {
  if (!API_URL) throw new Error("API_URL is required");
  await apiRequest({ url: `${API_URL}/${noteId}`, method: "PUT", body: payload, expectJson: false });
  return true;
}


export async function swapNotesApi({ API_URL, sourceId, targetId }) {
  if (!API_URL) throw new Error("API_URL is required");
  await apiRequest({
    url: `${API_URL}/swap`,
    method: "POST",
    body: { SourceId: sourceId, TargetId: targetId },
    expectJson: false,
  });
  return true;
}
