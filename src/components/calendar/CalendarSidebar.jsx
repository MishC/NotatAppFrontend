import { isCalendarEventOverdue, toDate } from "../../helpers/calendarTaskHelpers";

export default function CalendarSidebar({
  weekendsVisible,
  onWeekendsToggle,
  currentEvents,
  loading,
  overdueOnly,
  onOverdueOnlyToggle,
}) {
  const listedEvents = overdueOnly
    ? currentEvents.filter(isCalendarEventOverdue)
    : currentEvents;

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-900">Events</h2>
        {loading && <span className="text-sm text-slate-500">Loading...</span>}
      </div>

      <div className="mb-5 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={weekendsVisible}
            onChange={onWeekendsToggle}
            className="h-4 w-4 accent-[rgb(var(--orange))]"
          />
          Show weekends
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={onOverdueOnlyToggle}
            className="h-4 w-4 accent-[rgb(var(--danger))]"
          />
          Only overdue
        </label>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-600">
          Visible events ({listedEvents.length})
        </h3>
        <ul className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
          {listedEvents.map((event) => (
            <SidebarEvent key={event.id} event={event} />
          ))}
          {listedEvents.length === 0 && (
            <li className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
              No events visible.
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
}

function SidebarEvent({ event }) {
  const overdue = isCalendarEventOverdue(event);

  return (
    <li className={overdue ? "rounded-lg bg-[rgb(var(--danger-soft))] px-3 py-2 text-sm" : "rounded-lg bg-slate-50 px-3 py-2 text-sm"}>
      <div className={overdue ? "font-semibold text-[rgb(var(--danger-text))]" : "font-semibold text-slate-800"}>
        {event.title}
      </div>
      <div className={overdue ? "text-[rgb(var(--danger-action))]" : "text-slate-500"}>
        {toDate(event.start)?.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </li>
  );
}
