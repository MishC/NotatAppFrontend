import {
  AlignJustify,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CaseLower,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Heading1,
  Image,
  Italic,
  Music,
  Plus,
  Quote,
  Rows3,
  Search,
  Smile,
  Subscript,
  Superscript,
  Trash2,
  Underline,
} from "lucide-react";
import DiaryToolbarButton from "./DiaryToolbarButton";
import { DIARY_TITLE_DATE_FORMATS } from "../helpers/dateHelpers";
import { diaryEmojiOptions } from "../helpers/diaryEmojiOptions";

export default function DiaryEditor({
  addPage,
  alignmentMenuOpen,
  decreaseFontSize,
  deleteCurrentPage,
  editorRef,
  emojiMenuOpen,
  entryText,
  frameStyle,
  goToPage,
  guest,
  handleEditorInput,
  handleEditorClick,
  handleEditorKeyDown,
  handleImageButtonClick,
  handleImageSelected,
  handleLoadEntry,
  handleSaveAsPdf,
  handleSongSuggestion,
  handleTitleFormatChange,
  imageInputRef,
  increaseFontSize,
  insertQuote,
  insertText,
  loadingEntry,
  lookupDate,
  pageIndex,
  pagePixels,
  pages,
  runCommand,
  setAlignmentMenuOpen,
  setEmojiMenuOpen,
  setLookupDate,
  setShowRuledLines,
  showRuledLines,
  titleFormat,
}) {
  return (
    <div className="diary-editor-shell flex min-h-0 flex-col rounded-[28px] border border-emerald-200 bg-white/80 p-4 shadow-xl shadow-emerald-900/5 md:p-6">
      {!guest && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 md:flex-row md:items-center">
          <input
            type="text"
            value={lookupDate}
            onChange={(e) => setLookupDate(e.target.value)}
            placeholder="DD-MM-YYYY | DD. Month YYYY | Month of D(th), YYYY"
            className="w-full rounded-xl border border-emerald-100 bg-white/90 px-4 py-3 text-base text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <select
            value={titleFormat}
            onChange={(e) => handleTitleFormatChange(e.target.value)}
            className="min-w-56 rounded-xl border border-emerald-100 bg-white/90 px-3 py-3 text-sm font-semibold text-slate-700 outline-none hover:bg-emerald-50 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            aria-label="Diary load date format"
          >
            {DIARY_TITLE_DATE_FORMATS.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
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
      )}

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
        <DiaryToolbarButton title="Increase font size" Icon={Heading1} onClick={increaseFontSize} />
        <DiaryToolbarButton title="Smaller letters" Icon={CaseLower} onClick={decreaseFontSize} />
        <DiaryToolbarButton title="Bold" Icon={Bold} onClick={() => runCommand("bold")} />
        <DiaryToolbarButton title="Italic" Icon={Italic} onClick={() => runCommand("italic")} />
        <DiaryToolbarButton title="Underline" Icon={Underline} onClick={() => runCommand("underline")} />
        <DiaryToolbarButton title="Superscript" Icon={Superscript} onClick={() => runCommand("superscript")} />
        <DiaryToolbarButton title="Subscript" Icon={Subscript} onClick={() => runCommand("subscript")} />
        <div className="relative">
          <DiaryToolbarButton
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
                <DiaryToolbarButton
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
        <DiaryToolbarButton title="Quote" Icon={Quote} onClick={insertQuote} />
        <DiaryToolbarButton title="Image" Icon={Image} onClick={handleImageButtonClick} />
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
        <DiaryToolbarButton title="Delete current page" Icon={Trash2} onClick={deleteCurrentPage} />
        <DiaryToolbarButton title="Save as PDF" Icon={FileDown} onClick={handleSaveAsPdf} />
        <DiaryToolbarButton title="Suggest song" Icon={Music} onClick={handleSongSuggestion} />
        <div className="relative">
          <DiaryToolbarButton
            title="Emoji"
            Icon={Smile}
            onClick={() => {
              setEmojiMenuOpen((value) => !value);
              setAlignmentMenuOpen(false);
            }}
          />
          {emojiMenuOpen && (
            <div className="absolute right-0 top-12 z-30 w-72 rounded-2xl border border-emerald-100 bg-white/95 p-3 shadow-xl backdrop-blur">
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
        <div className="flex max-w-full flex-nowrap gap-2 overflow-x-auto pb-1">
          {diaryEmojiOptions.slice(0, 8).map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertText(emoji)}
              className="h-9 w-9 shrink-0 rounded-xl border border-emerald-100 bg-white/80 text-lg hover:bg-emerald-50 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="diary-page-stage">
        <div key={pageIndex} className={`diary-frame diary-frame--${frameStyle} diary-page-fade`}>
          <div className="diary-frame__inner">
            <div className="diary-editor-page-wrap relative min-h-0 flex-1">
              {!entryText && (
                <div className="pointer-events-none absolute left-5 top-5 text-slate-400">
                  Start writing your diary entry here...
                </div>
              )}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onClick={handleEditorClick}
                onKeyDown={handleEditorKeyDown}
                onInput={handleEditorInput}
                className={[
                  "diary-editor-page w-full rounded-2xl border border-emerald-100 bg-white px-5 py-5 text-lg leading-8 text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100",
                  showRuledLines ? "diary-editor-page--ruled-lines" : "",
                ].join(" ")}
              />
            </div>
          </div>
          {pagePixels.length > 0 && (
            <div className="diary-page-pixels" aria-hidden="true">
              {pagePixels.map((tile) => (
                <span
                  key={tile.id}
                  className="diary-page-pixels__tile"
                  style={{
                    "--tile-delay": tile.delay,
                    "--tile-duration": tile.duration,
                    "--tile-tint": tile.tint,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
