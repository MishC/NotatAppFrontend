export default function AuthAlert({ err, msg }) {
  if (!err && !msg) return null;

  const isError = Boolean(err);
  const text = isError ? err : msg;

  const base = "p-3 rounded-lg border mb-2";
  const classes = isError
    ? "text-red-700 bg-red-50 border-red-200"
    : "text-emerald-700 bg-emerald-50 border-emerald-200";

  return <div className={`${base} ${classes}`}>{text}</div>;
}
