import { formatDiaryTitleDate, todayYYYYMMDD } from "./dateHelpers";

const PAGE_PIXEL_TILE_COUNT = 144;

export const PAGE_MAX_HEIGHT = 650;
export const FONT_SIZE_STEP = 2;
export const DEFAULT_EDITOR_FONT_SIZE = 14;
export const DEFAULT_DIARY_DATE = todayYYYYMMDD();
export const DEFAULT_TITLE_FORMAT = "ddmmyyyy";
export const DEFAULT_ENTRY_TITLE = formatDiaryTitleDate(DEFAULT_DIARY_DATE, DEFAULT_TITLE_FORMAT);
export const DIARY_PAGE_IMAGE_PLACEHOLDER = "{{diary-page-image}}";

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

export function htmlToText(html) {
  const container = document.createElement("div");
  container.innerHTML = html || "";
  return container.innerText || "";
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

export function removeEmptyHtmlLines(html) {
  const container = document.createElement("div");
  container.innerHTML = html || "";
  const emptyTextPattern = /[\s\u200B\u00A0]/g;
  const isEmptyElement = (element) =>
    !element.querySelector("img") &&
    !element.textContent.replace(emptyTextPattern, "") &&
    !element.querySelector("br + *:not(br)");

  [...container.querySelectorAll("span, div, p")].forEach((element) => {
    if (isEmptyElement(element)) element.remove();
  });

  return container.innerHTML
    .replace(/<div>(?:\s|&nbsp;|<br\s*\/?>)*<\/div>/gi, "")
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/(?:<br\s*\/?>\s*){2,}/gi, "<br>")
    .replace(/^(?:\s|&nbsp;|<br\s*\/?>)+/gi, "")
    .replace(/(?:\s|&nbsp;|<br\s*\/?>)+$/gi, "");
}

export function getSelectionInsideEditor(editor) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || !editor?.contains(selection.anchorNode)) {
    return null;
  }

  return selection;
}
