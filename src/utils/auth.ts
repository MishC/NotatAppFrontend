const API_LOGIN = `${window.location.origin}/api/auth/login`;
const API_OTC = `${window.location.origin}/api/auth/verify-2fa`;


export async function loginStart(email: string, password: string, channel: "email" | "sms") {
  const r = await fetch(API_LOGIN, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    credentials: "include",
    body: JSON.stringify({ email, password, channel })
  });
  if (!r.ok) throw new Error("Login failed");
  return r.json() as Promise<{ flowId: string }>;
}

export async function verify2fa(flowId: string, code: string, channel: "email" | "sms") {
  const r = await fetch(API_OTC, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    credentials: "include",
    body: JSON.stringify({ flowId, code, channel })
  });
  if (!r.ok) throw new Error("Invalid code");
  return r.json() as Promise<{ accessToken: string }>;
}
