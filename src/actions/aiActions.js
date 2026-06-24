import { generateFrameApi, recommendSongApi } from "../backend/aiApi";

function normalizeSongs(payload) {
  if (!Array.isArray(payload)) return [];

  return payload.map((song) => ({
    title: song?.title ?? song?.Title ?? "",
    artist: song?.artist ?? song?.Artist ?? "",
    link: song?.link ?? song?.Link ?? "",
    style: song?.style ?? song?.Style ?? "",
    country: song?.country ?? song?.Country ?? "",
  }));
}

function normalizeFrameCss(payload) {
  if (typeof payload === "string") return payload.trim();

  const css =
    payload?.css ??
    payload?.Css ??
    payload?.style ??
    payload?.Style ??
    payload?.frameCss ??
    payload?.FrameCss ??
    payload?.cssText ??
    payload?.CssText ??
    "";

  if (typeof css === "string" && css.trim()) return css.trim();

  const imageUrl =
    payload?.imageUrl ??
    payload?.ImageUrl ??
    payload?.url ??
    payload?.Url ??
    payload?.backgroundImageUrl ??
    payload?.BackgroundImageUrl ??
    "";

  if (typeof imageUrl === "string" && imageUrl.trim()) {
    const safeUrl = imageUrl.replaceAll('"', "%22").trim();
    return [
      `background-image: url("${safeUrl}")`,
      "background-size: cover",
      "background-position: center",
      "background-repeat: no-repeat",
    ].join("; ");
  }

  return "";
}

function getFrameErrorMessage(error) {
  if (error?.status === 405) {
    return "AI frame endpoint rejected POST. Expected backend route: POST /api/AI/frame. Check that the deployed backend has this controller route.";
  }

  if (error?.status === 404) {
    return "AI frame endpoint was not found. Expected backend route: POST /api/AI/frame.";
  }

  if (error?.status === 401 || error?.status === 403) {
    return "You must be logged in to generate an AI frame.";
  }

  return error?.message || "Could not generate AI frame.";
}

export async function recommendSongAction({
  guest,
  API_URL_AI,
  diaryEntryId,
  style,
  country,
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
      country,
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

export async function generateFrameAction({
  guest,
  API_URL_AI,
  description,
  setFrameCss,
  setFrameStyle,
  setLoading,
  setError,
  setMsg,
} = {}) {
  const prompt = String(description || "").trim();

  if (guest) {
    setError?.("AI frame generation is available only when you are logged in.");
    return null;
  }

  if (!prompt) {
    setError?.("Write a short frame idea first.");
    return null;
  }

  setLoading?.(true);

  try {
    const payload = await generateFrameApi({
      API_URL_AI,
      description: prompt,
    });
    const css = normalizeFrameCss(payload);

    if (!css) {
      setError?.("AI frame response did not include CSS or an image URL.");
      return null;
    }

    setFrameCss?.(css);
    setFrameStyle?.("ai");
    setMsg?.("AI frame generated.");
    return { css, raw: payload };
  } catch (error) {
    console.error(error);
    setError?.(getFrameErrorMessage(error));
    return null;
  } finally {
    setLoading?.(false);
  }
}

export const getSongAction = recommendSongAction;
export const getFrameAction = generateFrameAction;
