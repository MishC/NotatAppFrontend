import { createElement } from "react";

export default function DiaryToolbarButton({ title, Icon, onClick, active = false }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        "h-10 w-10 rounded-xl border grid place-items-center transition",
        active
          ? "border-emerald-400 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-200"
          : "border-emerald-100 bg-white/80 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700",
      ].join(" ")}
    >
      {createElement(Icon, { className: "h-4 w-4" })}
    </button>
  );
}
