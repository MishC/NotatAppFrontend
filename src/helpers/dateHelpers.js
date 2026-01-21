export function todayYYYYMMDD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function isPastYMD(ymd) {
  if (!ymd) return false;
  return String(ymd) < todayYYYYMMDD();
}

export function formatDateDDMMYYYY(ymd) {
  if (!ymd) return "";

  // očakávame "YYYY-MM-DD"
  const [y, m, d] = ymd.split("-");
  if (!y || !m || !d) return ymd;

  return `${d}-${m}-${y}`;
}