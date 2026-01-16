
export default function HamburgerIcon({ className = "" }) {
    return (
        <span className="cursor-pointer hover:opacity-70 transition z-100">
        <svg viewBox="0 0 24 24" className={["h-6 w-6", className].join(" ")} aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        </span>
    );
}

