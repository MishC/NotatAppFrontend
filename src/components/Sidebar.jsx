export default function Sidebar({folderOptions, activeFolder, guest, handleFolderClick}) {
    return (
        <div className="Sidebar">

              {/** Folders sidebar  */}

            {folderOptions.map((opt) => {
              const isActive =
                (activeFolder == null && opt.id == null) ||
                String(activeFolder) === String(opt.id);

              const label = (opt.label === "All" && guest) ? "Notes" : opt.label;


              return (
                <button
                  key={opt.id ?? "all"}
                  onClick={() => handleFolderClick(opt)}
                  className={label==="Overdue" ? "w-full text-red-500 text-left px-6 py-4 text-2xl font-semibold relative cursor-pointer" : "w-full text-left px-6 py-4 text-2xl font-semibold relative cursor-pointer"}
                >
                  <span
                    className={[
                      "absolute left-0 top-0.5 h-[70%] w-1",
                      isActive ? "bg-orange-500" : "bg-transparent",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  {label}
                </button>
              );
            })}


        </div>
    )

}