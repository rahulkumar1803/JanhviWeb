"use client";

import Image from "next/image";
import { useState } from "react";

export function isVideoUrl(url: string): boolean {
  return (
    /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url) ||
    url.includes("/video/upload/")
  );
}

interface MediaGalleryProps {
  media: string[];
  title: string;
}

export default function MediaGallery({ media, title }: MediaGalleryProps) {
  const [active, setActive] = useState(0);

  // Filter out any empty/null URLs before rendering
  const validMedia = (media ?? []).filter((url) => typeof url === "string" && url.trim() !== "");

  if (validMedia.length === 0) return null;

  // Clamp active index in case it's out of range after filtering
  const safeActive = Math.min(active, validMedia.length - 1);
  const current = validMedia[safeActive];
  const isVideo = isVideoUrl(current);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Main Viewer ── */}
      <div className="relative rounded-2xl overflow-hidden border border-[#4A2510] shadow-2xl aspect-[4/3]">
        {isVideo ? (
          <video
            key={current}
            src={current}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={current}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 800px"
            className="object-cover"
            priority
          />
        )}

        {/* Category badge slot (passed via overlay child if needed) */}

        {/* Prev / Next arrows */}
        {validMedia.length > 1 && (
          <>
            <button
              onClick={() =>
                setActive((a) => (a - 1 + validMedia.length) % validMedia.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
              aria-label="Previous"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % validMedia.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
              aria-label="Next"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Dot indicators */}
        {validMedia.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {validMedia.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === safeActive ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to media ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Video play indicator overlay */}
        {isVideo && (
          <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Video
          </div>
        )}
      </div>

      {/* ── Thumbnails ── */}
      {validMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validMedia.map((url, i) => {
            const isVid = isVideoUrl(url);
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  i === safeActive
                    ? "border-[#C8813A] shadow-lg shadow-[#C8813A]/30"
                    : "border-transparent hover:border-[#C8813A]/50"
                }`}
                aria-label={`View media ${i + 1}`}
              >
                {isVid ? (
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <Image
                    src={url}
                    alt={`${title} ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
                {isVid && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
                {/* Active frame */}
                {i === safeActive && (
                  <div className="absolute inset-0 ring-2 ring-[#C8813A] ring-inset rounded-lg" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
