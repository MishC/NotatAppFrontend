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
    await refreshAccessToken();
    return apiRequest({ url, method, body, expectJson, retry: false });
  }

  if (!res.ok) {
    const payload = await readBody(res);
    const msg =
      (typeof payload === "string" && payload) ||
      payload?.message ||
      payload?.error ||
      `HTTP error! status: ${res.status}`;
    throw new Error(msg);
  }

  return expectJson ? readBody(res) : null;
}

export async function fetchFoldersApi({ API_URL2 }) {
  return (await apiRequest({ url: API_URL2 })) || [];
}

export async function fetchNotesApi({ API_URL, activeFolder }) {
  const url = activeFolder === 4 ? `${API_URL}/done` : `${API_URL}/pending`;
  return (await apiRequest({ url })) || [];
}

export async function addNoteApi({ API_URL, newNote }) {
  return apiRequest({ url: API_URL, method: "POST", body: newNote });
}

export async function deleteNoteApi({ API_URL, id }) {
  await apiRequest({ url: `${API_URL}/${id}`, method: "DELETE", expectJson: false });
  return true;
}

export async function updateNoteApi({ API_URL, noteId, payload }) {
  await apiRequest({ url: `${API_URL}/${noteId}`, method: "PUT", body: payload, expectJson: false });
  return true;
}

export async function swapNotesApi({ API_URL, sourceId, targetId }) {
  await apiRequest({
    url: `${API_URL}/swap`,
    method: "POST",
    body: { SourceId: sourceId, TargetId: targetId },
    expectJson: false,
  });
  return true;
}
