export type LiveConfig = {
  id?: number | string;
  is_active: boolean;
  video_url: string | null;
  descricao?: string | null;
};

export function extractYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;

  const trimmedUrl = url.trim();
  if (!trimmedUrl) return null;

  const normalizedUrl = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;

  try {
    const parsedUrl = new URL(normalizedUrl);
    const hostname = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();

    if (hostname === 'youtu.be') {
      const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];
      return videoId || null;
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com' || hostname === 'music.youtube.com') {
      if (parsedUrl.pathname === '/watch') {
        return parsedUrl.searchParams.get('v');
      }

      const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
      const [prefix, videoId] = pathSegments;

      if (prefix === 'embed' || prefix === 'shorts' || prefix === 'live') {
        return videoId || null;
      }
    }
  } catch {
    const fallbackMatch = trimmedUrl.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
    return fallbackMatch?.[1] || null;
  }

  return null;
}

export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
}