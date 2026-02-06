export default function Plus({
  onClick,
  color = "bg-orange-500 hover:bg-orange-700",   // "orange" | "blue" | "slate"
  size = 12,          // 2|4|6|8|10 | 12 | 14 | 16
  className = "",
}) {
  const sizeMap = {
    2: "w-2 h-2",
    4: "w-4 h-4",
    6: "w-6 h-6",
    8: "w-8 h-8",
    10: "w-10 h-10",
    11: "w-11 h-11",
    12: "w-12 h-12",
    14: "w-14 h-14",
    16: "w-16 h-16",
  };


  const sizeCls = sizeMap[size] || sizeMap[12];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add note"
      className={[
        sizeCls,
        color,
        "text-white leading-none grid place-items-center",
        "shadow-lg transition cursor-pointer select-none",
        className,
      ].join(" ")}
    >
      +
    </button>
  );
}
