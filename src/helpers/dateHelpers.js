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
  { value: "ddmmyyyy", label: "DD-MM-YYYY" },
  { value: "dayMonthYear", label: "DD. Month YYYY" },
  { value: "monthOrdinalYear", label: "Month of D(th), YYYY" },
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

export function formatDiaryTitleDate(ymd, format = "ddmmyyyy") {
  const date = toLocalDate(ymd);
  if (!date) return ymd || "";

  const year = date.getFullYear();
  const day = date.getDate();

  if (format === "dayMonthYear" || format === "skLong") {
    const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
    return `${day}. ${month} ${year}`;
  }

  if (format === "monthOrdinalYear" || format === "enLong") {
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

  const monthsByName = {
    january: 1,
    jan: 1,
    februar: 2,
    february: 2,
    feb: 2,
    marec: 3,
    march: 3,
    mar: 3,
    april: 4,
    apr: 4,
    maj: 5,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    august: 8,
    aug: 8,
    september: 9,
    sep: 9,
    sept: 9,
    oktober: 10,
    october: 10,
    oct: 10,
    november: 11,
    nov: 11,
    december: 12,
    dec: 12,
  };

  const normalizeMonthName = (month) =>
    String(month || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

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

  const longMonthMatch = value.match(/^(\d{1,2})\.?\s*([a-zA-Z\u00C0-\u017F]+)\s+(\d{4})$/);
  if (longMonthMatch) {
    const [, d, monthName, y] = longMonthMatch;
    const month = monthsByName[normalizeMonthName(monthName)];
    if (month) return toValidYMD(y, month, d);
  }

  const monthOrdinalMatch = value.match(/^([a-zA-Z\u00C0-\u017F]+)\s+of\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/i);
  if (monthOrdinalMatch) {
    const [, monthName, d, y] = monthOrdinalMatch;
    const month = monthsByName[normalizeMonthName(monthName)];
    if (month) return toValidYMD(y, month, d);
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
