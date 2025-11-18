const API_LOGIN = `${window.location.origin}/api/auth/login`;
const API_OTC = `${window.location.origin}/api/auth/verify-2fa`;
const API_NEW=`/api/auth/register`;

export async function register(email, password, phoneNumber) {
  const r = await fetch(API_NEW, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, phoneNumber })
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(txt || "Subscription failed");
  }

  return r.json();
}


export async function loginStart(email, password, channel) {
  const r = await fetch(API_LOGIN, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    credentials: "include",
    body: JSON.stringify({ email, password, channel })
  });
  if (!r.ok) throw new Error("Login failed");
  return r.json();
}

export async function verify2fa(flowId, code, channel) {
  const r = await fetch(API_OTC, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    credentials: "include",
    body: JSON.stringify({ flowId, code, channel })
  });
  if (!r.ok) throw new Error("Invalid code");
  return r.json();
}
