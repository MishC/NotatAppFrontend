import { todayYYYYMMDD } from "./dateHelpers";
import { useEffect } from "react";

export function getNotesApiUrl() {
  return import.meta.env.VITE_API_URL + "/api/notes";
}

export function getFoldersApiUrl() {
  return import.meta.env.VITE_API_URL + "/api/folders";
}

export function validateNote(newNote, guest) {
  if (!newNote.title.trim()) {
    return "Title is required.";
  }

  if (newNote?.scheduledAt !== undefined) {
    (typeof newNote.scheduledAt === "string")
      ? (newNote.scheduledAt.trim() || null)
      : newNote.scheduledAt
   }

  if (newNote?.scheduledAt < todayYYYYMMDD()) {
    return "Scheduled date cannot be in the past.";
  }
  return null;
}
export function normalizeFolderId(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const t = v.trim();
    if (t === "") return null;
    const num = Number(t);
    return Number.isFinite(num) ? num : null;
  }
  return null;
};
export function buildPayload(newNote, guest) {
  const folderId = normalizeFolderId(newNote.folderId);
  const validationError = validateNote(newNote, guest);
  if (validationError) {
    throw new Error(validationError);
  } 
  return {
    title: (newNote.title || "").trim(),
    content: newNote.content?.trim() || null,
    folderId: guest ? null : folderId,
    scheduledAt: newNote.scheduledAt || null,
  };
}


export function createEmptyNote() {
  return {
    title: "",
    content: "",
    folderId: "",
    scheduledAt: null
  };
}

export function useAutoClearMessage(value, setValue, ms = 4000) {
  useEffect(() => {
    if (!value) return;
    const t = setTimeout(() => setValue(""), ms);
    return () => clearTimeout(t);
  }, [value, setValue, ms]);
}



