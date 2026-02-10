import { useState, useEffect, useMemo } from "react";
import { validateNote, buildPayload } from "../helpers/noteHelpers";
import { todayYYYYMMDD } from "../helpers/dateHelpers";
import Plus from "./icons/Plus";
import { createFolderAction } from "../actions/noteActions";

export default function Noteform({
  handleAddNote,
  guest = false,
  setShowNoteModal = () => {},
}) {

  const [newNote, setNewNote] = useState(() => ({
    title: "",
    content: "",
    folderId: "",
    scheduledAt: todayYYYYMMDD(),
  }));

  const [error, setError] = useState(null);
  const [foldersLocal, setFoldersLocal] = useState(() =>folders);

  const [showInput, setShowInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // keep local folders synced with props (when parent updates)
  useEffect(() => {
    setFoldersLocal(folders);
  }, [folders]);

  const normalizeForServer = (n) => ({
    ...n,
    scheduledAt: n.scheduledAt?.trim() ? n.scheduledAt.trim() : null,
  });

  const onChangeField = (key) => (e) => {
    const value = e?.target?.value ?? "";
    setNewNote((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setNewNote({ title: "", content: "", folderId: "", scheduledAt: "" });
    setNewFolderName("");
    setShowInput(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const msg = validateNote(newNote, guest);
    if (msg) {
      setError(msg);
      return;
    }

    let noteDraft = normalizeForServer(newNote);

    // If user wants to create folder, create it first and select it.
    if (!guest && showInput && newFolderName.trim().length > 0) {
      try {
        const created = await createFolderAction({
          API_URL: API_URL2,
          folderName: newFolderName.trim(),
          setFolders: setFoldersLocal,
          setError,
        });

        // If your action returns created folder, use it.
        // If not, we still keep UI stable (no crash).
        if (created?.id != null) {
          noteDraft = { ...noteDraft, folderId: String(created.id) };
          setNewNote((prev) => ({ ...prev, folderId: String(created.id) }));
        }
      } catch (err) {
        // createFolderAction likely sets error itself, but keep safety
        setError(err?.message || "Failed to create folder");
        return;
      }
    }

    const payload = buildPayload(noteDraft, guest);

    const ok = await handleAddNote(payload);

    if (ok) {
      resetForm();
      setShowNoteModal(false);
    }
  };

  return (
    <form className="max-w-xl mx-auto w-full bg-white p-6 rounded-lg" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Title"
        autoFocus
        value={newNote.title}
        onChange={onChangeField("title")}
        className="w-full p-4 my-4 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-300"
      />

      <textarea
        placeholder="Content (optional)"
        value={newNote.content}
        onChange={onChangeField("content")}
        className="w-full p-4 my-2 mb-4 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-300"
      />

      {!guest && (
        <select
          value={newNote.folderId}
          onChange={onChangeField("folderId")}
          className="w-full p-4 my-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-300"
        >
          <option value="" disabled>
            Select a folder
          </option>
          {foldersLocal.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Plus
          size="6"
          open={showInput}
          color="bg-slate-500"
          className="rounded-lg items-center text-base"
          onClick={() => setShowInput((v) => !v)}
        />
        Add Folder
      </div>

      {showInput && !guest && (
        <input
          type="text"
          placeholder="New folder name"
          className="mt-2 border-2 border-gray-300 rounded-md p-2"
          onChange={(e) => setNewFolderName(e.target.value)}
          value={newFolderName}
        />
      )}

      <div className="w-full flex items-center gap-3 mb-5 py-3 text-xl">
        <span className="mt-1 text-red-400">Deadline</span>
        <input
          type="date"
          value={newNote.scheduledAt}
          onChange={onChangeField("scheduledAt")}
          placeholder={todayYYYYMMDD()}
          className="w-full px-4 py-3 text-lg rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      {error && (
        <div className="text-red-700 bg-red-50 mt-2 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="submit"
          className="mt-6 mb-2 mx-auto bg-orange-400 hover:bg-orange-700 text-white p-5 px-10 font-bold rounded flex items-center"
        >
          <span className="text-white font-bold text-2xl" aria-hidden="true" style={{ lineHeight: 1 }}>
            +
          </span>
          <span className="text-lg px-2" style={{ lineHeight: 1 }}>
            &nbsp;&nbsp;Add Note
          </span>
        </button>
      </div>
    </form>
  );
}
