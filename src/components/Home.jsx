import React from "react";
import { motion } from "framer-motion";
import { ClipboardList, CalendarDays, BookOpen, ArrowRight } from "lucide-react";
import Header from "./Header";
function FeatureCard({ title, subtitle, Icon, onClick }) {
  return (
    
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="
        group w-full text-left
        rounded-3xl border border-black/10
        bg-white/70 backdrop-blur
        shadow-sm hover:shadow-md
        p-6 md:p-7
        transition
      "
    >
      <div className="flex items-start gap-4">
        <div
          className="
            rounded-2xl p-4
            bg-[rgba(255,140,0,0.12)]
            ring-1 ring-[rgba(255,140,0,0.25)]
          "
        >
          <Icon className="h-8 w-8 text-[rgb(255,140,0)]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg md:text-xl font-semibold text-black/90">
              {title}
            </h3>
            <ArrowRight className="h-5 w-5 text-black/30 group-hover:text-black/60 transition" />
          </div>
          <p className="mt-1 text-sm md:text-base text-black/60">{subtitle}</p>
        </div>
      </div>
    </motion.button>
  );
}

export function Home({ onNavigate }) {
  // onNavigate("duties" | "calendar" | "diary")
  return (
    <div className="min-h-screen max-h-100vh bg-[rgb(245,255,245)]">

      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-black/10 bg-white/70 backdrop-blur ">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-[rgb(255,140,0)] shadow-sm" />
            <div className="leading-tight">
              <div className="font-semibold text-black/90">NoteApp</div>
              <div className="text-xs text-black/50">Scheduler • Calendar • Diary</div>
            </div>
          </div>

          <div className="text-xs md:text-sm text-black/50">
            Orange + light green theme
          </div>
              <div className="w-20"><Header maxWidth="10px" showDate={false} bgColor="custom" customBgClass="bg-[rgb(245,255,245)]" /></div>

        </div>
      </div>

                


      {/* Hero */}
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div
          className="
            rounded-[2.25rem]
            border border-black/10
            bg-white/60
            shadow-sm
            p-7 md:p-10
          "
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs
                              bg-[rgba(255,140,0,0.12)] text-[rgb(170,90,0)]
                              ring-1 ring-[rgba(255,140,0,0.25)]">
                Minimal • fast • organized
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-bold text-black/90">
                One home for your duties, calendar and diary
              </h1>
              <p className="mt-3 text-black/60 max-w-2xl">
                Pick a module below.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onNavigate?.("/")}
                className="
                  rounded-2xl px-4 py-3 font-medium
                  bg-[rgb(255,140,0)] text-white
                  shadow-sm hover:shadow-md transition
                "
              >
              </button>
              <button
                onClick={() => onNavigate?.("calendar")}
                className="
                  rounded-2xl px-4 py-3 font-medium
                  bg-white/80 text-black/80
                  border border-black/10
                  hover:bg-white transition
                "
              >
                Open Calendar
              </button>
            </div>
          </div>
        </div>

        {/* 3 Tiles */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          <FeatureCard
            title="ToDo"
            subtitle="Tasks, deadlines, folders, overdue, done."
            Icon={ClipboardList}
            onClick={() => onNavigate?.("/")}
          />
          <FeatureCard
            title="Calendar"
            subtitle="FullCalendar view of your notes / tasks."
            Icon={CalendarDays}
            onClick={() => onNavigate?.("calendar")}
          />
          <FeatureCard
            title="Diary"
            subtitle="Daily writing, quick entries, reflection."
            Icon={BookOpen}
            onClick={() => onNavigate?.("diary")}
          />
        </div>

        {/* Footer hint */}
        <div className="sticky bottom-0 mt-10 text-xs text-black/45">
        </div>
      </div>
    </div>
  );
}
