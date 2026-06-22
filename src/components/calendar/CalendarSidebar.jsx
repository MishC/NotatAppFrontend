import { isCalendarEventOverdue, toDate } from "../../helpers/calendarTaskHelpers";

export default function CalendarSidebar({
  weekendsVisible,
  onWeekendsToggle,
  currentEvents,
  loading,
  overdueOnly,
  onOverdueOnlyToggle,
  onEventClick,
}) {
  const filteredEvents = overdueOnly
    ? currentEvents.filter(isCalendarEventOverdue)
    : currentEvents;
  const listedEvents = [...filteredEvents]
    .sort((a, b) => {
      const ad = toDate(a.start)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bd = toDate(b.start)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return ad - bd;
    })
    .slice(0, 10);

  return (
    <aside className="Sidebar w-[90%] mx-auto sm:mt-10">
      <div className="w-full px-6 py-4 text-left text-lg font-semibold md:text-xl lg:text-2xl">
        <span className="block rounded-2xl pr-10">Events</span>
        {loading && <span className="mt-1 block text-sm font-medium text-slate-500">Loading...</span>}
      </div>

      <div className="mb-3 px-6 text-sm font-medium text-slate-700">
        <label className="flex items-center gap-2 rounded-2xl py-2 transition-colors hover:bg-black/[0.04]">
          <input
            type="checkbox"
            checked={weekendsVisible}
            onChange={onWeekendsToggle}
            className="h-4 w-4 accent-[rgb(var(--orange))]"
          />
          Show weekends
        </label>

        <label className="flex items-center gap-2 rounded-2xl py-2 transition-colors hover:bg-black/[0.04]">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={onOverdueOnlyToggle}
            className="h-4 w-4 accent-[rgb(var(--danger))]"
          />
          Only overdue
        </label>
      </div>

      <div className="px-6">
        <h3 className="mb-2 text-sm font-semibold text-slate-600">
          Visible events ({listedEvents.length}/{filteredEvents.length})
        </h3>
        <ul>
          {listedEvents.map((event) => (
            <SidebarEvent key={event.id} event={event} onClick={() => onEventClick?.(event)} />
          ))}
          {listedEvents.length === 0 && (
            <li className="py-3 text-sm text-slate-500">
              No events visible.
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
}

function SidebarEvent({ event, onClick }) {
  const overdue = isCalendarEventOverdue(event);

  return (
    <li className="relative py-3 text-sm">
      <span
        className={[
          "absolute left-0 top-2 h-[70%] w-1 rounded-full",
          overdue ? "bg-[rgb(var(--danger))] opacity-100" : "bg-orange-500 opacity-0",
        ].join(" ")}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={onClick}
        className="block w-full appearance-none rounded-2xl border-0 bg-transparent py-1 pl-4 pr-3 text-left font-inherit transition-colors hover:bg-black/[0.04] active:bg-black/[0.06]"
      >
      <div className={overdue ? "font-semibold text-[rgb(var(--danger-text))]" : "font-semibold text-slate-800"}>
        {event.title}
      </div>
      <div className={overdue ? "text-[rgb(var(--danger-action))]" : "text-slate-500"}>
        {toDate(event.start)?.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </div>
      </button>
    </li>
  );
}
