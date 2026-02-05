import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
            bg-[rgba(139,92,246,0.12)]
            ring-1 ring-[rgba(139,92,246,0.25)]
          "
        >
          <Icon className="h-8 w-8 text-[rgb(139,92,246)]" />
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

export function Home() {
  const navigate = useNavigate();

  const ctas = useMemo(
    () => [
      { label: "Open Todo", route: "/todo" },
      { label: "Open Diary", route: "/diary" },
      { label: "Open Calendar", route: "/calendar" }, // pridáš route neskôr
    ],
    []
  );

  const [ctaIndex, setCtaIndex] = useState(0);
  const activeCta = ctas[ctaIndex];

  useEffect(() => {
    const id = setInterval(() => {
      setCtaIndex((i) => (i + 1) % ctas.length);
    }, 5000);
    return () => clearInterval(id);
  }, [ctas.length]);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-main))]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-[rgb(var(--border-soft))] bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-[rgb(var(--primary))] shadow-sm" />
            <div className="leading-tight">
              <div className="font-semibold text-black/90">NoteApp</div>
              <div className="text-xs text-black/50">Todo • Calendar • Diary</div>
            </div>
          </div>

          <div className="w-20">
            <Header
              maxWidth="custom"
              showDate={false}
              bgColor="custom"
              customBgClass="bg-[rgb(var(--bg-main))]"
              sticky={false}
            />
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="rounded-[2.25rem] border border-[rgb(var(--border-soft))] bg-white/60 shadow-sm p-7 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div
                className="
                  inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs
                  bg-[rgb(var(--primary-soft))]
                  text-[rgb(var(--primary))]
                "
              >
                Calm • focused • organized
              </div>

              <h1 className="mt-4 text-3xl md:text-4xl font-bold text-black/90">
                One home for your duties, calendar and diary
              </h1>

              <p className="mt-3 text-black/60 max-w-2xl">
                Pick a module below.
              </p>
            </div>

            {/* Rotating CTA */}
            <button
              onClick={() => navigate(activeCta.route)}
              className="
                relative overflow-hidden
                rounded-2xl px-5 py-3 font-medium
                bg-[rgb(var(--primary))] text-white
                shadow-sm hover:shadow-md transition
                min-w-[180px]
              "
              title="Auto changes every 5s"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeCta.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="inline-flex items-center gap-2"
                >
                  {activeCta.label}
                  <ArrowRight className="h-4 w-4 opacity-90" />
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Tiles */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          <FeatureCard
            title="ToDo"
            subtitle="Tasks, deadlines, folders, overdue, done."
            Icon={ClipboardList}
            onClick={() => navigate("/todo")}
          />
          <FeatureCard
            title="Calendar"
            subtitle="FullCalendar view of your notes / tasks."
            Icon={CalendarDays}
            onClick={() => navigate("/calendar")}
          />
          <FeatureCard
            title="Diary"
            subtitle="Daily writing, quick entries, reflection."
            Icon={BookOpen}
            onClick={() => navigate("/diary")}
          />
        </div>
      </div>
    </div>
  );
}
