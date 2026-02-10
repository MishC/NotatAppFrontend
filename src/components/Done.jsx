import { useMemo, useState } from "react";
import { formatDateDDMMYYYY } from "../helpers/dateHelpers";

export default function Overdues({ notes = [], onOpen, onDelete }) {
  const [q, setQ] = useState("");

  // folderId -> label map
  const folderLabelById = useMemo(() => {
    const map = {};
    for (const f of folderOptions) {
      map[String(f.id)] = f.label;
    }
    return map;
  }, [folderOptions]);

  // filter notes
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return notes;

    return notes.filter((n) => {
      const title = (n.title || "").toLowerCase();
      const content = (n.content || "").toLowerCase();
      return title.includes(t) || content.includes(t);
    });
  }, [notes, q]);

  return (
    <div className="w-[80%] mt-6 mx-auto sm:mx-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search overdue…"
          className="w-full sm:w-80 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-300"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Title</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Deadline</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Folder</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.map((n) => (
              <tr key={n.id} className="hover:bg-red-50/40">
                <td className="px-4 py-3">
                  <button
                    className="font-semibold text-slate-900 hover:text-red-600"
                    onClick={() => onOpen?.(n)}
                    title="Open"
                  >
                    {n.title || "(no title)"}
                  </button>
                </td>

                <td className="px-4 py-3 font-semibold text-red-700">
                  {formatDateDDMMYYYY(n.scheduledAt)}
                </td>

                <td className="px-4 py-3 text-slate-700">
                  {folderLabelById[String(n.folderId)] || "—"}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100"
                      onClick={() => onOpen?.(n)}
                    >
                      Edit
                    </button>

                    <button
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => onDelete?.(n)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={4}>
                  No overdue notes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
