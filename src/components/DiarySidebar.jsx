import { useState } from "react";
import { Sparkles } from "lucide-react";
import { generateFrameAction } from "../actions/aiActions";

const promptOptions = [
  "What felt lighter today?",
  "What do I want to remember from this week?",
  "One small thing I can do tomorrow is...",
];

const frameOptions = [
  { key: "marker", label: "Marker", description: "Black frame with purple and white marker lines." },
  { key: "wood", label: "Wooden frame", description: "Warm wooden diary frame." },
  { key: "solid", label: "Solid color", description: "Clean bold color frame." },
];

export default function DiarySidebar({
  activeFrame,
  API_URL_AI,
  guest,
  onFrameChange,
  onFrameCssChange,
  onInsertPrompt,
  onMessage,
}) {
  const [framePrompt, setFramePrompt] = useState("");
  const [loadingFrame, setLoadingFrame] = useState(false);

  const generateFrame = async () => {
    await generateFrameAction({
      guest,
      API_URL_AI,
      description: framePrompt,
      setFrameCss: onFrameCssChange,
      setFrameStyle: onFrameChange,
      setLoading: setLoadingFrame,
      setError: onMessage,
      setMsg: onMessage,
    });
  };

  return (
    <aside className="diary-sidebar border-0 bg-transparent p-0 shadow-none lg:rounded-[24px] lg:border lg:border-emerald-200 lg:bg-white/75 lg:p-5 lg:shadow-lg lg:shadow-emerald-900/5">
      <div className="diary-sidebar-desktop-only mb-6">
        <h2 className="text-lg font-bold text-slate-900">AI note starters</h2>
        <p className="mt-1 text-sm text-slate-500">
          Click a prompt to place it into the diary.
        </p>
      </div>

      <div className="diary-sidebar-desktop-only space-y-3">
        {promptOptions.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onInsertPrompt(`${prompt} `)}
            className="w-full rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-emerald-100 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="diary-sidebar-desktop-only mt-7 border-t border-emerald-100 pt-6">
        <h2 className="text-lg font-bold text-slate-900">Diary frame</h2>
        <p className="mt-1 text-sm text-slate-500">
          Change the notebook frame.
        </p>

        <div className="mt-4 space-y-3">
          {frameOptions.map((frame) => (
            <button
              key={frame.key}
              type="button"
              onClick={() => onFrameChange(frame.key)}
              className={[
                "w-full rounded-xl border px-4 py-3 text-left transition",
                activeFrame === frame.key
                  ? "border-orange-300 bg-orange-50"
                  : "border-emerald-100 bg-white/80 hover:bg-emerald-50",
              ].join(" ")}
            >
              <span className="block text-sm font-bold text-slate-900">{frame.label}</span>
              <span className="mt-1 block text-xs text-slate-500">{frame.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="diary-ai-frame-generator mt-7 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Sparkles className="h-4 w-4 text-violet-600" />
          AI frame generator
        </div>
        <textarea
          value={framePrompt}
          onChange={(e) => setFramePrompt(e.target.value)}
          className="mt-3 min-h-24 w-full resize-none rounded-xl border border-violet-100 bg-white/80 p-3 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
          placeholder="Color, gradient, or vibe, e.g. black-green-blue gradient, frozen, disco"
        />
        <button
          type="button"
          onClick={generateFrame}
          disabled={loadingFrame}
          className="mt-3 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 transition"
        >
          {loadingFrame ? "Generating..." : "Generate frame"}
        </button>
      </div>
    </aside>
  );
}
