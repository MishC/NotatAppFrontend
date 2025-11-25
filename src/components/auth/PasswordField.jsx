import { useState } from "react";

export default function PasswordField({
  value,
  onChange,
  placeholder = "Password",
}) {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={showPwd ? "text" : "password"}
        placeholder={placeholder}
        className="w-full p-4 pr-12 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg"
        value={value}
        onChange={onChange}
      />

      <button
        type="button"
        onClick={() => setShowPwd((prev) => !prev)}
        className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
      >
        {showPwd ? (
          // 👁️ Eye open
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[21px] h-[21px]"
          >
            <circle cx="10.5" cy="10.3" r="3.5" fill="currentColor"></circle>
            <path
              d="M10.5 15.55C7.28 15.55 3.95 13.87 1.29 10.3 
                 C3.95 6.73 7.28 5.05 10.5 5.05
                 C13.72 5.05 17.05 6.73 19.71 10.3
                 C17.05 13.87 13.72 15.55 10.5 15.55Z"
              stroke="currentColor"
              strokeWidth="2.1"
            />
          </svg>
        ) : (
          // 👁️ Eye closed
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[21px] h-[21px]"
          >
            <circle cx="10.5" cy="10.3" r="3.5" fill="currentColor"></circle>
            <path
              d="M10.5 15.55C7.28 15.55 3.95 13.87 1.29 10.3 
                 C3.95 6.73 7.28 5.05 10.5 5.05
                 C13.72 5.05 17.05 6.73 19.71 10.3
                 C17.05 13.87 13.72 15.55 10.5 15.55Z"
              stroke="currentColor"
              strokeWidth="2.1"
            />
            <line
              x1="2"
              y1="18.5"
              x2="19"
              y2="2"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
