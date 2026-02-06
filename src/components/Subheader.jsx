  import Plus from "./icons/Plus";

  export default function Subheader({ title="Scheduler", subtitle="", setShowNoteModal }) {
    const isMobile = window.innerWidth < 640;
    
    return (
      <div className="Subheader mt-10 mb-4 sm:my-0">
        <div className="flex mx-0 gap-4 items-center">
          <Plus
            onClick={() => setShowNoteModal(true)}
            size={isMobile ? 10: 10}
            className="rounded-2xl text-white text-xl sm:text-xl grid place-items-center shadow-lg transition"
            color="bg-[rgb(var(--primary))]"
          />
          <h1 className="text-2xl  md:text-3xl font-extrabold tracking-tight text-slate-800">
            {title}
          </h1>
        </div>
        <p className="mt-2 text-slate-600 md:text-xl text-center">{subtitle}</p>
      </div>
    );
  }

  
