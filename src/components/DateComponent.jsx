import { format } from "date-fns"
import { getIsoWeekNumber } from "../helpers/dateHelpers"

export default function DateComponent() {
    const today = new Date();

    return (
      <div className="DateComponent max-w-[50%]">

              <div className=" flex flex-col hidden sm:block text-xs sm:text-xl text-black/70 bg-white/50 px-3 py-2 justify-left">
             <span>{format(today, "EEEE MMMM do")},</span> 
             <span className="text-black/90 font-semibold">&nbsp;{format(today, "HH:mm")}</span>
             <span className="block text-sm sm:text-base text-black/60 font-semibold">
              Week {getIsoWeekNumber(today)}
             </span>


            </div>
          </div>
    )
   }
