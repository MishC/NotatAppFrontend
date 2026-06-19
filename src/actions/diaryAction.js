import {
  fetchDiaryEntriesApi,
  createDiaryEntryApi,
  updateDiaryEntryApi,
  createDiaryPageApi,
  updateDiaryPageApi,
  fetchDiaryEntryImageBlobUrlApi,
  fetchDiaryPageImageBlobUrlApi,
  deleteDiaryPageApi,
  deleteDiaryEntryByIdApi,
  deleteDiaryEntriesByDateApi,
} from "../backend/diaryApi";

const load = (k) => JSON.parse(localStorage.getItem(k) || "[]");
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function normalizePage(page) {
  if (!page) return null;

  return {
    id: page.id ?? page.Id,
    pageNumber: page.pageNumber ?? page.PageNumber,
    content: page.content ?? page.Content ?? "",
    hasImage: page.hasImage ?? page.HasImage ?? false,
    imageFileName: page.imageFileName ?? page.ImageFileName ?? null,
    createdAt: page.createdAt ?? page.CreatedAt ?? null,
    updatedAt: page.updatedAt ?? page.UpdatedAt ?? null,
    imageUploadedAt: page.imageUploadedAt ?? page.ImageUploadedAt ?? null,
  };
}

function normalizeEntry(entry) {
  if (!entry) return null;

  const pages = entry.pages ?? entry.Pages ?? [];

  return {
    id: entry.id ?? entry.Id,
    title: entry.title ?? entry.Title ?? "",
    date: entry.date ?? entry.Date,
    createdAt: entry.createdAt ?? entry.CreatedAt ?? null,
    updatedAt: entry.updatedAt ?? entry.UpdatedAt ?? null,
    pages: pages
      .map(normalizePage)
      .filter(Boolean)
      .sort((a, b) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0)),
  };
}

function normalizeEntries(entries) {
  return (entries || []).map(normalizeEntry).filter(Boolean);
}

function validateImage(image) {
  if (!image) return null;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(image.type)) {
    return "Only JPG, PNG and WEBP images are allowed.";
  }

  if (image.size > 5 * 1024 * 1024) {
    return "Image is too large. Max size is 5 MB.";
  }

  return null;
}

function validateDiaryEntry(entry) {
  if (!entry) return "Diary entry is required.";

  const title = entry.title?.trim();

  if (!title) return "Title is required.";
  if (title.length > 150) return "Title cannot be longer than 150 characters.";

  if (!entry.date) return "Date is required.";

  if (entry.content && entry.content.length > 20000) {
    return "Content cannot be longer than 20000 characters.";
  }

  return validateImage(entry.image);
}

function validateDiaryEntryUpdate(fields) {
  if (!fields) return "Updated fields are required.";

  if (fields.title !== undefined) {
    const title = fields.title?.trim();

    if (!title) return "Title cannot be empty.";
    if (title.length > 150) {
      return "Title cannot be longer than 150 characters.";
    }
  }

  return null;
}

function validateDiaryPage(page) {
  if (!page) return "Diary page is required.";

  if (page.pageNumber !== undefined && page.pageNumber !== null) {
    const n = Number(page.pageNumber);

    if (!Number.isInteger(n) || n < 1 || n > 100) {
      return "Page number must be between 1 and 100.";
    }
  }

  if (page.content && page.content.length > 20000) {
    return "Content cannot be longer than 20000 characters.";
  }

  return validateImage(page.image);
}

function buildDiaryEntryFormData(entry = {}) {
  const formData = new FormData();

  if (entry.title !== undefined) {
    formData.append("title", entry.title ?? "");
  }

  if (entry.date !== undefined) {
    formData.append("date", entry.date);
  }

  // Content/Image here are for first page during CREATE.
  if (entry.content !== undefined) {
    formData.append("content", entry.content ?? "");
  }

  if (entry.image) {
    formData.append("image", entry.image);
  }

  return formData;
}

function buildDiaryPageFormData(page = {}) {
  const formData = new FormData();

  if (page.pageNumber !== undefined) {
    formData.append("pageNumber", String(page.pageNumber));
  }

  if (page.content !== undefined) {
    formData.append("content", page.content ?? "");
  }

  if (page.image) {
    formData.append("image", page.image);
  }

  if (page.removeImage !== undefined) {
    formData.append("removeImage", String(page.removeImage));
  }

  return formData;
}

function sortPages(pages = []) {
  return [...pages].sort(
    (a, b) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0)
  );
}

function replaceEntry(entries, updatedEntry) {
  return (entries || []).map((entry) =>
    String(entry.id) === String(updatedEntry.id)
      ? normalizeEntry(updatedEntry)
      : entry
  );
}

function replacePageInEntries(entries, updatedPage) {
  return (entries || []).map((entry) => {
    const pages = entry.pages || [];

    const hasPage = pages.some(
      (p) => String(p.id) === String(updatedPage.id)
    );

    if (!hasPage) return entry;

    return {
      ...entry,
      pages: sortPages(
        pages.map((p) =>
          String(p.id) === String(updatedPage.id)
            ? normalizePage(updatedPage)
            : p
        )
      ),
    };
  });
}

function addPageToEntry(entries, entryId, page) {
  const normalizedPage = normalizePage(page);

  return (entries || []).map((entry) =>
    String(entry.id) === String(entryId)
      ? {
          ...entry,
          pages: sortPages([...(entry.pages || []), normalizedPage]),
        }
      : entry
  );
}

function removePageFromEntries(entries, pageId) {
  return (entries || []).map((entry) => ({
    ...entry,
    pages: (entry.pages || []).filter(
      (page) => String(page.id) !== String(pageId)
    ),
  }));
}

/* 1) INITIAL LOAD */
export async function initDiaryEntriesAction({
  guest,
  API_URL_DIARY,
  date,
  setDiaryEntries,
  setLoading,
  setError,
}) {
  setLoading?.(true);

  if (guest) {
    const savedDiary = load("noteapp_guest_diary") || [];

    const filtered = date
      ? savedDiary.filter((entry) => entry.date === date)
      : savedDiary;

    setDiaryEntries?.(normalizeEntries(filtered));
    setLoading?.(false);
    return true;
  }

  try {
    const entries = await fetchDiaryEntriesApi({
      API_URL_DIARY,
      date,
    });

    setDiaryEntries?.(normalizeEntries(entries));
    return true;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Loading diary entries failed.");
    return false;
  } finally {
    setLoading?.(false);
  }
}

/* 2) SYNC GUEST */
export function syncGuestDiaryAction({ guest, diaryEntries }) {
  if (!guest) return;

  save("noteapp_guest_diary", diaryEntries || []);
}

/* 3) CREATE DIARY ENTRY */
export async function createDiaryEntryAction({
  guest,
  API_URL_DIARY,
  diaryEntries,
  setDiaryEntries,
  setMsg,
  setError,
  newEntry,
}) {
  const validationError = validateDiaryEntry(newEntry);

  if (validationError) {
    setError?.(validationError);
    return false;
  }

  if (guest) {
    const now = new Date().toISOString();

    const created = {
      id: crypto.randomUUID(),
      title: newEntry.title.trim(),
      date: newEntry.date,
      createdAt: now,
      updatedAt: null,
      pages: [
        {
          id: crypto.randomUUID(),
          pageNumber: 1,
          content: newEntry.content ?? "",
          hasImage: false,
          imageFileName: newEntry.image?.name ?? null,
          createdAt: now,
          updatedAt: null,
          imageUploadedAt: newEntry.image ? now : null,
        },
      ],
    };

    setDiaryEntries?.((prev) =>
      sortEntriesByDate([...(prev || []), created])
    );

    setMsg?.("Diary entry added (guest mode).");
    return true;
  }

  try {
    const formData = buildDiaryEntryFormData({
      title: newEntry.title.trim(),
      date: newEntry.date,
      content: newEntry.content ?? "",
      image: newEntry.image,
    });

    const created = await createDiaryEntryApi({
      API_URL_DIARY,
      formData,
    });

    const normalized = normalizeEntry(created);

    setDiaryEntries?.([...(diaryEntries || []), normalized]);
    setMsg?.("Diary entry added.");
    return normalized;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Error adding diary entry.");
    return false;
  }
}

/* 4) UPDATE DIARY ENTRY: title/date only */
export async function updateDiaryEntryAction({
  guest,
  API_URL_DIARY,
  entryId,
  updatedFields,
  selectedEntry,
  entryById,
  activeDate,
  setDiaryEntries,
  setLoading,
  setError,
  setMsg,
  setIsModalOpen,
  setSelectedEntry,
}) {
  const base = selectedEntry ?? entryById?.get(String(entryId));

  if (!base) {
    setError?.("No base diary entry found for update.");
    return false;
  }

  const validationError = validateDiaryEntryUpdate(updatedFields);

  if (validationError) {
    setError?.(validationError);
    return false;
  }

  const payload = {
    title:
      updatedFields.title !== undefined
        ? updatedFields.title.trim()
        : base.title,

    date:
      updatedFields.date !== undefined
        ? updatedFields.date
        : base.date,
  };

  if (guest) {
    setDiaryEntries?.((prev) =>
      (prev || []).map((entry) =>
        String(entry.id) === String(entryId)
          ? {
              ...entry,
              ...payload,
              updatedAt: new Date().toISOString(),
            }
          : entry
      )
    );

    setMsg?.("Diary entry updated (guest mode).");
    setIsModalOpen?.(false);
    setSelectedEntry?.(null);
    return true;
  }

  try {
    const formData = buildDiaryEntryFormData(payload);

    await updateDiaryEntryApi({
      API_URL_DIARY,
      id: entryId,
      formData,
    });

    setMsg?.("Diary entry updated.");

    if (activeDate) {
      setLoading?.(true);

      const list = await fetchDiaryEntriesApi({
        API_URL_DIARY,
        date: activeDate,
      });

      setDiaryEntries?.(normalizeEntries(list));
    } else {
      setDiaryEntries?.((prev) =>
        (prev || []).map((entry) =>
          String(entry.id) === String(entryId)
            ? {
                ...entry,
                ...payload,
                updatedAt: new Date().toISOString(),
              }
            : entry
        )
      );
    }

    setIsModalOpen?.(false);
    setSelectedEntry?.(null);
    return true;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Error updating diary entry.");
    return false;
  } finally {
    setLoading?.(false);
  }
}

/* 5) CREATE DIARY PAGE */
export async function createDiaryPageAction({
  guest,
  API_URL_DIARY,
  entryId,
  newPage,
  activeDate,
  setDiaryEntries,
  setLoading,
  setMsg,
  setError,
}) {
  const validationError = validateDiaryPage(newPage);

  if (validationError) {
    setError?.(validationError);
    return false;
  }

  if (guest) {
    const now = new Date().toISOString();

    const createdPage = {
      id: crypto.randomUUID(),
      pageNumber: Number(newPage.pageNumber),
      content: newPage.content ?? "",
      hasImage: false,
      imageFileName: newPage.image?.name ?? null,
      createdAt: now,
      updatedAt: null,
      imageUploadedAt: newPage.image ? now : null,
    };

    setDiaryEntries?.((prev) => addPageToEntry(prev, entryId, createdPage));
    setMsg?.("Page added (guest mode).");
    return createdPage;
  }

  try {
    const formData = buildDiaryPageFormData({
      pageNumber: newPage.pageNumber,
      content: newPage.content ?? "",
      image: newPage.image,
    });

    const createdPage = await createDiaryPageApi({
      API_URL_DIARY,
      entryId,
      formData,
    });

    const normalizedPage = normalizePage(createdPage);

    if (activeDate) {
      setLoading?.(true);

      const list = await fetchDiaryEntriesApi({
        API_URL_DIARY,
        date: activeDate,
      });

      setDiaryEntries?.(normalizeEntries(list));
    } else {
      setDiaryEntries?.((prev) =>
        addPageToEntry(prev, entryId, normalizedPage)
      );
    }

    setMsg?.("Page added.");
    return normalizedPage;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Error adding page.");
    return false;
  } finally {
    setLoading?.(false);
  }
}

/* 6) UPDATE DIARY PAGE */
export async function updateDiaryPageAction({
  guest,
  API_URL_DIARY,
  pageId,
  updatedFields,
  activeDate,
  setDiaryEntries,
  setLoading,
  setError,
  setMsg,
  setIsModalOpen,
  setSelectedPage,
}) {
  const validationError = validateDiaryPage(updatedFields);

  if (validationError) {
    setError?.(validationError);
    return false;
  }

  if (guest) {
    setDiaryEntries?.((prev) =>
      (prev || []).map((entry) => ({
        ...entry,
        pages: sortPages(
          (entry.pages || []).map((page) =>
            String(page.id) === String(pageId)
              ? {
                  ...page,
                  content:
                    updatedFields.content !== undefined
                      ? updatedFields.content
                      : page.content,
                  pageNumber:
                    updatedFields.pageNumber !== undefined
                      ? Number(updatedFields.pageNumber)
                      : page.pageNumber,
                  hasImage: updatedFields.removeImage
                    ? false
                    : updatedFields.image
                      ? true
                      : page.hasImage,
                  imageFileName: updatedFields.removeImage
                    ? null
                    : updatedFields.image?.name ?? page.imageFileName,
                  updatedAt: new Date().toISOString(),
                  imageUploadedAt: updatedFields.image
                    ? new Date().toISOString()
                    : updatedFields.removeImage
                      ? null
                      : page.imageUploadedAt,
                }
              : page
          )
        ),
      }))
    );

    setMsg?.("Page updated (guest mode).");
    setIsModalOpen?.(false);
    setSelectedPage?.(null);
    return true;
  }

  try {
    const formData = buildDiaryPageFormData({
      content: updatedFields.content,
      pageNumber: updatedFields.pageNumber,
      image: updatedFields.image,
      removeImage: updatedFields.removeImage,
    });

    await updateDiaryPageApi({
      API_URL_DIARY,
      pageId,
      formData,
    });

    setMsg?.("Page updated.");

    if (activeDate) {
      setLoading?.(true);

      const list = await fetchDiaryEntriesApi({
        API_URL_DIARY,
        date: activeDate,
      });

      setDiaryEntries?.(normalizeEntries(list));
    }

    setIsModalOpen?.(false);
    setSelectedPage?.(null);
    return true;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Error updating page.");
    return false;
  } finally {
    setLoading?.(false);
  }
}

/* 7) DELETE DIARY PAGE */
export async function deleteDiaryPageAction({
  guest,
  API_URL_DIARY,
  pageId,
  activeDate,
  setDiaryEntries,
  setLoading,
  setMsg,
  setError,
}) {
  if (guest) {
    setDiaryEntries?.((prev) => removePageFromEntries(prev, pageId));
    setMsg?.("Page deleted (guest mode).");
    return true;
  }

  try {
    await deleteDiaryPageApi({
      API_URL_DIARY,
      pageId,
    });

    if (activeDate) {
      setLoading?.(true);

      const list = await fetchDiaryEntriesApi({
        API_URL_DIARY,
        date: activeDate,
      });

      setDiaryEntries?.(normalizeEntries(list));
    } else {
      setDiaryEntries?.((prev) => removePageFromEntries(prev, pageId));
    }

    setMsg?.("Page deleted.");
    return true;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Error deleting page.");
    return false;
  } finally {
    setLoading?.(false);
  }
}

/* 8) DELETE DIARY ENTRY BY ID */
export async function deleteDiaryEntryByIdAction({
  guest,
  API_URL_DIARY,
  id,
  setDiaryEntries,
  setMsg,
  setError,
}) {
  if (guest) {
    setDiaryEntries?.((prev) =>
      (prev || []).filter((entry) => String(entry.id) !== String(id))
    );

    setMsg?.("Diary entry deleted (guest mode).");
    return true;
  }

  try {
    await deleteDiaryEntryByIdApi({
      API_URL_DIARY,
      id,
    });

    setDiaryEntries?.((prev) =>
      (prev || []).filter((entry) => String(entry.id) !== String(id))
    );

    setMsg?.("Diary entry deleted.");
    return true;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Error deleting diary entry.");
    return false;
  }
}

/* 9) DELETE DIARY ENTRIES BY DATE */
export async function deleteDiaryEntriesByDateAction({
  guest,
  API_URL_DIARY,
  date,
  setDiaryEntries,
  setMsg,
  setError,
}) {
  if (guest) {
    setDiaryEntries?.((prev) =>
      (prev || []).filter((entry) => entry.date !== date)
    );

    setMsg?.("Diary entries deleted for this date (guest mode).");
    return true;
  }

  try {
    await deleteDiaryEntriesByDateApi({
      API_URL_DIARY,
      date,
    });

    setDiaryEntries?.((prev) =>
      (prev || []).filter((entry) => entry.date !== date)
    );

    setMsg?.("Diary entries deleted for this date.");
    return true;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Error deleting diary entries.");
    return false;
  }
}

/* 10) LOAD ENTRY IMAGE - old endpoint /api/diary/{id}/image */
export async function loadDiaryEntryImageAction({
  API_URL_DIARY,
  id,
  setImageUrl,
  setError,
}) {
  try {
    const url = await fetchDiaryEntryImageBlobUrlApi({
      API_URL_DIARY,
      id,
    });

    setImageUrl?.(url);
    return url;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Could not load diary image.");
    return false;
  }
}

/* 11) LOAD PAGE IMAGE - main endpoint /api/diary/pages/{pageId}/image */
export async function loadDiaryPageImageAction({
  API_URL_DIARY,
  pageId,
  setImageUrl,
  setError,
}) {
  try {
    const url = await fetchDiaryPageImageBlobUrlApi({
      API_URL_DIARY,
      pageId,
    });

    setImageUrl?.(url);
    return url;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Could not load diary page image.");
    return false;
  }
}

/* 12) MODAL OPEN/CLOSE - ENTRY */
export function toggleDiaryEntryModalAction(
  entry,
  setIsModalOpen,
  setSelectedEntry
) {
  if (!entry) {
    setIsModalOpen(false);
    setSelectedEntry(null);
    return true;
  }

  setSelectedEntry(entry);
  setIsModalOpen(true);
  return true;
}

/* 13) MODAL OPEN/CLOSE - PAGE */
export function toggleDiaryPageModalAction(
  page,
  setIsModalOpen,
  setSelectedPage
) {
  if (!page) {
    setIsModalOpen(false);
    setSelectedPage(null);
    return true;
  }

  setSelectedPage(page);
  setIsModalOpen(true);
  return true;
}

function sortEntriesByDate(entries = []) {
  return [...entries].sort((a, b) => {
    const ad = a.date ?? "";
    const bd = b.date ?? "";
    return bd.localeCompare(ad);
  });
}