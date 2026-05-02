/**
 * Convert various Google Drive URL formats to embed/view URLs
 */

/** Extract the Google Drive file ID from any share/view/embed URL */
function extractDriveId(url) {
  if (!url) return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

export function getDriveEmbedUrl(url) {
  if (!url) return null;
  if (url.includes("/preview") || url.includes("embed")) return url;
  const id = extractDriveId(url);
  if (id) return `https://drive.google.com/file/d/${id}/preview`;
  return url;
}

/**
 * Returns a thumbnail URL that browsers can load as an <img> src.
 *
 * WHY uc?export=view instead of /thumbnail:
 *   The /thumbnail endpoint sets restrictive CORS headers and often returns
 *   a 403 for publicly-shared files when loaded cross-origin from a browser.
 *   The `uc?export=view` endpoint is the same URL Drive's own "preview" page
 *   uses for image display — it respects the file's sharing settings and
 *   works as a direct <img> src.
 *   We add &sz=w400 via the thumbnail API as a fallback, but prefer uc.
 */
export function getDriveThumbnailUrl(url) {
  if (!url) return null;
  const id = extractDriveId(url);
  if (id) {
    // uc?export=view works for images shared as "Anyone with the link"
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }
  return null;
}

export function getDriveViewUrl(url) {
  if (!url) return null;
  const id = extractDriveId(url);
  if (id) return `https://drive.google.com/file/d/${id}/view`;
  return url;
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
