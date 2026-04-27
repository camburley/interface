"use client"

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"
import { AlertTriangle, MessageSquare, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"

type MessageRole = "user" | "assistant"

interface Message {
  id: string
  role: MessageRole
  content: string
}

interface StreamEvent {
  type: "chunk" | "done" | "error"
  content?: string
  error?: string
}

interface BoardAgentChatProps {
  projectId: string
  projectName: string
}

function parseStoredMessages(raw: string | null): Message[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item) => {
        if (!item || typeof item !== "object") return false
        const role = (item as Message).role
        const content = (item as Message).content
        return (
          (role === "user" || role === "assistant") &&
          typeof content === "string" &&
          content.trim().length > 0
        )
      })
      .map((item, index) => ({
        id: `${Date.now()}-${index}`,
        role: item.role,
        content: item.content,
      }))
  } catch {
    return []
  }
}

export function BoardAgentChat({ projectId, projectName }: BoardAgentChatProps) {
  const [open, setOpen] = useState(false)
  const [isHydrating, setIsHydrating] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const storageKey = useMemo(
    () => `burley_board_agent_chat_${projectId}`,
    [projectId],
  )

  useEffect(() => {
    setIsHydrating(true)
    const stored = parseStoredMessages(sessionStorage.getItem(storageKey))
    setMessages(stored)
    setIsHydrating(false)
  }, [storageKey])

  useEffect(() => {
    if (isHydrating) return
    const toStore = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }))
    sessionStorage.setItem(storageKey, JSON.stringify(toStore))
  }, [isHydrating, messages, storageKey])

  useEffect(() => {
    if (!open) return
    const timeout = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 0)
    return () => clearTimeout(timeout)
  }, [messages, isStreaming, open])

  async function streamReply(assistantMessageId: string, messageToSend: string) {
    const conversationHistory = messages.map(({ role, content }) => ({ role, content }))
    const response = await fetch("/api/client/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: messageToSend,
        conversationHistory,
      }),
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (response.status === 429) {
        setRateLimited(true)
      }
      throw new Error(payload?.error || "Failed to send message.")
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error("No streaming body returned by server.")

    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      let separator = buffer.indexOf("\n\n")

      while (separator !== -1) {
        const eventBlock = buffer.slice(0, separator).trim()
        buffer = buffer.slice(separator + 2)
        separator = buffer.indexOf("\n\n")

        const dataLine = eventBlock
          .split("\n")
          .find((line) => line.startsWith("data: "))
        if (!dataLine) continue

        const payload = JSON.parse(dataLine.slice(6)) as StreamEvent
        if (payload.type === "chunk" && payload.content) {
          setMessages((previous) =>
            previous.map((message) =>
              message.id === assistantMessageId
                ? { ...message, content: `${message.content}${payload.content}` }
                : message,
            ),
          )
        }

        if (payload.type === "error") {
          throw new Error(payload.error || "Streaming failed.")
        }
      }
    }
  }

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (isStreaming) return

    const messageToSend = input.trim()
    if (!messageToSend) return

    setInput("")
    setErrorMessage(null)
    setRateLimited(false)
    setOpen(true)
    const assistantMessageId = `assistant-${Date.now()}`

    setMessages((previous) => [
      ...previous,
      { id: `user-${Date.now()}`, role: "user", content: messageToSend },
      { id: assistantMessageId, role: "assistant", content: "" },
    ])

    setIsStreaming(true)
    try {
      await streamReply(assistantMessageId, messageToSend)
    } catch (error) {
      const fallback =
        error instanceof Error ? error.message : "Something went wrong while streaming."
      setErrorMessage(fallback)
      setMessages((previous) =>
        previous.map((message) =>
          message.id === assistantMessageId && !message.content.trim()
            ? { ...message, content: "I hit an error while responding. Please try again." }
            : message,
        ),
      )
    } finally {
      setIsStreaming(false)
    }
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return
    event.preventDefault()
    void handleSubmit()
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed right-0 top-0 z-50 h-screen w-full border-l border-border bg-card transition-transform duration-200 md:w-[400px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                Board Agent
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {projectName}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              aria-label="Close board agent"
            >
              <X className="size-4" />
            </Button>
          </div>

          {isHydrating ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="size-5 text-accent" />
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-3">
                  {messages.length === 0 && (
                    <div className="rounded-sm border border-border bg-background px-3 py-2">
                      <p className="font-mono text-xs text-muted-foreground">
                        Ask about task status, dependencies, and what-if scenarios.
                      </p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-sm border px-3 py-2 font-mono text-xs leading-relaxed ${
                          message.role === "user"
                            ? "border-accent/60 bg-accent/15 text-foreground"
                            : "border-border bg-background text-foreground"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {isStreaming && (
                    <div className="flex justify-start">
                      <div className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
                        <Spinner className="size-3" />
                        Agent is typing
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              </ScrollArea>

              <div className="border-t border-border p-3">
                {rateLimited && (
                  <div className="mb-2 flex items-start gap-1.5 rounded-sm border border-destructive/40 bg-destructive/10 px-2 py-1.5 font-mono text-[11px] text-destructive">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    Rate limit reached. Wait one minute before sending another request.
                  </div>
                )}

                {errorMessage && !rateLimited && (
                  <div className="mb-2 rounded-sm border border-destructive/40 bg-destructive/10 px-2 py-1.5 font-mono text-[11px] text-destructive">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={onInputKeyDown}
                    placeholder="Ask about this board..."
                    disabled={isStreaming}
                    className="font-mono text-xs"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isStreaming || !input.trim()}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    aria-label="Send message"
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <Button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="fixed bottom-6 right-6 z-50 size-12 rounded-full bg-accent text-accent-foreground shadow-xl hover:bg-accent/90"
        aria-label={open ? "Close board agent chat" : "Open board agent chat"}
      >
        <MessageSquare className="size-5" />
      </Button>
    </>
  )
}
