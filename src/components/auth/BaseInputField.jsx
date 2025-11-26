// src/components/auth/BaseInputField.jsx
export default function BaseInputField({
  type = "text",
  value,
  onChange,
  placeholder = "",
  leftIcon = null,
  rightIcon = null,
  containerClass = "",
  inputClass = "",
  ...rest
}) {
  const hasLeft = !!leftIcon;
  const hasRight = !!rightIcon;
  const hasValue = value !== undefined && value !== null && String(value).length > 0;

  const baseInputClasses = [
    "w-full",
    "rounded-lg border border-slate-300",
    "focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
    "outline-none",
    "p-4",
    hasLeft ? "pl-12" : "",
    hasRight ? "pr-12" : "",
    inputClass,
  ]
    .filter(Boolean)
    .join(" ");

  const iconColorClass = hasValue ? "text-slate-500" : "text-slate-300";

  return (
    <div className={`relative w-full ${containerClass}`}>
      {leftIcon && (
        <div className={`absolute inset-y-0 left-4 flex items-center ${iconColorClass}`}>
          {leftIcon}
        </div>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={baseInputClasses}
        {...rest}
      />

      {rightIcon && (
        <div className={`absolute inset-y-0 right-5 flex items-center ${iconColorClass}`}>
          {rightIcon}
        </div>
      )}
    </div>
  );
}
