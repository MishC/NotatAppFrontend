import React from 'react'

export default function Button() {
  return (
   <button key="calendar"      
   onClick={() => setActiveFolder("calendar")}

         className={[
        "w-full text-left px-6 py-4 text-2xl font-semibold rounded-lg transition-transform duration-200 ease-out will-change-transform relative cursor-pointer",
isActive        ? "bg-yellow-100/60 text-slate-900 translate-x-1"
        : "text-slate-700 hover:text-orange-600 hover:bg-white/40 -translate-x-0.5 hover:translate-x-3",
      ].join(" ")}
      >
 <span
        className={["absolute left-0 top-0.1 h-[70%] w-1", isActive ? "bg-orange-500" : "bg-transparent"].join(" ")}
        aria-hidden="true"
      />
  Add to Calendar
</button> 
  )
}


