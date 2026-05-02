import React, { useState } from "react";
import { getDriveThumbnailUrls } from "../utils/driveUtils";

/**
 * DriveImage — renders a Google Drive thumbnail with automatic fallback.
 *
 * Google Drive thumbnail URLs can fail for several reasons:
 *   - Ad blockers blocking Google tracking domains
 *   - CORS restrictions on certain endpoints
 *   - File not shared as "Anyone with the link"
 *   - Browser privacy settings
 *
 * This component tries each URL in sequence on error, then renders
 * the `fallback` prop if all URLs fail.
 *
 * Usage:
 *   <DriveImage
 *     url={podcast.videoUrl}          // any Drive share/view/embed URL
 *     thumbnailUrl={podcast.thumbnailUrl}  // optional manual override
 *     alt="Podcast thumbnail"
 *     className="my-img-class"
 *     fallback={<div className="thumb-placeholder">...</div>}
 *   />
 */
export default function DriveImage({ url, thumbnailUrl, alt, className, style, fallback }) {
  // Build the list of URLs to try: manual override first, then auto-generated
  const candidates = React.useMemo(() => {
    const list = [];
    if (thumbnailUrl) list.push(thumbnailUrl);
    list.push(...getDriveThumbnailUrls(url));
    // Deduplicate
    return [...new Set(list)];
  }, [url, thumbnailUrl]);

  const [index, setIndex] = useState(0);

  // All URLs failed — render fallback
  if (index >= candidates.length) {
    return fallback || null;
  }

  return (
    <img
      src={candidates[index]}
      alt={alt || ""}
      className={className}
      style={style}
      onError={() => setIndex((i) => i + 1)}
      // Reset index if the URL prop changes (e.g. different card)
      key={candidates[index]}
    />
  );
}
