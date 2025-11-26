import BaseInputField from "./BaseInputField";
import EmailIcon from "../icons/EmailIcon";

export default function EmailField({
  value,
  onChange,
  placeholder = "Email Address",
}) {
  return (
    <BaseInputField
      type="email"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rightIcon={<EmailIcon />}
    />
  );
}
