/**
 * Turns a YouTube or TikTok video page URL into an embeddable iframe src.
 * Returns null if the link doesn't match a recognized pattern, so callers
 * can fall back to a "can't preview this link" state instead of rendering
 * a broken iframe.
 */
export type VideoEmbedProvider = "youtube" | "tiktok";

export interface VideoEmbed {
  provider: VideoEmbedProvider;
  embedUrl: string;
}

const YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"];
const TIKTOK_HOSTS = ["tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com"];

export function isVideoPitchUrl(value: string): boolean {
  return getVideoEmbed(value) !== null;
}

export function getVideoEmbed(rawUrl: string): VideoEmbed | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  if (YOUTUBE_HOSTS.includes(url.hostname)) {
    const videoId = extractYouTubeId(url);
    return videoId ? { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${videoId}` } : null;
  }

  if (TIKTOK_HOSTS.includes(url.hostname)) {
    const videoId = extractTikTokId(url);
    return videoId ? { provider: "tiktok", embedUrl: `https://www.tiktok.com/embed/v2/${videoId}` } : null;
  }

  return null;
}

function extractYouTubeId(url: URL): string | null {
  if (url.hostname === "youtu.be") {
    return url.pathname.slice(1).split("/")[0] || null;
  }
  if (url.pathname.startsWith("/shorts/")) {
    return url.pathname.split("/")[2] || null;
  }
  if (url.pathname.startsWith("/embed/")) {
    return url.pathname.split("/")[2] || null;
  }
  return url.searchParams.get("v");
}

function extractTikTokId(url: URL): string | null {
  // Matches /@username/video/1234567890123456789
  const match = url.pathname.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}
