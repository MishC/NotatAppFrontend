  import Plus from "./icons/Plus";

  export default function Subheader({ setShowNoteModal }) {
    const isMobile = window.innerWidth < 640;
    return (
      <div className="w-full md:max-w-7xl mx-auto px-5 mt-6">
        <div className="flex items-center gap-4 justify-center">
          <Plus
            onClick={() => setShowNoteModal(true)}
            size={isMobile ? 10 : 12}
            className="rounded-2xl text-white text-3xl grid place-items-center shadow-lg transition"
          />
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-slate-800">
        Scheduler
          </h1>
        </div>
        <p className="mt-2 text-slate-600 md:text-xl text-center">Duties</p>
      </div>
    );
  }

  
