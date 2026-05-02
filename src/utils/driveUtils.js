/**
 * Convert various Google Drive URL formats to embed/view/thumbnail URLs
 */

/** Extract the Google Drive file ID from any share/view/embed URL */
export function extractDriveId(url) {
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
 * Returns an array of thumbnail URLs to try in order.
 * Use with the DriveImage component which cycles through on error.
 */
export function getDriveThumbnailUrls(url) {
  if (!url) return [];
  const id = extractDriveId(url);
  if (!id) return [];
  return [
    `https://drive.google.com/thumbnail?id=${id}&sz=w400`,
    `https://drive.google.com/uc?export=view&id=${id}`,
    `https://lh3.googleusercontent.com/d/${id}`,
  ];
}

/** Backwards compat — returns the first URL to try */
export function getDriveThumbnailUrl(url) {
  const urls = getDriveThumbnailUrls(url);
  return urls[0] || null;
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
