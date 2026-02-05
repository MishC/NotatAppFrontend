  import Plus from "./icons/Plus";

  export default function Subheader({ title="Scheduler", subtitle="", setShowNoteModal }) {
    const isMobile = window.innerWidth < 640;
    return (
      <div className="justify-center sm:justify-left sm:max-w-7xl mt-30">
        <div className="flex gap-4 justify-center items-center">
          <Plus
            onClick={() => setShowNoteModal(true)}
            size={isMobile ? 10 : 12}
            className="rounded-2xl text-white text-2xl grid place-items-center shadow-lg transition"
          />
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-slate-800">
            {title}
          </h1>
        </div>
        <p className="mt-2 text-slate-600 md:text-xl text-center">{subtitle}</p>
      </div>
    );
  }

  
