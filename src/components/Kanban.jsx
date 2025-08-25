// Kanban + sticky note icon (uses Tailwind colors)
export default function KanbanNoteIcon({ className = "" }) {
    return (
        <svg viewBox="0 0 64 64" aria-hidden="true" className={["h-12 w-12 md:h-14 md:w-14", className].join(" ")}>
            {/* Board outline + columns */}
            <g className="stroke-current" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="12" width="40" height="40" rx="6" className="opacity-90" />
                <line x1="17" y1="12" x2="17" y2="52" />
                <line x1="30" y1="12" x2="30" y2="52" />
                {/* small cards */}
                <rect x="8"  y="18" width="6"  height="4" rx="2" className="fill-current stroke-none opacity-20" />
                <rect x="21" y="18" width="6"  height="9" rx="2" className="fill-current stroke-none opacity-20" />
                <rect x="34" y="18" width="6"  height="6" rx="2" className="fill-current stroke-none opacity-20" />
                <rect x="8"  y="29" width="6"  height="9" rx="2" className="fill-current stroke-none opacity-20" />
                <rect x="21" y="31" width="6"  height="4" rx="2" className="fill-current stroke-none opacity-20" />
                <rect x="34" y="29" width="6"  height="9" rx="2" className="fill-current stroke-none opacity-20" />
            </g>
            {/* Sticky note with dog-eared corner */}
            <g>
                <rect x="44" y="8" width="16" height="16" rx="2" className="fill-yellow-300 stroke-yellow-400" strokeWidth="2" />
                <polygon points="60,8 60,16 52,16" className="fill-yellow-200" />
                <circle cx="52" cy="12" r="1.6" className="fill-blue-600" />
            </g>
        </svg>
    );
}
