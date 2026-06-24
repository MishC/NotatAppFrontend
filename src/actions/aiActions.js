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

function getUniversalFallbackFrameCss() {
  return [
    "background: linear-gradient(135deg, #4c1d95 0%, #0f766e 52%, #f8fafc 100%)",
    "border: 4px solid #4c1d95",
    "box-shadow: 0 24px 50px rgba(76,29,149,0.24), inset 0 0 0 2px rgba(255,255,255,0.36)",
  ].join("; ");
}

function applyUniversalFallbackFrame({ setFrameCss, setFrameStyle, setMsg }) {
  const css = getUniversalFallbackFrameCss();

  setFrameCss?.(css);
  setFrameStyle?.("ai");
  setMsg?.("AI frame fallback applied because OpenAI did not return CSS.");

  return { css, raw: null, fallback: true };
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

  if (error?.status === 400 && isEmptyFrameCssError(error)) {
    return "OpenAI did not return frame CSS.";
  }

  return error?.message || "Could not generate AI frame.";
}

function isEmptyFrameCssError(error) {
  return String(error?.message || "")
    .toLowerCase()
    .includes("empty frame css");
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
      return applyUniversalFallbackFrame({ setFrameCss, setFrameStyle, setMsg });
    }

    setFrameCss?.(css);
    setFrameStyle?.("ai");
    setMsg?.("AI frame generated.");
    return { css, raw: payload };
  } catch (error) {
    if (error?.status === 400 && isEmptyFrameCssError(error)) {
      return applyUniversalFallbackFrame({ setFrameCss, setFrameStyle, setMsg });
    }

    console.error(error);
    setError?.(getFrameErrorMessage(error));
    return null;
  } finally {
    setLoading?.(false);
  }
}

export const getSongAction = recommendSongAction;
export const getFrameAction = generateFrameAction;
