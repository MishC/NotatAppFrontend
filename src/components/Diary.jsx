import { createElement, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Bold,
  Heading1,
  Image,
  Italic,
  List,
  Quote,
  Save,
  Smile,
  Sparkles,
  Underline,
  Upload,
} from "lucide-react";

import NavigationBar from "./NavigationBar";

const emojiOptions = ["✨", "🌿", "😊", "💡", "🎉", "❤️", "📌", "☕"];

const promptOptions = [
  "What felt lighter today?",
  "What do I want to remember from this week?",
  "One small thing I can do tomorrow is...",
];

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
  const [entryTitle, setEntryTitle] = useState("Today");
  const [entryText, setEntryText] = useState("");
  const [msg, setMsg] = useState("");

  const userName = user?.name || user?.email || "Guest";

  const runCommand = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setEntryText(editorRef.current?.innerText || "");
  };

  const insertText = (text) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, text);
    setEntryText(editorRef.current?.innerText || "");
  };

  const handlePrototypeAction = (label) => {
    setMsg(`${label} is prepared in the editor UI. Backend storage can be connected later.`);
  };

  const handleSave = () => {
    setMsg("Diary entry saved locally in the editor draft.");
  };

  return (
    <div className="Diary min-h-screen bg-emerald-50">
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur">
        <NavigationBar
          userName={userName}
          isNavItemVisble={true}
          isEmailVisible={false}
        />
      </div>

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
          <div className="rounded-[28px] border border-emerald-200 bg-white/80 p-3 shadow-xl shadow-emerald-900/5">
            <div className="rounded-[22px] border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/60 p-4 md:p-6">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <input
                  type="text"
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  className="w-full rounded-xl border border-emerald-100 bg-white/80 px-4 py-3 text-2xl font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Entry title"
                />

                <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-sm font-semibold text-emerald-700">
                  <Sparkles className="h-4 w-4" />
                  AI notes
                </div>
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
                  onInput={(e) => setEntryText(e.currentTarget.innerText)}
                  className="min-h-[420px] w-full rounded-2xl border border-emerald-100 bg-white px-5 py-5 text-lg leading-8 text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>
          </div>

          <aside className="rounded-[24px] border border-emerald-200 bg-white/75 p-5 shadow-lg shadow-emerald-900/5">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">AI note starters</h2>
              <p className="mt-1 text-sm text-slate-500">
                Click a prompt to place it into the diary.
              </p>
            </div>

            <div className="space-y-3">
              {promptOptions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => insertText(`${prompt} `)}
                  className="w-full rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-emerald-100 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
              <h3 className="font-bold text-slate-900">Media shelf</h3>
              <p className="mt-1 text-sm text-slate-600">
                Images and disk files are ready as editor actions. Storage can be wired to the API later.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
