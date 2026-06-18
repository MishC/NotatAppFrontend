import { createElement, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bold,
  ChevronLeft,
  ChevronRight,
  Heading1,
  Image,
  Italic,
  List,
  Plus,
  Quote,
  Save,
  Smile,
  Sparkles,
  Underline,
  Upload,
} from "lucide-react";

import DiarySidebar from "./DiarySidebar";
import NavigationBar from "./NavigationBar";
import "./styles/Diary.css";

const emojiOptions = ["✨", "🌿", "😊", "💡", "🎉", "❤️", "📌", "☕"];

const MotionDiv = motion.div;

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
  const pagesRef = useRef([]);
  const hasPageTransitionRef = useRef(false);
  const [pages, setPages] = useState([{ title: "Today", html: "", text: "" }]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageDirection, setPageDirection] = useState(1);
  const [frameStyle, setFrameStyle] = useState("marker");
  const [msg, setMsg] = useState("");

  const currentPage = pages[pageIndex];
  const entryTitle = currentPage.title;
  const entryText = currentPage.text;
  const userName = user?.name || user?.email || "Guest";

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = pagesRef.current[pageIndex]?.html || "";
  }, [pageIndex]);

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

  const handleEditorKeyDown = (e) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    document.execCommand("insertLineBreak");
    updateCurrentPage({
      html: editorRef.current?.innerHTML || "",
      text: editorRef.current?.innerText || "",
    });
  };

  const goToPage = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= pages.length) return;
    hasPageTransitionRef.current = true;
    setPageDirection(nextIndex > pageIndex ? 1 : -1);
    setPageIndex(nextIndex);
  };

  const addPage = () => {
    hasPageTransitionRef.current = true;
    setPageDirection(1);
    setPages((prev) => [...prev, { title: `Page ${prev.length + 1}`, html: "", text: "" }]);
    setPageIndex(pages.length);
  };

  const handlePrototypeAction = (label) => {
    setMsg(`${label} is prepared in the editor UI. Backend storage can be connected later.`);
  };

  const handleSave = () => {
    setMsg("Diary entry saved locally in the editor draft.");
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
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <input
                  type="text"
                  value={entryTitle}
                  onChange={(e) => updateCurrentPage({ title: e.target.value })}
                  className="w-full rounded-xl border border-emerald-100 bg-white/80 px-4 py-3 text-2xl font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Entry title"
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
                <ToolbarButton title="Heading" Icon={Heading1} onClick={() => runCommand("formatBlock", "h2")} />
                <ToolbarButton title="Bold" Icon={Bold} onClick={() => runCommand("bold")} />
                <ToolbarButton title="Italic" Icon={Italic} onClick={() => runCommand("italic")} />
                <ToolbarButton title="Underline" Icon={Underline} onClick={() => runCommand("underline")} />
                <ToolbarButton title="List" Icon={List} onClick={() => runCommand("insertUnorderedList")} />
                <ToolbarButton title="Quote" Icon={Quote} onClick={() => runCommand("formatBlock", "blockquote")} />
                <ToolbarButton title="Emoji" Icon={Smile} onClick={() => insertText("✨")} />
                <ToolbarButton title="Image" Icon={Image} onClick={() => handlePrototypeAction("Image insert")} />
                <ToolbarButton title="Upload from disk" Icon={Upload} onClick={() => handlePrototypeAction("File upload")} />
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {emojiOptions.map((emoji) => (
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

              <div className="diary-page-stage">
                <AnimatePresence mode="wait" custom={pageDirection}>
                  <MotionDiv
                    key={pageIndex}
                    className={`diary-frame diary-frame--${frameStyle}`}
                    initial={
                      hasPageTransitionRef.current
                        ? {
                            rotate: pageDirection > 0 ? -2 : 2,
                            opacity: 0,
                            x: pageDirection > 0 ? 36 : -36,
                            y: 18,
                            scale: 0.98,
                          }
                        : false
                    }
                    animate={{ rotate: 0, opacity: 1, x: 0, y: 0, scale: 1 }}
                    exit={{
                      rotate: pageDirection > 0 ? 2 : -2,
                      opacity: 0,
                      x: pageDirection > 0 ? -36 : 36,
                      y: 18,
                      scale: 0.98,
                    }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    style={{
                      transformOrigin: "right bottom",
                    }}
                  >
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
                          onInput={(e) =>
                            updateCurrentPage({
                              html: e.currentTarget.innerHTML,
                              text: e.currentTarget.innerText,
                            })
                          }
                          className="min-h-[420px] w-full rounded-2xl border border-emerald-100 bg-white px-5 py-5 text-lg leading-8 text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                  </MotionDiv>
                </AnimatePresence>
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
