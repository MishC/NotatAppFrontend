import { createElement } from "react";

export default function DiaryToolbarButton({ title, Icon, onClick }) {
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
