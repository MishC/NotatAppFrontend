import { format } from "date-fns"
export default function DateComponent() {

    return (
      <div className="DateComponent max-w-[50%]">

              <div className=" flex flex-col hidden sm:block text-xs sm:text-xl text-black/70 bg-white/50 px-3 py-2 justify-left">
             <span>{format(new Date(), "EEEE MMMM do")}</span> 
             <span className="text-[rgb(var(--primary))] font-semibold">, {format(new Date(), "HH:mm")}</span>


            </div>
          </div>
    )
   }
