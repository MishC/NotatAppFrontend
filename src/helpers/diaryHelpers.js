import { formatDiaryTitleDate, todayYYYYMMDD } from "./diaryDateHelpers";

const PAGE_PIXEL_TILE_COUNT = 144;

export const PAGE_MAX_HEIGHT = 650;
export const FONT_SIZE_STEP = 2;
export const DEFAULT_EDITOR_FONT_SIZE = 14;
export const DEFAULT_DIARY_DATE = todayYYYYMMDD();
export const DEFAULT_TITLE_FORMAT = "ddmmyyyy";
export const DEFAULT_ENTRY_TITLE = formatDiaryTitleDate(DEFAULT_DIARY_DATE, DEFAULT_TITLE_FORMAT);
export const DIARY_PAGE_IMAGE_PLACEHOLDER = "{{diary-page-image}}";
export const DIARY_IMAGE_ALIGN_CLASSES = ["diary-align-left", "diary-align-center", "diary-align-right"];

export function sanitizeFileName(value) {
  const fileName = String(value || "diary-entry")
    .trim()
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return fileName || "diary-entry";
}

export function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function createPagePixelTiles() {
  return Array.from({ length: PAGE_PIXEL_TILE_COUNT }, (_, index) => ({
    id: `${Date.now()}-${index}`,
    delay: `${Math.round(Math.random() * 700)}ms`,
    duration: `${350 + Math.round(Math.random() * 150)}ms`,
    tint: Math.random() > 0.72 ? "rgba(236, 253, 245, 0.98)" : "rgba(255, 255, 255, 0.98)",
  }));
}

export function getDiaryApiBase() {
  const explicit = (import.meta.env.VITE_API_DIARY || "").replace(/\/$/, "");
  if (explicit) return explicit;

  const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const apiBase = base.endsWith("/api") ? base : `${base}/api`;
  return `${apiBase}/diary`;
}

export function cssTextToStyle(cssText) {
  const allowedProperties = new Set([
    "background",
    "backgroundBlendMode",
    "backgroundColor",
    "backgroundImage",
    "backgroundPosition",
    "backgroundRepeat",
    "backgroundSize",
    "border",
    "borderColor",
    "borderRadius",
    "boxShadow",
  ]);

  return String(cssText || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((style, declaration) => {
      const colonIndex = declaration.indexOf(":");
      if (colonIndex <= 0) return style;

      const property = declaration
        .slice(0, colonIndex)
        .trim()
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      const value = declaration.slice(colonIndex + 1).trim();

      if (allowedProperties.has(property) && value) {
        style[property] = value;
      }

      return style;
    }, {});
}

export function htmlToText(html) {
  const container = document.createElement("div");
  container.innerHTML = html || "";
  return container.innerText || "";
}

// text: reads the current contentEditable page into a stable page snapshot.
export function getEditorSnapshot(editor) {
  return {
    html: editor?.innerHTML || "",
    text: editor?.innerText || "",
  };
}

// text: builds the page list used by the PDF export without mutating editor state.
export function buildPrintableDiaryPages(pages, pageIndex, editor) {
  return pages.map((page, index) => ({
    ...page,
    html: index === pageIndex ? editor?.innerHTML || "" : page.html || "",
  }));
}

// image/text: prepares editor HTML and local images for the diary backend payload.
export async function prepareDiaryPagesForSave({ pages, pageIndex, editor }) {
  return Promise.all(
    pages.map(async (page, index) => {
      const rawHtml = index === pageIndex ? editor?.innerHTML || "" : page.html || "";
      const prepared = await prepareDiaryPageForBackend(rawHtml, index + 1);

      return {
        ...page,
        html: rawHtml,
        contentForApi: prepared.content,
        text: index === pageIndex ? editor?.innerText || "" : page.text,
        image: prepared.image,
      };
    })
  );
}

// date/text: creates a blank diary page with a title derived from the selected date.
export function createEmptyDiaryPageForDate(normalizedDate, titleFormat) {
  return {
    id: null,
    pageNumber: 1,
    title: formatDiaryTitleDate(normalizedDate, titleFormat),
    html: "",
    text: "",
  };
}

// date/text: creates a new editor page and keeps its title aligned with the active date format.
export function createDiaryPageForIndex(index, diaryDate, titleFormat) {
  return {
    id: null,
    pageNumber: index + 1,
    title: formatDiaryTitleDate(diaryDate, titleFormat),
    html: "",
    text: "",
  };
}

// text: chooses which page should become active after deleting a diary page.
export function getPageIndexAfterDelete(pagesLength, pageIndex) {
  return pageIndex === pagesLength - 1 ? Math.max(0, pageIndex - 1) : pageIndex;
}

// text/date: converts the song dropdown value into the AI request style and optional country.
export function getSongRequestDetails(songPreference, localSongCountry) {
  const isLocalSongRequest = songPreference === "Local";

  return {
    isLocalSongRequest,
    contextLabel: isLocalSongRequest ? localSongCountry : "",
    apiStyle: isLocalSongRequest ? null : songPreference,
    apiCountry: isLocalSongRequest ? localSongCountry : null,
  };
}

function ensureDiaryImagesWrapped(container) {
  container.querySelectorAll("img").forEach((image) => {
    image.classList.add("diary-editor-image");
    image.draggable = false;

    const existingWrapper = image.closest(".diary-editor-image-wrap");
    if (existingWrapper) {
      existingWrapper.classList.add("diary-editor-image-wrap");
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "diary-editor-image-wrap diary-align-center";
    wrapper.style.textAlign = "center";
    image.replaceWith(wrapper);
    wrapper.appendChild(image);
  });
}

export function attachDiaryPageImageToHtml(html, imageUrl, alt = "Diary page image") {
  if (!imageUrl) return html || "";

  const imageHtml = `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(alt)}" class="diary-editor-image" draggable="false">`;
  const content = html || "";
  const container = document.createElement("div");

  if (content.includes(DIARY_PAGE_IMAGE_PLACEHOLDER)) {
    container.innerHTML = content.replaceAll(DIARY_PAGE_IMAGE_PLACEHOLDER, imageHtml);
    ensureDiaryImagesWrapped(container);
    return container.innerHTML;
  }

  container.innerHTML = `${content}${content ? "<br>" : ""}<div class="diary-editor-image-wrap diary-align-center" style="text-align: center;">${imageHtml}</div>`;
  ensureDiaryImagesWrapped(container);
  return container.innerHTML;
}

function getImageExtension(mimeType) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "png";
}

async function imageSrcToFile(src, fileName) {
  if (!src || (!src.startsWith("data:") && !src.startsWith("blob:"))) {
    return null;
  }

  const response = await fetch(src);
  const blob = await response.blob();
  const type = blob.type || "image/png";
  const extension = getImageExtension(type);
  const name = `${fileName || "diary-image"}.${extension}`;

  return new File([blob], name, { type });
}

async function extractFirstImageFileFromHtml(html, pageNumber) {
  const container = document.createElement("div");
  container.innerHTML = html || "";

  const image = container.querySelector("img[src]");
  if (!image) return null;

  const src = image.getAttribute("src");
  const isLocalImageSrc = src?.startsWith("data:") || src?.startsWith("blob:");

  if (!isLocalImageSrc) return null;

  const fallbackName = `diary-page-${pageNumber || 1}`;
  const rawName = image.getAttribute("alt") || fallbackName;
  const fileName = rawName.replace(/\.[a-z0-9]+$/i, "").replace(/[^\w.-]+/g, "-");

  return imageSrcToFile(src, fileName || fallbackName);
}

export async function prepareDiaryPageForBackend(html, pageNumber) {
  const container = document.createElement("div");
  container.innerHTML = html || "";
  ensureDiaryImagesWrapped(container);

  const image = container.querySelector("img[src]");
  if (!image) return { content: container.innerHTML, image: null };

  const src = image.getAttribute("src");
  const isLocalImageSrc = src?.startsWith("data:") || src?.startsWith("blob:");
  if (!isLocalImageSrc) return { content: container.innerHTML, image: null };

  const file = await extractFirstImageFileFromHtml(html, pageNumber);
  image.replaceWith(document.createTextNode(DIARY_PAGE_IMAGE_PLACEHOLDER));

  return { content: container.innerHTML, image: file };
}

export function normalizeLoadedDiaryPages(entry, fallbackTitle) {
  if (Array.isArray(entry?.pages) && entry.pages.length > 0) {
    return entry.pages.map((page, index) => {
      const html = page.content || page.html || "";

      return {
        id: page.id,
        pageNumber: page.pageNumber ?? index + 1,
        title: fallbackTitle,
        html,
        text: htmlToText(html),
        hasImage: page.hasImage ?? false,
        imageFileName: page.imageFileName ?? null,
      };
    });
  }

  return [
    {
      id: null,
      pageNumber: 1,
      title: fallbackTitle,
      html: "",
      text: "",
    },
  ];
}

export function getSelectionInsideEditor(editor) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || !editor?.contains(selection.anchorNode)) {
    return null;
  }

  return selection;
}
