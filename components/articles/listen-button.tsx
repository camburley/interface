"use client"

import { useState } from "react"

interface ListenButtonProps {
  spotifyUrl?: string
  readingTime: number
}

export function ListenButton({ spotifyUrl, readingTime }: ListenButtonProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      onClick={() => {
        if (spotifyUrl) {
          window.open(spotifyUrl, "_blank")
        } else {
          setExpanded((prev) => !prev)
        }
      }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-foreground/10 hover:border-foreground/20 transition-colors group"
      title={spotifyUrl ? "Listen on Spotify" : "Audio coming soon"}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground/50 group-hover:text-foreground transition-colors"
      >
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
      <span className="font-editorial-sans text-[13px] font-medium text-foreground/50 group-hover:text-foreground transition-colors">
        Listen
      </span>
      <span className="font-editorial-sans text-[13px] text-foreground/30">
        {readingTime} min
      </span>
    </button>
  )
}
