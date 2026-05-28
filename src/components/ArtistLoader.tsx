export default function ArtistLoader({ fullScreen = true }: { fullScreen?: boolean }) {
  // Each stroke: path d, stroke color, approximate path length, animation delay
  const strokes: { d: string; color: string; length: number; delay: string; width: number }[] = [
    // Large sweeping base stroke — like laying down the first wash
    {
      d: "M 18,130 C 45,60 90,170 130,95 C 158,42 180,68 188,88",
      color: "#C8813A",
      length: 360,
      delay: "0s",
      width: 3.5,
    },
    // Upper diagonal — second brush pass
    {
      d: "M 25,165 C 60,125 95,85 135,58 C 158,42 178,46 185,56",
      color: "#D4925A",
      length: 295,
      delay: "0.4s",
      width: 2.5,
    },
    // Closing arc — like a flourish
    {
      d: "M 52,82 C 75,50 115,45 142,68 C 168,90 170,126 145,146 C 118,166 74,155 60,126",
      color: "#E8B07A",
      length: 400,
      delay: "0.8s",
      width: 2,
    },
    // Inner calligraphic swirl
    {
      d: "M 84,98 C 92,74 114,72 126,96 C 138,120 126,143 108,148 C 90,153 76,138 82,120",
      color: "#C8813A",
      length: 220,
      delay: "1.2s",
      width: 1.5,
    },
    // Final accent dot stroke
    {
      d: "M 98,88 C 102,82 110,82 112,88",
      color: "#E8B07A",
      length: 40,
      delay: "1.55s",
      width: 2,
    },
  ];

  return (
    <div
      className={`flex flex-col items-center justify-center ${fullScreen ? "min-h-screen" : "py-24"}`}
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* Canvas */}
      <div className="relative w-60 h-60">
        {/* Faint canvas frame */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}
        />

        <svg viewBox="0 0 200 200" className="relative w-full h-full" fill="none">
          {strokes.map((s, i) => (
            <path
              key={i}
              d={s.d}
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={
                {
                  "--path-length": s.length,
                  strokeDasharray: s.length,
                  animation: `artist-draw 2.2s cubic-bezier(0.4, 0, 0.2, 1) ${s.delay} infinite`,
                } as React.CSSProperties
              }
            />
          ))}

          {/* Moving brush tip — pulses at the end of the last stroke */}
          <circle
            cx="105"
            cy="85"
            r="2.5"
            fill="#C8813A"
            style={{ animation: "brush-pulse 2.2s ease-in-out 1.55s infinite" }}
          />
        </svg>

        {/* Paintbrush handle coming in from top-right corner */}
        <svg
          viewBox="0 0 40 120"
          className="absolute -top-6 -right-5 w-8 h-20 opacity-60"
          fill="none"
          style={{ animation: "brush-move 2.2s cubic-bezier(0.4,0,0.2,1) infinite" }}
        >
          {/* Handle */}
          <rect x="16" y="0" width="8" height="70" rx="4" fill="#7A5038" />
          {/* Ferrule */}
          <rect x="15" y="66" width="10" height="8" rx="1" fill="#A0785A" />
          {/* Bristles */}
          <path d="M 15,74 C 14,90 13,108 20,116 C 27,108 26,90 25,74 Z" fill="#C8813A" />
          <path d="M 17,74 C 16,88 16,104 20,114 C 24,104 24,88 23,74 Z" fill="#D4925A" opacity="0.6" />
        </svg>
      </div>

      {/* Caption */}
      <div className="mt-8 flex items-center gap-2">
        <span
          className="text-xs uppercase tracking-[0.2em] font-semibold"
          style={{ color: "var(--text-muted)" }}
        >
          Crafting
        </span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-1 h-1 rounded-full"
              style={{
                backgroundColor: "var(--accent)",
                animation: `dot-rise 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
