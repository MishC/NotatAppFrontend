import {
  DEFAULT_EDITOR_FONT_SIZE,
  DIARY_IMAGE_ALIGN_CLASSES,
  FONT_SIZE_STEP,
  escapeHtml,
  getSelectionInsideEditor,
  htmlToText,
} from "./diaryHelpers";

export function getImageWrapperFromNode(node) {
  const element =
    node?.nodeType === Node.ELEMENT_NODE
      ? node
      : node?.parentElement;

  if (!element) return null;
  if (element.classList?.contains("diary-editor-image-wrap")) return element;

  const image = element.matches?.(".diary-editor-image")
    ? element
    : element.closest?.(".diary-editor-image");

  if (!image) return null;

  const existingWrapper = image.closest(".diary-editor-image-wrap");
  if (existingWrapper) return existingWrapper;

  const wrapper = createImageWrapper(image);
  image.replaceWith(wrapper);
  return wrapper;
}

export function createImageWrapper(image) {
  const wrapper = document.createElement("div");
  wrapper.className = "diary-editor-image-wrap diary-align-center";
  wrapper.style.textAlign = "center";
  wrapper.appendChild(image);
  return wrapper;
}

export function insertNodeInEditor(editor, node, onSync) {
  editor?.focus();
  const selection = getSelectionInsideEditor(editor);

  if (!selection) {
    editor?.appendChild(node);
    onSync?.();
    return;
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  onSync?.();
}

export function applyImageAlignment({
  command,
  editor,
  selectedWrapper,
  onSelectedWrapperChange,
  onSync,
}) {
  const alignmentByCommand = {
    justifyLeft: "left",
    justifyCenter: "center",
    justifyRight: "right",
  };
  const alignment = alignmentByCommand[command];

  if (!alignment) return false;

  const selection = getSelectionInsideEditor(editor);
  const selectionWrapper = getImageWrapperFromNode(selection?.anchorNode);
  const wrapper =
    selectedWrapper && editor?.contains(selectedWrapper)
      ? selectedWrapper
      : selectionWrapper;

  if (!wrapper) return false;

  wrapper.classList.remove(...DIARY_IMAGE_ALIGN_CLASSES);
  wrapper.classList.add(`diary-align-${alignment}`);
  wrapper.style.textAlign = alignment;
  onSelectedWrapperChange?.(wrapper);
  onSync?.();
  return true;
}

export function changeEditorFontSize(editor, direction, onSync) {
  editor?.focus();
  const selection = getSelectionInsideEditor(editor);
  const anchorElement =
    selection?.anchorNode?.nodeType === Node.ELEMENT_NODE
      ? selection.anchorNode
      : selection?.anchorNode?.parentElement;
  const currentSize = anchorElement
    ? Number.parseFloat(window.getComputedStyle(anchorElement).fontSize)
    : 18;
  const nextSize = Math.max(8, Math.round(currentSize + FONT_SIZE_STEP * direction));

  if (!selection || selection.isCollapsed) {
    document.execCommand("insertHTML", false, `<span style="font-size: ${nextSize}px;">&#8203;</span>`);
    onSync?.();
    return;
  }

  const range = selection.getRangeAt(0);
  const wrapper = document.createElement("span");
  wrapper.style.fontSize = `${nextSize}px`;
  wrapper.appendChild(range.extractContents());
  range.insertNode(wrapper);

  const nextRange = document.createRange();
  nextRange.selectNodeContents(wrapper);
  selection.removeAllRanges();
  selection.addRange(nextRange);

  onSync?.();
}

export function insertQuoteInEditor(editor, onSync) {
  editor?.focus();
  const selection = getSelectionInsideEditor(editor);
  const selectedText = selection?.toString() || "";

  if (!selection) {
    document.execCommand("insertHTML", false, '<span style="font-style: italic;">„“</span>');
    onSync?.();
    return;
  }

  const range = selection.getRangeAt(0);
  const quoteNode = document.createElement("span");
  quoteNode.style.fontStyle = "italic";
  quoteNode.textContent = selectedText ? `„${selectedText}“` : "„“";

  range.deleteContents();
  range.insertNode(quoteNode);

  const caretRange = document.createRange();
  caretRange.setStart(quoteNode.firstChild, selectedText ? quoteNode.textContent.length : 1);
  caretRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(caretRange);

  onSync?.();
}

export function clearEditorFormatting(editor, onSync) {
  editor?.focus();
  const selection = getSelectionInsideEditor(editor);

  if (!selection) return;

  const anchorElement =
    selection.anchorNode?.nodeType === Node.ELEMENT_NODE
      ? selection.anchorNode
      : selection.anchorNode?.parentElement;

  document.execCommand("removeFormat");

  for (let index = 0; index < 8; index += 1) {
    document.execCommand("outdent");
  }

  if (anchorElement?.closest?.("ul")) {
    document.execCommand("insertUnorderedList");
  }

  if (anchorElement?.closest?.("ol")) {
    document.execCommand("insertOrderedList");
  }

  document.execCommand("justifyLeft");

  if (selection.isCollapsed) {
    document.execCommand(
      "insertHTML",
      false,
      `<span style="font-size: ${DEFAULT_EDITOR_FONT_SIZE}px; font-weight: 400; font-style: normal; text-decoration: none;">&#8203;</span>`
    );
  }

  onSync?.();
}

export function insertDefaultLineBreakInEditor(editor) {
  editor?.focus();
  const selection = getSelectionInsideEditor(editor);

  if (!selection) return;

  const range = selection.getRangeAt(0);
  const lineBreak = document.createElement("br");
  const resetSpan = document.createElement("span");
  const spacer = document.createTextNode("\u00A0");

  resetSpan.dataset.diaryEmptyLine = "true";
  resetSpan.style.fontSize = `${DEFAULT_EDITOR_FONT_SIZE}px`;
  resetSpan.style.fontWeight = "400";
  resetSpan.style.fontStyle = "normal";
  resetSpan.style.textDecoration = "none";
  resetSpan.appendChild(spacer);

  range.deleteContents();
  range.insertNode(resetSpan);
  range.insertNode(lineBreak);

  const caretRange = document.createRange();
  caretRange.setStart(spacer, 1);
  caretRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(caretRange);
}

export function getSongLabel(song) {
  const artist = String(song?.artist || "").trim();
  const title = String(song?.title || "").trim();

  if (artist && title) return `${artist} - ${title}`;
  return artist || title || "Recommended song";
}

export function getSafeSongLink(link) {
  const value = String(link || "").trim();
  if (!value) return "";

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

export function getSongSearchLink(song) {
  const label = getSongLabel(song);
  if (!label || label === "Recommended song") return "";

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(label)}`;
}

function buildFormatResetLineHtml() {
  const resetStyle = [
    "font-size: 14px",
    "font-style: normal",
    "font-weight: 400",
    "text-decoration: none",
    "text-decoration-line: none",
    "text-indent: 0",
    "margin: 0",
    "padding: 0",
    "border: 0",
    "background: transparent",
    "color: inherit",
    "letter-spacing: 0",
    "text-align: left",
    "line-height: 1.5",
  ].join("; ");

  return `<div class="diary-format-reset" style="${resetStyle};"><span class="diary-format-reset__spacer" style="${resetStyle};">&nbsp;</span><br></div>`;
}

export function buildSongRecommendationHtml(songs, contextLabel = "") {
  const items = songs
    .map((song) => {
      const label = getSongLabel(song);
      const link = getSafeSongLink(song?.link) || getSongSearchLink(song);

      if (link) {
        return `<li><a href="${escapeHtml(link)}" title="${escapeHtml(link)}" target="_blank" rel="noreferrer noopener">${escapeHtml(label)}</a></li>`;
      }

      return `<li>${escapeHtml(label)}</li>`;
    })
    .join("");

  return [
    buildFormatResetLineHtml(),
    '<div class="diary-song-recommendation">',
    `<strong>Song of the day${contextLabel ? ` - ${escapeHtml(contextLabel)}` : ""}</strong>`,
    `<ul>${items}</ul>`,
    "</div>",
    buildFormatResetLineHtml(),
  ].join("");
}

export function mergeSongRecommendationIntoPages({
  pages,
  pageIndex,
  currentHtml,
  currentText,
  songs,
  contextLabel = "",
}) {
  const lastIndex = Math.max(0, pages.length - 1);
  const htmlToInsert = buildSongRecommendationHtml(songs, contextLabel);
  const nextPages = pages.map((page, index) => {
    const pageHtml = index === pageIndex ? currentHtml : page.html || "";
    const separator = pageHtml ? "<br>" : "";
    const html = index === lastIndex ? `${pageHtml}${separator}${htmlToInsert}` : pageHtml;

    if (index !== lastIndex && index !== pageIndex) return page;

    return {
      ...page,
      html,
      text: index === pageIndex && index !== lastIndex ? currentText : htmlToText(html),
    };
  });

  return { htmlToInsert, lastIndex, nextPages };
}

export function resolveCountryFromGeolocation() {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return Promise.resolve("");
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
          url.searchParams.set("latitude", String(coords.latitude));
          url.searchParams.set("longitude", String(coords.longitude));
          url.searchParams.set("localityLanguage", "en");

          const response = await fetch(url);
          if (!response.ok) throw new Error("Country lookup failed.");

          const data = await response.json();
          resolve(data?.countryName || data?.countryCode || "");
        } catch (error) {
          console.error(error);
          resolve("");
        }
      },
      () => resolve(""),
      { enableHighAccuracy: false, maximumAge: 600000, timeout: 5000 }
    );
  });
}
