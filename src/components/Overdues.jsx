import { useMemo, useState, useEffect } from "react";
import { formatDateDDMMYYYY } from "../helpers/dateHelpers";
import { fetchOverdueNotesApi } from "../backend/notesApi";
import { fetchAllFoldersAction } from "../actions/noteActions"; 

export default function Overdues({ notes, onOpen, folders, onDelete }) {
  const [q, setQ] = useState("");
  

  const [localNotes, setLocalNotes] = useState(Array.isArray(notes) ? notes : []);

 
  useEffect(() => {
    if (Array.isArray(notes)) setLocalNotes(notes);
  }, [notes]);

 

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
            {notes.map((n) => (
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
                  {folders
                    .filter((o) => String(o.id) === String(n.folderId))
                    .map((o) => o.name)
                    .join(", ") || "—"}
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

            {notes.length === 0 && (
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
