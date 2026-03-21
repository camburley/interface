"use client"

import { useAudioPlayer } from "./audio-player-provider"

interface ListenButtonProps {
  articleTitle: string
  articleContent: string
  readingTime: number
}

export function ListenButton({ articleTitle, articleContent, readingTime }: ListenButtonProps) {
  const { play, isVisible, isPlaying, pause, resume } = useAudioPlayer()

  const handleClick = () => {
    if (isVisible) {
      if (isPlaying) pause()
      else resume()
    } else {
      play(articleTitle, articleContent)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-foreground/10 hover:border-foreground/20 transition-colors group"
      title={isVisible ? (isPlaying ? "Pause" : "Resume") : "Listen to this article"}
    >
      {isVisible && isPlaying ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-accent group-hover:text-accent/80 transition-colors"
        >
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isVisible ? "text-accent" : "text-foreground/50"} group-hover:text-accent transition-colors`}
        >
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      )}
      <span className={`font-editorial-sans text-[13px] font-medium transition-colors ${isVisible ? "text-accent" : "text-foreground/50 group-hover:text-foreground"}`}>
        {isVisible ? (isPlaying ? "Listening" : "Paused") : "Listen"}
      </span>
      {!isVisible && (
        <span className="font-editorial-sans text-[13px] text-foreground/30">
          {readingTime} min
        </span>
      )}
    </button>
  )
}
