const API_LOGIN = "/api/auth/login";
const API_VERIFY_2FA = "/api/auth/verify-2fa";
const API_REGISTER = "/api/auth/register";
const API_LOGOUT = "/api/auth/logout";
const API_REFRSH = "/api/auth/refresh"

/* refresh token */

let refreshPromise = null;

export async function refreshAccessToken() {
  // Single-flight: if a refresh is already in progress, reuse it
  if (refreshPromise) return refreshPromise;

  const url = `${API_REFRESH}`;

  refreshPromise = (async () => {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",                 // HttpOnly cookie
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("refresh_failed");

    const data = await res.json();            // expects { accessToken }
    const accessToken = data?.accessToken;
    if (!accessToken) throw new Error("no_access_token");

    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

/**helper function **/
async function apiJson(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      ...(options.headers || {}),
    },
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    const txt = await res.text();
    if (txt === "Unauthorized") {
      store.dispatch(resetAuth());
    }
    throw new Error(txt || `HTTP error! status: ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}


/**1st layer: calling backend endpoints**/

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
  await fetch(API_LOGOUT, {
    method: "POST",
    credentials: "include",
  });
}
