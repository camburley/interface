"use client"

import { useAudioPlayer } from "./audio-player-provider"

const SPEEDS = [1, 1.5, 2]

export function AudioPlayerBar() {
  const { isVisible, isPlaying, articleTitle, progress, speed, currentSentence, pause, resume, close, setSpeed } =
    useAudioPlayer()

  if (!isVisible) return null

  const nextSpeed = () => {
    const idx = SPEEDS.indexOf(speed)
    setSpeed(SPEEDS[(idx + 1) % SPEEDS.length])
  }

  return (
    <div
      className="sticky top-[56px] z-40 bg-[oklch(0.12_0_0)] border-b border-foreground/5 overflow-hidden"
      style={{
        animation: "slideDown 0.3s ease-out",
      }}
    >
      {/* Progress bar */}
      <div className="h-[2px] bg-foreground/5 w-full">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-[980px] mx-auto px-6 flex items-center justify-between h-[44px]">
        {/* Left: play/pause + title + current sentence */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={isPlaying ? pause : resume}
            className="w-[28px] h-[28px] flex items-center justify-center rounded-full border border-foreground/15 hover:border-foreground/30 transition-colors shrink-0"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-foreground/70">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-foreground/70 ml-0.5">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          <div className="min-w-0 flex-1 flex items-center gap-3">
            <span className="font-editorial-sans text-[12px] font-medium text-foreground/60 whitespace-nowrap shrink-0">
              {articleTitle}
            </span>
            {currentSentence && (
              <>
                <span className="text-foreground/15 shrink-0">|</span>
                <span className="font-editorial-serif text-[12px] italic text-foreground/30 truncate">
                  {currentSentence}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: speed + close */}
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button
            onClick={nextSpeed}
            className="px-2 py-0.5 rounded font-editorial-sans text-[11px] font-medium text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5 transition-colors"
            aria-label={`Playback speed ${speed}x`}
          >
            {speed}x
          </button>

          <button
            onClick={close}
            className="w-[24px] h-[24px] flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors text-foreground/30 hover:text-foreground/60"
            aria-label="Close player"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
