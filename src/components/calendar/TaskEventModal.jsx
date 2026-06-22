export default function TaskEventModal({ form, mode, onChange, onClose, onDelete, onSubmit }) {
  const updateField = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    onChange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/45 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === "create" ? "Create event" : "Edit event"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Title</span>
            <input
              value={form.title}
              onChange={updateField("title")}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[rgb(var(--orange))] focus:ring-2 focus:ring-[rgb(var(--hover-orange))]"
              autoFocus
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Content</span>
            <textarea
              value={form.content}
              onChange={updateField("content")}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[rgb(var(--orange))] focus:ring-2 focus:ring-[rgb(var(--hover-orange))]"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Start</span>
              <input
                type="datetime-local"
                value={form.startTimeLocal}
                onChange={updateField("startTimeLocal")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[rgb(var(--orange))] focus:ring-2 focus:ring-[rgb(var(--hover-orange))]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">End</span>
              <input
                type="datetime-local"
                value={form.endTimeLocal}
                onChange={updateField("endTimeLocal")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[rgb(var(--orange))] focus:ring-2 focus:ring-[rgb(var(--hover-orange))]"
              />
            </label>
          </div>

          {mode === "edit" && (
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.isDone}
                onChange={updateField("isDone")}
                className="h-4 w-4 accent-[rgb(var(--orange))]"
              />
              Done
            </label>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {mode === "edit" ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-[rgb(var(--danger-soft))] px-4 py-2 font-semibold text-[rgb(var(--danger-action))] hover:bg-[rgb(var(--danger-soft))]"
            >
              Delete
            </button>
          ) : (
            <span />
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[rgb(var(--orange))] px-4 py-2 font-semibold text-white hover:bg-[rgb(var(--orange-strong))]"
            >
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
