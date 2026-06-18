export function todayYYYYMMDD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}


export function formatDateDDMMYYYY(ymd) {
  if (!ymd) return "";

  const [y, m, d] = ymd.split("-");
  if (!y || !m || !d) return ymd;

  return `${d}-${m}-${y}`;
}


export function isOverdue(ymd) {
  if (!ymd) return false;
  return String(ymd).slice(0, 10) < todayYYYYMMDD();
}

export function getIsoWeekNumber(dateInput) {
  const date = new Date(dateInput);
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);
}
