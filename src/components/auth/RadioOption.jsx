export default function RadioOption({
  label,
  value,
  name,
  checked,
  onChange,
  className = "",
}) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="form-radio text-blue-600 w-5 h-5"
      />
      <span className="text-slate-700 text-xl">{label}</span>
    </label>
  );
}
