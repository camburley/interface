"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react"

interface AudioPlayerState {
  isPlaying: boolean
  isVisible: boolean
  articleTitle: string
  progress: number
  speed: number
  currentSentence: string
}

interface AudioPlayerContextType extends AudioPlayerState {
  play: (title: string, text: string) => void
  pause: () => void
  resume: () => void
  close: () => void
  setSpeed: (speed: number) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null)

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext)
  if (!ctx) throw new Error("useAudioPlayer must be used within AudioPlayerProvider")
  return ctx
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isVisible: false,
    articleTitle: "",
    progress: 0,
    speed: 1,
    currentSentence: "",
  })

  const sentencesRef = useRef<string[]>([])
  const currentIndexRef = useRef(0)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const speedRef = useRef(1)
  const isPlayingRef = useRef(false)

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel()
    utteranceRef.current = null
  }, [])

  const speakSentence = useCallback((index: number) => {
    if (index >= sentencesRef.current.length) {
      setState((s) => ({ ...s, isPlaying: false, progress: 100, currentSentence: "" }))
      isPlayingRef.current = false
      return
    }

    const text = sentencesRef.current[index]
    currentIndexRef.current = index

    const progress = Math.round((index / sentencesRef.current.length) * 100)
    setState((s) => ({ ...s, progress, currentSentence: text }))

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = speedRef.current
    utterance.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.name.includes("Samantha") || v.name.includes("Alex") || v.name.includes("Daniel")
    )
    if (preferred) utterance.voice = preferred

    utterance.onend = () => {
      if (isPlayingRef.current) {
        speakSentence(index + 1)
      }
    }

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && isPlayingRef.current) {
        speakSentence(index + 1)
      }
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  const play = useCallback(
    (title: string, text: string) => {
      stopSpeaking()

      const cleaned = text
        .replace(/[#*_`~\[\]()>]/g, "")
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim()

      const sentences = cleaned
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.length > 2)

      sentencesRef.current = sentences
      currentIndexRef.current = 0
      isPlayingRef.current = true

      setState({
        isPlaying: true,
        isVisible: true,
        articleTitle: title,
        progress: 0,
        speed: speedRef.current,
        currentSentence: "",
      })

      speakSentence(0)
    },
    [stopSpeaking, speakSentence]
  )

  const pause = useCallback(() => {
    window.speechSynthesis.cancel()
    isPlayingRef.current = false
    setState((s) => ({ ...s, isPlaying: false }))
  }, [])

  const resume = useCallback(() => {
    isPlayingRef.current = true
    setState((s) => ({ ...s, isPlaying: true }))
    speakSentence(currentIndexRef.current)
  }, [speakSentence])

  const close = useCallback(() => {
    stopSpeaking()
    isPlayingRef.current = false
    setState({
      isPlaying: false,
      isVisible: false,
      articleTitle: "",
      progress: 0,
      speed: 1,
      currentSentence: "",
    })
  }, [stopSpeaking])

  const setSpeed = useCallback(
    (speed: number) => {
      speedRef.current = speed
      setState((s) => ({ ...s, speed }))
      if (isPlayingRef.current) {
        window.speechSynthesis.cancel()
        speakSentence(currentIndexRef.current)
      }
    },
    [speakSentence]
  )

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  return (
    <AudioPlayerContext.Provider
      value={{ ...state, play, pause, resume, close, setSpeed }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}
