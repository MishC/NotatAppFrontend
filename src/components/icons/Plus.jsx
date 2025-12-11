export default function Plus({
  onClick,
  color = "orange",   // "orange" | "blue" | "slate"
  size = 12,          // 10 | 12 | 14 | 16
  className = "",
}) {
  const sizeMap = {
    10: "w-10 h-10",
    12: "w-12 h-12",
    14: "w-14 h-14",
    16: "w-16 h-16",
  };
  const colorMap = {
    orange: "bg-orange-500 hover:bg-orange-700",
    blue:   "bg-blue-600 hover:bg-blue-700",
    slate:  "bg-slate-800 hover:bg-slate-900",
  };

  const sizeCls = sizeMap[size] || sizeMap[12];
  const colorCls = colorMap[color] || colorMap.orange;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add note"
      className={[
        sizeCls,
        colorCls,
        "text-white text-3xl leading-none grid place-items-center",
        "shadow-lg transition cursor-pointer select-none",
        className,
      ].join(" ")}
    >
      +
    </button>
  );
}
