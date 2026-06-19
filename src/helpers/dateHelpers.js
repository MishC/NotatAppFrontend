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

export const DIARY_TITLE_DATE_FORMATS = [
  { value: "yyyyMMdd", label: "2026-06-19" },
  { value: "ddmmyyyy", label: "17-06-2026" },
  { value: "skLong", label: "4. januar 2026" },
  { value: "enLong", label: "January of 4th, 2026" },
];

function toLocalDate(ymd) {
  if (!ymd) return null;

  const [year, month, day] = String(ymd).split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function getOrdinalDay(day) {
  const mod10 = day % 10;
  const mod100 = day % 100;

  if (mod10 === 1 && mod100 !== 11) return `${day}st`;
  if (mod10 === 2 && mod100 !== 12) return `${day}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${day}rd`;
  return `${day}th`;
}

export function formatDiaryTitleDate(ymd, format = "yyyyMMdd") {
  const date = toLocalDate(ymd);
  if (!date) return ymd || "";

  const year = date.getFullYear();
  const day = date.getDate();

  if (format === "skLong") {
    const month = new Intl.DateTimeFormat("sk-SK", { month: "long" }).format(date);
    return `${day}. ${month} ${year}`;
  }

  if (format === "enLong") {
    const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
    return `${month} of ${getOrdinalDay(day)}, ${year}`;
  }

  if (format === "ddmmyyyy") {
    return formatDateDDMMYYYY(ymd);
  }

  return ymd;
}

export function parseDiaryDateInput(input) {
  const value = String(input || "").trim();
  if (!value) return "";

  const toValidYMD = (y, m, d) => {
    const year = Number(y);
    const month = Number(m);
    const day = Number(d);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return "";
    }

    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return toValidYMD(y, m, d);
  }

  const euMatch = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (euMatch) {
    const [, d, m, y] = euMatch;
    return toValidYMD(y, m, d);
  }

  const dashedEuMatch = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashedEuMatch) {
    const [, d, m, y] = dashedEuMatch;
    return toValidYMD(y, m, d);
  }

  const usMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, m, d, y] = usMatch;
    return toValidYMD(y, m, d);
  }

  return "";
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
