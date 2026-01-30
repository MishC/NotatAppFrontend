const API_PREFIX = "/api/auth";

const API_LOGIN = `${API_PREFIX}/login`;
const API_VERIFY_2FA = `${API_PREFIX}/verify-2fa`;
const API_REGISTER = `${API_PREFIX}/register`;
const API_LOGOUT = `${API_PREFIX}/logout`;
const API_REFRESH = `${API_PREFIX}/refresh`;

let refreshPromise = null;

////
function toMsg(body, status) {
  return typeof body === "string"
    ? body
    : body?.message || body?.error || `HTTP error! status: ${status}`;
}


export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const res = await fetch(API_REFRESH, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const body = await readBody(res);
      throw new Error(toMsg(body, res.status));
    }

    const data = await res.json().catch(() => null);
    const accessToken = data?.accessToken;
    if (!accessToken) throw new Error("no_access_token");

    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function readBody(res) {
  const ct = res.headers.get("content-type") || "";
  if (res.status === 204) return null;

  if (ct.includes("application/json")) {
    return res.json().catch(() => null);
  }

  const txt = await res.text().catch(() => "");
  try {
    return txt ? JSON.parse(txt) : null;
  } catch {
    return txt || null;
  }
}


/** helper **/
async function apiJson(url, options = {}) {
  const doFetch = (tokenOverride) => {
    const token = tokenOverride ?? localStorage.getItem("accessToken");
    return fetch(url, {
      ...options,
      credentials: "omit",
      headers: {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  let res = await doFetch();

  if (res.status === 401) {
    const newToken = await refreshAccessToken(); // may throw
    res = await doFetch(newToken);
  }

  if (!res.ok) {
    const body = await readBody(res);
    throw new Error(toMsg(body, res.status));
  }

  return readBody(res);
}

/** endpoints **/
export function registerApi(email, password, phoneNumber) {
  return apiJson(API_REGISTER, {
    method: "POST",
    body: JSON.stringify({ email, password, phoneNumber }),
  });
}

export function loginStartApi(email, password, channel) {
  return apiJson(API_LOGIN, {
    method: "POST",
    body: JSON.stringify({ email, password, channel }),
  });
}

export function verify2faApi(flowId, code, channel) {
  return apiJson(API_VERIFY_2FA, {
    method: "POST",
    body: JSON.stringify({ flowId, code, channel }),
  });
}

export async function logoutApi() {
  // logout clears refresh cookie
  const res = await fetch(API_LOGOUT, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await readBody(res);
    throw new Error(toMsg(body, res.status));
  }

  return true;
}