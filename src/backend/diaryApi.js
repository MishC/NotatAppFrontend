import { refreshAccessToken } from "./authApi";

const isGuest = () => localStorage.getItem("guest") === "true";

async function readBody(res) {
  const ct = res.headers.get("content-type") || "";

  if (res.status === 204) return null;

  if (ct.includes("application/json")) {
    return res.json().catch(() => null);
  }

  return res.text().catch(() => null);
}

async function apiRequest({
  url,
  method = "GET",
  body,
  expectJson = true,
  retry = true,
  isFormData = false,
}) {
  const token = localStorage.getItem("accessToken");
  const guest = isGuest();

  const headers = {};

  // IMPORTANT:
  // FormData !Content-Type 
  // Browser set up multipart/form-data; boundary=...
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !guest) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: body
      ? isFormData
        ? body
        : JSON.stringify(body)
      : undefined,
  });

  if (res.status === 401 && retry && !guest && token) {
    try {
      await refreshAccessToken();

      return apiRequest({
        url,
        method,
        body,
        expectJson,
        retry: false,
        isFormData,
      });
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

async function apiBlobUrlRequest({ url, retry = true }) {
  const token = localStorage.getItem("accessToken");
  const guest = isGuest();

  const headers = {};

  if (token && !guest) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (res.status === 401 && retry && !guest && token) {
    try {
      await refreshAccessToken();

      return apiBlobUrlRequest({
        url,
        retry: false,
      });
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

    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/* 1) GET /api/diary?date=YYYY-MM-DD */
export async function fetchDiaryEntriesApi({ API_URL_DIARY, date }) {
  if (!API_URL_DIARY) throw new Error("API_URL_DIARY is required");
  if (!date) throw new Error("Date is required");

  const url = `${API_URL_DIARY}?date=${encodeURIComponent(date)}`;

  return (await apiRequest({ url, method: "GET" })) || [];
}

/* 2) POST /api/diary */
export async function createDiaryEntryApi({ API_URL_DIARY, formData }) {
  if (!API_URL_DIARY) throw new Error("API_URL_DIARY is required");
  if (!formData) throw new Error("FormData is required");

  return apiRequest({
    url: API_URL_DIARY,
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

/* 3) PUT /api/diary/{id} */
export async function updateDiaryEntryApi({ API_URL_DIARY, id, formData }) {
  if (!API_URL_DIARY) throw new Error("API_URL_DIARY is required");
  if (id == null) throw new Error("Diary entry ID is required");
  if (!formData) throw new Error("FormData is required");

  await apiRequest({
    url: `${API_URL_DIARY}/${id}`,
    method: "PUT",
    body: formData,
    isFormData: true,
    expectJson: false,
  });

  return true;
}

/* 4) POST /api/diary/{entryId}/pages */
export async function createDiaryPageApi({
  API_URL_DIARY,
  entryId,
  formData,
}) {
  if (!API_URL_DIARY) throw new Error("API_URL_DIARY is required");
  if (entryId == null) throw new Error("Diary entry ID is required");
  if (!formData) throw new Error("FormData is required");

  return apiRequest({
    url: `${API_URL_DIARY}/${entryId}/pages`,
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

/* 5) PUT /api/diary/pages/{pageId} */
export async function updateDiaryPageApi({
  API_URL_DIARY,
  pageId,
  formData,
}) {
  if (!API_URL_DIARY) throw new Error("API_URL_DIARY is required");
  if (pageId == null) throw new Error("Diary page ID is required");
  if (!formData) throw new Error("FormData is required");

  await apiRequest({
    url: `${API_URL_DIARY}/pages/${pageId}`,
    method: "PUT",
    body: formData,
    isFormData: true,
    expectJson: false,
  });

  return true;
}

/* 6) GET /api/diary/{id}/image */
export async function fetchDiaryEntryImageBlobUrlApi({
  API_URL_DIARY,
  id,
}) {
  if (!API_URL_DIARY) throw new Error("API_URL_DIARY is required");
  if (id == null) throw new Error("Diary entry ID is required");

  return apiBlobUrlRequest({
    url: `${API_URL_DIARY}/${id}/image`,
  });
}

/* 7) GET /api/diary/pages/{pageId}/image */
export async function fetchDiaryPageImageBlobUrlApi({
  API_URL_DIARY,
  pageId,
}) {
  if (!API_URL_DIARY) throw new Error("API_URL_DIARY is required");
  if (pageId == null) throw new Error("Diary page ID is required");

  return apiBlobUrlRequest({
    url: `${API_URL_DIARY}/pages/${pageId}/image`,
  });
}

/* 8) DELETE /api/diary/pages/{pageId} */
export async function deleteDiaryPageApi({ API_URL_DIARY, pageId }) {
  if (!API_URL_DIARY) throw new Error("API_URL_DIARY is required");
  if (pageId == null) throw new Error("Diary page ID is required");

  await apiRequest({
    url: `${API_URL_DIARY}/pages/${pageId}`,
    method: "DELETE",
    expectJson: false,
  });

  return true;
}

/* 9) DELETE /api/diary/{id} */
export async function deleteDiaryEntryByIdApi({ API_URL_DIARY, id }) {
  if (!API_URL_DIARY) throw new Error("API_URL_DIARY is required");
  if (id == null) throw new Error("Diary entry ID is required");

  await apiRequest({
    url: `${API_URL_DIARY}/${id}`,
    method: "DELETE",
    expectJson: false,
  });

  return true;
}

/* 10) DELETE /api/diary/date/{date} */
export async function deleteDiaryEntriesByDateApi({
  API_URL_DIARY,
  date,
}) {
  if (!API_URL_DIARY) throw new Error("API_URL_DIARY is required");
  if (!date) throw new Error("Date is required");

  await apiRequest({
    url: `${API_URL_DIARY}/date/${encodeURIComponent(date)}`,
    method: "DELETE",
    expectJson: false,
  });

  return true;
}


