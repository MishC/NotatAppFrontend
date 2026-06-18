import { createElement, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  AlignJustify,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronLeft,
  ChevronRight,
  Heading1,
  Image,
  Italic,
  Plus,
  Quote,
  Rows3,
  Save,
  Search,
  Smile,
  Sparkles,
  Subscript,
  Superscript,
  Trash2,
  Underline,
} from "lucide-react";

import DiarySidebar from "./DiarySidebar";
import NavigationBar from "./NavigationBar";
import { formatDateDDMMYYYY, parseDiaryDateInput, todayYYYYMMDD } from "../helpers/dateHelpers";
import { diaryEmojiOptions } from "../helpers/diaryEmojiOptions";
import "./styles/Diary.css";

const PAGE_MAX_HEIGHT = 650;
const PAGE_FLIP_MS = 900;
const FONT_SIZE_STEP = 2;
const DEFAULT_ENTRY_TITLE = formatDateDDMMYYYY(todayYYYYMMDD());

function getDiaryApiUrl(date) {
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const apiBase = base.endsWith("/api") ? base : `${base}/api`;
  return `${apiBase}/diary?date=${encodeURIComponent(date)}`;
}

function normalizeDiaryPages(data, fallbackTitle) {
  if (Array.isArray(data?.pages) && data.pages.length > 0) {
    return data.pages.map((page, index) => ({
      title: page.title || (index === 0 ? fallbackTitle : `Page ${index + 1}`),
      html: page.html || page.content || "",
      text: page.text || "",
    }));
  }

  return [
    {
      title: data?.title || fallbackTitle,
      html: data?.html || data?.content || "",
      text: data?.text || "",
    },
  ];
}

function removeEmptyHtmlLines(html) {
  return String(html || "")
    .replace(/<div>(?:\s|&nbsp;|<br\s*\/?>)*<\/div>/gi, "")
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/(?:<br\s*\/?>\s*){2,}/gi, "<br>")
    .replace(/^(?:\s|&nbsp;|<br\s*\/?>)+/gi, "")
    .replace(/(?:\s|&nbsp;|<br\s*\/?>)+$/gi, "");
}

function getSelectionInsideEditor(editor) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || !editor?.contains(selection.anchorNode)) {
    return null;
  }

  return selection;
}

function ToolbarButton({ title, Icon, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="h-10 w-10 rounded-xl border border-emerald-100 bg-white/80 text-slate-700 grid place-items-center hover:bg-emerald-50 hover:text-emerald-700 transition"
    >
      {createElement(Icon, { className: "h-4 w-4" })}
    </button>
  );
}

export default function Diary() {
  const user = useSelector((s) => s.auth.user);
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const pagesRef = useRef([]);
  const flipTimerRef = useRef(null);
  const [pages, setPages] = useState([{ title: DEFAULT_ENTRY_TITLE, html: "", text: "" }]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageDirection, setPageDirection] = useState(1);
  const [isPageFlipping, setIsPageFlipping] = useState(false);
  const [flipHtml, setFlipHtml] = useState("");
  const [frameStyle, setFrameStyle] = useState("marker");
  const [lookupDate, setLookupDate] = useState("");
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [editorLoadKey, setEditorLoadKey] = useState(0);
  const [showRuledLines, setShowRuledLines] = useState(false);
  const [emojiMenuOpen, setEmojiMenuOpen] = useState(false);
  const [alignmentMenuOpen, setAlignmentMenuOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const currentPage = pages[pageIndex] || pages[0];
  const entryTitle = currentPage.title;
  const entryText = currentPage.text;
  const userName = user?.name || user?.email || "Guest";

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(()=>{if (msg) { const timer = setTimeout(() => setMsg(""), 3000); return () => clearTimeout(timer); } },[msg])

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = pagesRef.current[pageIndex]?.html || "";
  }, [pageIndex, editorLoadKey]);

  const updateCurrentPage = (updates) => {
    setPages((prev) =>
      prev.map((page, index) => (index === pageIndex ? { ...page, ...updates } : page))
    );
  };

  const runCommand = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateCurrentPage({
      html: editorRef.current?.innerHTML || "",
      text: editorRef.current?.innerText || "",
    });
  };

  const insertText = (text) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, text);
    updateCurrentPage({
      html: editorRef.current?.innerHTML || "",
      text: editorRef.current?.innerText || "",
    });
  };

  const insertNodeInEditor = (node) => {
    editorRef.current?.focus();
    const selection = getSelectionInsideEditor(editorRef.current);

    if (!selection) {
      editorRef.current?.appendChild(node);
      syncEditorToPage();
      return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    syncEditorToPage();
  };

  const handleImageButtonClick = () => {
    setEmojiMenuOpen(false);
    setAlignmentMenuOpen(false);
    imageInputRef.current?.click();
  };

  const handleImageSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = document.createElement("img");
      image.src = reader.result;
      image.alt = file.name;
      image.className = "diary-editor-image";
      image.draggable = false;

      insertNodeInEditor(image);
      setMsg("Image added to diary page.");
    };
    reader.onerror = () => setMsg("Could not load this image.");
    reader.readAsDataURL(file);
  };

  const increaseFontSize = () => {
    editorRef.current?.focus();
    const selection = getSelectionInsideEditor(editorRef.current);
    const anchorElement =
      selection?.anchorNode?.nodeType === Node.ELEMENT_NODE
        ? selection.anchorNode
        : selection?.anchorNode?.parentElement;
    const currentSize = anchorElement
      ? Number.parseFloat(window.getComputedStyle(anchorElement).fontSize)
      : 18;
    const nextSize = Math.round(currentSize + FONT_SIZE_STEP);

    if (!selection || selection.isCollapsed) {
      document.execCommand("insertHTML", false, `<span style="font-size: ${nextSize}px;">&#8203;</span>`);
      syncEditorToPage();
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

    syncEditorToPage();
  };

  const insertQuote = () => {
    editorRef.current?.focus();
    const selection = getSelectionInsideEditor(editorRef.current);
    const selectedText = selection?.toString() || "";

    if (!selection) {
      document.execCommand("insertHTML", false, '<span style="font-style: italic;">„“</span>');
      syncEditorToPage();
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

    syncEditorToPage();
  };

  const syncEditorToPage = () => {
    updateCurrentPage({
      html: editorRef.current?.innerHTML || "",
      text: editorRef.current?.innerText || "",
    });
  };

  const trimEmptyLines = () => {
    if (!editorRef.current) return;

    const trimmedHtml = removeEmptyHtmlLines(editorRef.current.innerHTML);
    editorRef.current.innerHTML = trimmedHtml;
    syncEditorToPage();
    setMsg("Empty lines removed.");
  };

  const deleteCurrentPage = () => {
    if (pages.length === 1) {
      setPages([{ title: DEFAULT_ENTRY_TITLE, html: "", text: "" }]);
      setPageIndex(0);
      setEditorLoadKey((key) => key + 1);
      setMsg("Page cleared.");
      return;
    }

    const nextIndex = pageIndex === pages.length - 1 ? pageIndex - 1 : pageIndex;
    setPages((prev) => prev.filter((_, index) => index !== pageIndex));
    setPageIndex(nextIndex);
    setEditorLoadKey((key) => key + 1);
    setMsg("Page deleted.");
  };

  const handleEditorKeyDown = (e) => {
    if (e.key !== "Enter") return;

    if (e.target?.closest?.("li")) {
      setTimeout(syncEditorToPage, 0);
      return;
    }

    e.preventDefault();
    document.execCommand("insertLineBreak");
    updateCurrentPage({
      html: editorRef.current?.innerHTML || "",
      text: editorRef.current?.innerText || "",
    });
  };

  const startPageTransition = (nextIndex, direction) => {
    if (nextIndex < 0) return;
    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);

    setFlipHtml(editorRef.current?.innerHTML || pagesRef.current[pageIndex]?.html || "");
    setPageDirection(direction);
    setIsPageFlipping(true);
    setPageIndex(nextIndex);

    flipTimerRef.current = setTimeout(() => {
      setIsPageFlipping(false);
      setFlipHtml("");
    }, PAGE_FLIP_MS);
  };

  const goToPage = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= pages.length) return;
    startPageTransition(nextIndex, nextIndex > pageIndex ? 1 : -1);
  };

  const addPage = () => {
    const nextIndex = pages.length;
    setPages((prev) => [...prev, { title: `Page ${prev.length + 1}`, html: "", text: "" }]);
    startPageTransition(nextIndex, 1);
  };

  const handleEditorInput = (e) => {
    const html = e.currentTarget.innerHTML;
    const text = e.currentTarget.innerText;

    updateCurrentPage({ html, text });

    if (e.currentTarget.scrollHeight <= PAGE_MAX_HEIGHT) return;

    const nextIndex = pageIndex + 1;
    if (nextIndex >= pagesRef.current.length) {
      setPages((prev) => [...prev, { title: `Page ${prev.length + 1}`, html: "", text: "" }]);
    }

    setMsg("Page limit reached. Continuing on the next page.");
    startPageTransition(nextIndex, 1);
  };

  const handleSave = () => {
    setMsg("Diary entry saved locally in the editor draft.");
  };

  const handleLoadEntry = async () => {
    setMsg("");
    const normalizedDate = parseDiaryDateInput(lookupDate);

    if (!normalizedDate) {
      setMsg("Use date format like 17.06.2026, 06/17/2026, or 2026-06-17.");
      return;
    }

    setLoadingEntry(true);
    try {
      const response = await fetch(getDiaryApiUrl(normalizedDate), {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 404) {
        const title = formatDateDDMMYYYY(normalizedDate);
        setPages([{ title, html: "", text: "" }]);
        setPageIndex(0);
        setEditorLoadKey((key) => key + 1);
        setMsg("No diary entry found for this date. You can start writing it now.");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not load diary entry.");
      }

      const data = await response.json();
      const loadedPages = normalizeDiaryPages(data, formatDateDDMMYYYY(normalizedDate));

      setPages(loadedPages);
      setFrameStyle(data?.frameStyle || data?.frameTheme || frameStyle);
      setPageIndex(0);
      setEditorLoadKey((key) => key + 1);
      setMsg("Diary entry loaded. You can edit it now.");
    } catch (error) {
      console.error(error);
      setMsg(error.message || "Could not load diary entry.");
    } finally {
      setLoadingEntry(false);
    }
  };

  return (
    <div className="Diary min-h-screen bg-emerald-50">
      <NavigationBar
        userName={userName}
        isNavItemVisble={true}
        isEmailVisible={true}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
        <section className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Personal diary
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
              Write, shape, and keep the day.
            </h1>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-sm hover:bg-orange-600 transition"
          >
            <Save className="h-4 w-4" />
            Save draft
          </button>
        </section>

        {msg && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-white/70 px-4 py-3 text-emerald-700">
            {msg}
          </div>
        )}

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
          <div className="rounded-[28px] border border-emerald-200 bg-white/80 p-4 shadow-xl shadow-emerald-900/5 md:p-6">
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 md:flex-row md:items-center">
                <input
                  type="text"
                  value={lookupDate}
                  onChange={(e) => setLookupDate(e.target.value)}
                  placeholder="Find by date: 17.06.2026 or 06/17/2026"
                  className="w-full rounded-xl border border-emerald-100 bg-white/90 px-4 py-3 text-base text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
                <button
                  type="button"
                  onClick={handleLoadEntry}
                  disabled={loadingEntry}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 transition"
                >
                  <Search className="h-4 w-4" />
                  {loadingEntry ? "Loading..." : "Load"}
                </button>
              </div>

              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <input
                  type="text"
                  value={entryTitle}
                  onChange={(e) => updateCurrentPage({ title: e.target.value })}
                  className="w-full rounded-xl border border-emerald-100 bg-white/80 px-4 py-3 text-2xl font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Enter "
                />

                <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-sm font-semibold text-emerald-700">
                  <Sparkles className="h-4 w-4" />
                  AI notes
                </div>
              </div>

              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(pageIndex - 1)}
                    disabled={pageIndex === 0}
                    className="h-10 w-10 rounded-xl border border-emerald-100 bg-white/80 text-slate-700 grid place-items-center hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-2 text-sm font-semibold text-emerald-800">
                    Page {pageIndex + 1} / {pages.length}
                  </div>
                  <button
                    type="button"
                    onClick={() => goToPage(pageIndex + 1)}
                    disabled={pageIndex === pages.length - 1}
                    className="h-10 w-10 rounded-xl border border-emerald-100 bg-white/80 text-slate-700 grid place-items-center hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={addPage}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-emerald-50 transition"
                >
                  <Plus className="h-4 w-4" />
                  New page
                </button>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <ToolbarButton title="Increase font size" Icon={Heading1} onClick={increaseFontSize} />
                <ToolbarButton title="Bold" Icon={Bold} onClick={() => runCommand("bold")} />
                <ToolbarButton title="Italic" Icon={Italic} onClick={() => runCommand("italic")} />
                <ToolbarButton title="Underline" Icon={Underline} onClick={() => runCommand("underline")} />
                <ToolbarButton title="Superscript" Icon={Superscript} onClick={() => runCommand("superscript")} />
                <ToolbarButton title="Subscript" Icon={Subscript} onClick={() => runCommand("subscript")} />
                <div className="relative">
                  <ToolbarButton
                    title="Alignment"
                    Icon={AlignJustify}
                    onClick={() => {
                      setAlignmentMenuOpen((value) => !value);
                      setEmojiMenuOpen(false);
                    }}
                  />
                  {alignmentMenuOpen && (
                    <div className="absolute left-0 top-12 z-30 flex gap-1 rounded-2xl border border-emerald-100 bg-white/95 p-2 shadow-xl backdrop-blur">
                      {[
                        { title: "Align left", Icon: AlignLeft, command: "justifyLeft" },
                        { title: "Align center", Icon: AlignCenter, command: "justifyCenter" },
                        { title: "Align right", Icon: AlignRight, command: "justifyRight" },
                      ].map(({ title, Icon, command }) => (
                        <ToolbarButton
                          key={command}
                          title={title}
                          Icon={Icon}
                          onClick={() => {
                            runCommand(command);
                            setAlignmentMenuOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <ToolbarButton title="Quote" Icon={Quote} onClick={insertQuote} />
                <div className="relative">
                  <ToolbarButton
                    title="Emoji"
                    Icon={Smile}
                    onClick={() => {
                      setEmojiMenuOpen((value) => !value);
                      setAlignmentMenuOpen(false);
                    }}
                  />
                  {emojiMenuOpen && (
                    <div className="absolute left-0 top-12 z-30 w-72 rounded-2xl border border-emerald-100 bg-white/95 p-3 shadow-xl backdrop-blur">
                      <div className="grid grid-cols-8 gap-1">
                        {diaryEmojiOptions.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              insertText(emoji);
                              setEmojiMenuOpen(false);
                            }}
                            className="h-8 w-8 rounded-lg text-lg hover:bg-emerald-50 transition"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <ToolbarButton title="Image" Icon={Image} onClick={handleImageButtonClick} />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelected}
                  className="hidden"
                />
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    runCommand("foreColor", e.target.value);
                    e.target.value = "";
                  }}
                  className="h-10 rounded-xl border border-emerald-100 bg-white/80 px-3 text-sm font-semibold text-slate-700 outline-none hover:bg-emerald-50 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  title="Text color"
                >
                  <option value="">Text color</option>
                  <option value="#111827">Black</option>
                  <option value="#dc2626">Red</option>
                  <option value="#ea580c">Orange</option>
                  <option value="#059669">Green</option>
                  <option value="#2563eb">Blue</option>
                  <option value="#7c3aed">Purple</option>
                </select>
                <button
                  type="button"
                  onClick={trimEmptyLines}
                  className="h-10 rounded-xl border border-emerald-100 bg-white/80 px-3 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                  title="Remove all empty lines"
                >
                  Trim
                </button>
                <button
                  type="button"
                  onClick={() => setShowRuledLines((value) => !value)}
                  className={[
                    "h-10 w-10 rounded-xl border grid place-items-center transition",
                    showRuledLines
                      ? "border-orange-200 bg-orange-50 text-orange-700"
                      : "border-emerald-100 bg-white/80 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700",
                  ].join(" ")}
                  title="Show writing lines"
                >
                  <Rows3 className="h-4 w-4" />
                </button>
                <ToolbarButton title="Delete current page" Icon={Trash2} onClick={deleteCurrentPage} />
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {diaryEmojiOptions.slice(0, 8).map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertText(emoji)}
                    className="h-9 w-9 rounded-xl border border-emerald-100 bg-white/80 text-lg hover:bg-emerald-50 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className={`diary-page-stage ${isPageFlipping ? "diary-page-stage--flipping" : ""}`}>
                <div className={`diary-frame diary-frame--${frameStyle}`}>
                  <div className="diary-frame__inner">
                    <div className="relative">
                      {!entryText && (
                        <div className="pointer-events-none absolute left-5 top-5 text-slate-400">
                          Start writing your diary entry here...
                        </div>
                      )}
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onKeyDown={handleEditorKeyDown}
                        onInput={handleEditorInput}
                        className={[
                          "diary-editor-page w-full rounded-2xl border border-emerald-100 bg-white px-5 py-5 text-lg leading-8 text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100",
                          showRuledLines ? "diary-editor-page--ruled-lines" : "",
                        ].join(" ")}
                      />
                    </div>
                  </div>
                </div>

                {isPageFlipping && (
                  <div
                    className={[
                      "diary-book-flip",
                      pageDirection > 0 ? "diary-book-flip--forward" : "diary-book-flip--back",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    <div className={`diary-frame diary-frame--${frameStyle} diary-book-flip__page`}>
                      <div className="diary-frame__inner">
                        <div
                          className="diary-book-flip__content"
                          dangerouslySetInnerHTML={{ __html: flipHtml }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </div>

          <DiarySidebar
            activeFrame={frameStyle}
            onFrameChange={setFrameStyle}
            onInsertPrompt={insertText}
            onMessage={setMsg}
          />
        </section>
      </main>
    </div>
  );
}
