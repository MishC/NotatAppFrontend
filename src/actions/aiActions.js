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

function getFallbackFrameCss(description) {
  const prompt = String(description || "").toLowerCase();
  const palette = prompt.includes("blue")
    ? ["#1d4ed8", "#67e8f9", "#f8fafc"]
    : prompt.includes("pink") || prompt.includes("rose")
      ? ["#be185d", "#f9a8d4", "#fff7ed"]
      : prompt.includes("green") || prompt.includes("emerald")
        ? ["#047857", "#6ee7b7", "#f7fee7"]
        : prompt.includes("black") || prompt.includes("dark")
          ? ["#111827", "#7c3aed", "#f8fafc"]
          : ["#7c3aed", "#f59e0b", "#fff7ed"];

  return [
    `background: linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 48%, ${palette[2]} 100%)`,
    `border: 4px solid ${palette[0]}`,
    `box-shadow: 0 24px 50px ${palette[0]}33, inset 0 0 0 2px rgba(255,255,255,0.32)`,
  ].join("; ");
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
      const fallbackCss = getFallbackFrameCss(prompt);
      setFrameCss?.(fallbackCss);
      setFrameStyle?.("ai");
      setMsg?.("AI returned an empty frame, so a local frame style was applied.");
      return { css: fallbackCss, raw: payload, fallback: true };
    }

    setFrameCss?.(css);
    setFrameStyle?.("ai");
    setMsg?.("AI frame generated.");
    return { css, raw: payload };
  } catch (error) {
    console.error(error);
    if (error?.status === 400 && isEmptyFrameCssError(error)) {
      const fallbackCss = getFallbackFrameCss(prompt);
      setFrameCss?.(fallbackCss);
      setFrameStyle?.("ai");
      setMsg?.("AI returned an empty frame, so a local frame style was applied.");
      return { css: fallbackCss, raw: null, fallback: true };
    }

    setError?.(getFrameErrorMessage(error));
    return null;
  } finally {
    setLoading?.(false);
  }
}

export const getSongAction = recommendSongAction;
export const getFrameAction = generateFrameAction;
