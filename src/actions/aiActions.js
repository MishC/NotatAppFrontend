import { recommendSongApi } from "../backend/aiApi";

function normalizeSongs(payload) {
  if (!Array.isArray(payload)) return [];

  return payload.map((song) => ({
    title: song?.title ?? song?.Title ?? "",
    artist: song?.artist ?? song?.Artist ?? "",
    link: song?.link ?? song?.Link ?? "",
  }));
}

export async function recommendSongAction({
  guest,
  API_URL_AI,
  diaryEntryId,
  style,
  setSongs,
  setLoading,
  setError,
  setMsg,
} = {}) {
  if (guest) {
    setError?.("Song recommendations are available only when you are logged in.");
    return [];
  }

  const id = Number(diaryEntryId);
  if (!Number.isFinite(id) || id <= 0) {
    setError?.("Save or load a diary entry before asking for song recommendations.");
    return [];
  }

  setLoading?.(true);

  try {
    const payload = await recommendSongApi({
      API_URL_AI,
      diaryEntryId: id,
      style,
    });
    const songs = normalizeSongs(payload);

    setSongs?.(songs);
    setMsg?.(songs.length ? "Song recommendations loaded." : "No song recommendations found.");
    return songs;
  } catch (e) {
    console.error(e);
    setError?.(e.message || "Could not load song recommendations.");
    return [];
  } finally {
    setLoading?.(false);
  }
}

export const getSongAction = recommendSongAction;
