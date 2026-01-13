export function IslamicPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top left corner ornament */}
      <svg
        className="absolute top-0 left-0 w-48 h-48 text-primary/10 geometric-shimmer"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path d="M0 0L100 50L200 0V100L150 150L100 100L50 150L0 100V0Z" fill="currentColor" />
        <path d="M100 50L150 100L100 150L50 100L100 50Z" fill="currentColor" fillOpacity="0.5" />
      </svg>

      {/* Top right corner ornament */}
      <svg
        className="absolute top-0 right-0 w-48 h-48 text-secondary/10 geometric-shimmer"
        viewBox="0 0 200 200"
        fill="none"
        style={{ animationDelay: "1s" }}
      >
        <path d="M200 0L100 50L0 0V100L50 150L100 100L150 150L200 100V0Z" fill="currentColor" />
        <path d="M100 50L50 100L100 150L150 100L100 50Z" fill="currentColor" fillOpacity="0.5" />
      </svg>

      {/* Bottom left corner ornament */}
      <svg
        className="absolute bottom-0 left-0 w-48 h-48 text-secondary/10 geometric-shimmer"
        viewBox="0 0 200 200"
        fill="none"
        style={{ animationDelay: "0.5s" }}
      >
        <path d="M0 200L100 150L200 200V100L150 50L100 100L50 50L0 100V200Z" fill="currentColor" />
        <path d="M100 150L150 100L100 50L50 100L100 150Z" fill="currentColor" fillOpacity="0.5" />
      </svg>

      {/* Bottom right corner ornament */}
      <svg
        className="absolute bottom-0 right-0 w-48 h-48 text-primary/10 geometric-shimmer"
        viewBox="0 0 200 200"
        fill="none"
        style={{ animationDelay: "1.5s" }}
      >
        <path d="M200 200L100 150L0 200V100L50 50L100 100L150 50L200 100V200Z" fill="currentColor" />
        <path d="M100 150L50 100L100 50L150 100L100 150Z" fill="currentColor" fillOpacity="0.5" />
      </svg>

      {/* Center geometric star pattern */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] text-primary/[0.03]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <polygon
          points="200,10 250,150 400,150 280,230 320,380 200,290 80,380 120,230 0,150 150,150"
          fill="currentColor"
        />
      </svg>

      {/* Side decorative lines */}
      <div className="absolute left-8 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
      <div className="absolute right-8 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
    </div>
  )
}
