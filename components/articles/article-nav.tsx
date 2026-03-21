"use client"

import Link from "next/link"
import { SplitFlapText, SplitFlapAudioProvider } from "@/components/split-flap-text"
import { AudioPlayerBar } from "./audio-player-bar"

export function ArticleNav() {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <div
          className="max-w-[1248px] mx-auto px-6 flex items-center justify-between"
          style={{ height: "56px" }}
        >
          <Link href="/" className="flex items-center">
            <SplitFlapAudioProvider>
              <div className="h-[32px] w-[100px] flex items-center shrink-0">
                <div className="scale-[0.18] origin-left whitespace-nowrap">
                  <SplitFlapText text="BURLEY" speed={40} />
                </div>
              </div>
            </SplitFlapAudioProvider>
          </Link>
          <div className="flex items-center" style={{ gap: "24px" }}>
            <Link
              href="/articles"
              className="font-editorial-sans text-[15px] font-normal text-foreground/60 hover:text-foreground transition-colors"
            >
              Articles
            </Link>
            <Link
              href="/#apply"
              className="font-editorial-sans text-[15px] font-normal text-foreground/60 hover:text-foreground transition-colors"
            >
              Work with me
            </Link>
          </div>
        </div>
      </nav>
      <AudioPlayerBar />
      {/* Spacer to offset fixed nav height */}
      <div style={{ height: "56px" }} />
    </>
  )
}
