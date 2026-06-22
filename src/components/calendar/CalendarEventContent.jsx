export default function CalendarEventContent(eventInfo) {
  return (
    <div className="fc-task-content">
      <span className="fc-task-time">{eventInfo.timeText}</span>
      <span className="fc-task-title">{eventInfo.event.title}</span>
    </div>
  );
}
