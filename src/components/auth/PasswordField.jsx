import { useState } from "react";
import BaseInputField from "./BaseInputField";
import EyeIcon from "../icons/EyeIcon";

export default function PasswordField({
  value,
  onChange,
  placeholder = "Password",
}) {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <BaseInputField
      type={showPwd ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rightIcon={
        <EyeIcon isOpen={showPwd} onClick={() => setShowPwd((v) => !v)} />
      }
    />
  );
}
