const API_LOGIN = "/api/auth/login";
const API_VERIFY_2FA = "/api/auth/verify-2fa";
const API_REGISTER = "/api/auth/register";
const API_LOGOUT = "/api/auth/logout";

/**helper function **/
async function apiJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP error! status: ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
/**end of helper function **/

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
