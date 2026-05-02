import React, { useRef } from "react";

/**
 * WebinarPoster — generates a beautiful on-brand SVG poster from webinar fields.
 * No image upload needed. Renders inline and can be used as the card visual.
 */
export default function WebinarPoster({ webinar, size = "card" }) {
  const {
    title = "Upcoming Webinar",
    speaker = "",
    date = "",
    time = "",
    platform = "",
    tag = "",
    description = "",
  } = webinar;

  const isLarge = size === "full";
  const w = isLarge ? 600 : 260;
  const h = isLarge ? 400 : 200;

  // Format date nicely
  const dateStr = date
    ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";

  // Pick accent color from tag
  const tagColors = {
    leadership: "#e07b2a",
    career: "#2a7be0",
    health: "#2ab87b",
    education: "#9b2ae0",
    entrepreneurship: "#e02a6a",
    technology: "#2ab8e0",
    motivation: "#e0c42a",
  };
  const accent = tagColors[(tag || "").toLowerCase()] || "#e07b2a";

  // Wrap text into lines
  function wrapText(text, maxChars) {
    const words = text.split(" ");
    const lines = [];
    let current = "";
    for (const word of words) {
      if ((current + " " + word).trim().length <= maxChars) {
        current = (current + " " + word).trim();
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  const titleLines = wrapText(title, isLarge ? 28 : 20);
  const titleFontSize = isLarge
    ? (title.length > 40 ? 22 : title.length > 25 ? 26 : 30)
    : (title.length > 30 ? 13 : title.length > 20 ? 15 : 17);

  const titleStartY = isLarge ? 130 : 68;
  const lineHeight = isLarge ? titleFontSize * 1.35 : titleFontSize * 1.3;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        {/* Deep navy background gradient */}
        <linearGradient id={`bg-${w}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2f4a" />
          <stop offset="100%" stopColor="#0d1f35" />
        </linearGradient>

        {/* Accent glow */}
        <radialGradient id={`glow-${w}`} cx="80%" cy="20%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>

        {/* Shimmer for decorative circle */}
        <radialGradient id={`circle-${w}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>

        <clipPath id={`clip-${w}`}>
          <rect width={w} height={h} rx={isLarge ? 16 : 0} />
        </clipPath>
      </defs>

      <g clipPath={`url(#clip-${w})`}>
        {/* Background */}
        <rect width={w} height={h} fill={`url(#bg-${w})`} />
        <rect width={w} height={h} fill={`url(#glow-${w})`} />

        {/* Decorative circles */}
        <circle cx={w * 0.85} cy={h * 0.15} r={isLarge ? 80 : 50} fill={`url(#circle-${w})`} />
        <circle cx={w * 0.85} cy={h * 0.15} r={isLarge ? 55 : 35} fill="none" stroke={accent} strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx={w * 0.85} cy={h * 0.15} r={isLarge ? 35 : 22} fill="none" stroke={accent} strokeWidth="0.5" strokeOpacity="0.5" />

        {/* Bottom left circle accent */}
        <circle cx={isLarge ? -20 : -10} cy={isLarge ? h + 20 : h + 10} r={isLarge ? 100 : 60} fill="none" stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" />

        {/* Diagonal stripe pattern (top-right) */}
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1={w - (isLarge ? 20 : 10) + i * (isLarge ? 12 : 8)}
            y1="0"
            x2={w + (isLarge ? 60 : 40) + i * (isLarge ? 12 : 8)}
            y2={isLarge ? 80 : 50}
            stroke={accent}
            strokeWidth="0.5"
            strokeOpacity="0.2"
          />
        ))}

        {/* ADORE branding strip at top */}
        <rect width={w} height={isLarge ? 36 : 22} fill={accent} fillOpacity="0.15" />
        <rect width={isLarge ? 4 : 3} height={isLarge ? 36 : 22} fill={accent} />
        <text
          x={isLarge ? 14 : 9}
          y={isLarge ? 23 : 14}
          fontFamily="Georgia, serif"
          fontWeight="700"
          fontSize={isLarge ? 13 : 8}
          fill="white"
          letterSpacing="2"
        >
          ADORE
        </text>
        <text
          x={isLarge ? 70 : 44}
          y={isLarge ? 23 : 14}
          fontFamily="Georgia, serif"
          fontSize={isLarge ? 11 : 7}
          fill="rgba(255,255,255,0.5)"
          letterSpacing="1"
        >
          {tag ? `× ${tag.toUpperCase()}` : "× WEBINAR"}
        </text>

        {/* Title lines */}
        {titleLines.slice(0, 3).map((line, i) => (
          <text
            key={i}
            x={isLarge ? 28 : 12}
            y={titleStartY + i * lineHeight}
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="700"
            fontSize={titleFontSize}
            fill="white"
          >
            {line}
          </text>
        ))}

        {/* Accent underline */}
        <rect
          x={isLarge ? 28 : 12}
          y={titleStartY + Math.min(titleLines.length, 3) * lineHeight + (isLarge ? 6 : 3)}
          width={isLarge ? 40 : 22}
          height={isLarge ? 3 : 2}
          rx="1"
          fill={accent}
        />

        {/* Speaker */}
        {speaker && (
          <text
            x={isLarge ? 28 : 12}
            y={titleStartY + Math.min(titleLines.length, 3) * lineHeight + (isLarge ? 28 : 16)}
            fontFamily="'Nunito', sans-serif"
            fontSize={isLarge ? 13 : 8}
            fill={accent}
            fontWeight="600"
          >
            👤 {speaker}
          </text>
        )}

        {/* Bottom meta bar */}
        <rect
          x="0"
          y={h - (isLarge ? 48 : 30)}
          width={w}
          height={isLarge ? 48 : 30}
          fill="rgba(0,0,0,0.35)"
        />

        {/* Date */}
        {dateStr && (
          <text
            x={isLarge ? 28 : 12}
            y={h - (isLarge ? 27 : 17)}
            fontFamily="'Nunito', sans-serif"
            fontSize={isLarge ? 12 : 7.5}
            fill="rgba(255,255,255,0.85)"
          >
            📅 {dateStr}
          </text>
        )}

        {/* Time */}
        {time && (
          <text
            x={isLarge ? 28 : 12}
            y={h - (isLarge ? 10 : 6)}
            fontFamily="'Nunito', sans-serif"
            fontSize={isLarge ? 11 : 7}
            fill="rgba(255,255,255,0.6)"
          >
            🕐 {time}{platform ? `  ·  💻 ${platform}` : ""}
          </text>
        )}

        {/* "Register" CTA badge (large only) */}
        {isLarge && (
          <>
            <rect x={w - 130} y={h - 44} width={110} height={30} rx="15" fill={accent} />
            <text
              x={w - 75}
              y={h - 24}
              fontFamily="'Nunito', sans-serif"
              fontWeight="700"
              fontSize={12}
              fill="white"
              textAnchor="middle"
            >
              Register Now →
            </text>
          </>
        )}
      </g>
    </svg>
  );
}
