import { refreshAccessToken } from "./authApi";

const isGuest = () => localStorage.getItem("guest") === "true";

function getAiBaseUrl(API_URL_AI) {
  const explicit = String(API_URL_AI || "").replace(/\/$/, "");

  if (explicit) {
    if (/\/api\/AI\/frame$/i.test(explicit)) return explicit.replace(/\/frame$/i, "");
    if (/\/api\/AI\/song$/i.test(explicit)) return explicit.replace(/\/song$/i, "");
    if (/\/api\/AI$/i.test(explicit)) return explicit;
    if (/\/api$/i.test(explicit)) return `${explicit}/AI`;
    return `${explicit}/api/AI`;
  }

  const base = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (!base) return "/api/AI";
  if (/\/api$/i.test(base)) return `${base}/AI`;
  return `${base}/api/AI`;
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
    err.url = url;
    err.method = method;
    throw err;
  }

  return expectJson ? readBody(res) : null;
}

export async function recommendSongApi({ API_URL_AI, diaryEntryId, style, country } = {}) {
  const id = Number(diaryEntryId);
  if (!Number.isFinite(id) || id <= 0) throw new Error("DiaryEntryId is required.");

  const url = `${getAiBaseUrl(API_URL_AI)}/song`;

  return apiRequest({
    url,
    method: "POST",
    body: {
      diaryEntryId: id,
      style: style || null,
      country: country || null,
    },
  });
}

export async function generateFrameApi({ API_URL_AI, description } = {}) {
  const value = String(description || "").trim();
  if (!value) throw new Error("Description is required.");

  const url = `${getAiBaseUrl(API_URL_AI)}/frame`;

  return apiRequest({
    url,
    method: "POST",
    body: {
      description: value,
    },
  });
}

export const getSongApi = recommendSongApi;
export const GetSong = recommendSongApi;
export const getFrameApi = generateFrameApi;
export const GenerateFrame = generateFrameApi;
