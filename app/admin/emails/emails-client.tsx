"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  Send,
  Save,
  CheckCircle,
  RotateCcw,
  ChevronRight,
} from "lucide-react"

interface EmailCopy {
  subject: string
  heading: string
  body: string
}

type TemplateKey =
  | "welcome"
  | "task_done"
  | "task_review"
  | "task_in_progress"
  | "weekly_summary"

interface TemplateData {
  copy: EmailCopy
  html: string
}

const TEMPLATE_ORDER: TemplateKey[] = [
  "welcome",
  "task_done",
  "task_review",
  "task_in_progress",
  "weekly_summary",
]

const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  welcome: "Welcome Email",
  task_done: "Task Complete",
  task_review: "Ready for Review",
  task_in_progress: "Work Started",
  weekly_summary: "Weekly Summary",
}

const TEMPLATE_DESCRIPTIONS: Record<TemplateKey, string> = {
  welcome: "Sent when a client subscribes. Introduces the board and how async delivery works.",
  task_done: "Sent when a task is marked done. Includes deliverable links and what's next.",
  task_review: "Sent when a task moves to review. Prompts the client to check and give feedback.",
  task_in_progress: "Sent when work begins on a task. Optional — off by default for clients.",
  weekly_summary: "Sent weekly to clients with summary preference enabled.",
}

const VARIABLE_HINTS: Record<TemplateKey, string> = {
  welcome: "{{clientName}}, {{tierLabel}}, {{price}}",
  task_done: "{{clientName}}, {{taskTitle}}",
  task_review: "{{clientName}}, {{taskTitle}}",
  task_in_progress: "{{clientName}}, {{taskTitle}}",
  weekly_summary: "{{clientName}}, {{projectName}}, {{week}}",
}

export function EmailsClient() {
  const [templates, setTemplates] = useState<Record<TemplateKey, TemplateData> | null>(null)
  const [activeKey, setActiveKey] = useState<TemplateKey>("welcome")
  const [editCopy, setEditCopy] = useState<EmailCopy | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    fetch("/api/admin/emails")
      .then((r) => r.json())
      .then((data) => {
        if (data.templates) {
          setTemplates(data.templates)
          setEditCopy(data.templates[activeKey]?.copy ?? null)
        }
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (templates) {
      setEditCopy(templates[activeKey]?.copy ?? null)
      setDirty(false)
    }
  }, [activeKey, templates])

  async function handleSave() {
    if (!editCopy) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/emails", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: activeKey, copy: editCopy }),
      })
      const data = await res.json()
      if (data.ok) {
        setTemplates((prev) =>
          prev
            ? {
                ...prev,
                [activeKey]: { copy: data.copy, html: data.html },
              }
            : prev,
        )
        setDirty(false)
        setLiveHtml(null)
        showToast("Saved")
      }
    } catch {
      showToast("Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function handleSendTest() {
    setSendingTest(true)
    try {
      const res = await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: activeKey }),
      })
      const data = await res.json()
      if (data.ok) {
        showToast(`Test sent to ${data.sentTo}`)
      } else {
        showToast(data.error ?? "Send failed")
      }
    } catch {
      showToast("Send failed")
    } finally {
      setSendingTest(false)
    }
  }

  function handleReset() {
    if (templates) {
      setEditCopy(templates[activeKey]?.copy ?? null)
      setDirty(false)
    }
  }

  const [liveHtml, setLiveHtml] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function updateField(field: keyof EmailCopy, value: string) {
    if (!editCopy) return
    const updated = { ...editCopy, [field]: value }
    setEditCopy(updated)
    setDirty(true)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      refreshPreview(updated)
    }, 400)
  }

  async function refreshPreview(copy: EmailCopy) {
    try {
      const res = await fetch("/api/admin/emails/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: activeKey, copy }),
      })
      const data = await res.json()
      if (data.html) setLiveHtml(data.html)
    } catch {}
  }

  useEffect(() => {
    setLiveHtml(null)
  }, [activeKey])

  const previewHtml = liveHtml ?? templates?.[activeKey]?.html

  const SAMPLE_VARS: Record<string, string> = {
    clientName: "Ali Rasheed",
    tierLabel: "Core",
    price: "$4,995",
    taskTitle: "Build scanner page layout",
    projectName: "DME Engine",
    week: "2026-W16",
  }

  const resolvedSubject = editCopy
    ? editCopy.subject.replace(/\{\{(\w+)\}\}/g, (_, k: string) => SAMPLE_VARS[k] ?? `{{${k}}}`)
    : ""

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 sticky top-0 z-20 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Admin
            </Link>
            <span className="font-mono text-xs text-muted-foreground">/</span>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-accent" />
              <span className="font-mono text-xs uppercase tracking-widest">
                Email Templates
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dirty && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Discard
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className="flex items-center gap-1.5 bg-accent text-background font-mono text-xs uppercase tracking-widest px-4 py-2 hover:bg-accent/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Save className="h-3 w-3" />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleSendTest}
              disabled={sendingTest}
              className="flex items-center gap-1.5 border border-border/60 font-mono text-xs uppercase tracking-widest px-4 py-2 text-foreground hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
            >
              <Send className="h-3 w-3" />
              {sendingTest ? "Sending..." : "Send Test"}
            </button>
          </div>
        </div>
      </header>

      {toast && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 bg-card border border-border/60 px-4 py-2.5 font-mono text-xs text-foreground shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto flex" style={{ minHeight: "calc(100vh - 56px)" }}>
        {/* Sidebar - template list */}
        <aside className="w-64 border-r border-border/40 py-6 shrink-0">
          <p className="px-6 font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">
            Templates
          </p>
          <nav className="space-y-1">
            {TEMPLATE_ORDER.map((key) => (
              <button
                key={key}
                onClick={() => setActiveKey(key)}
                className={`w-full text-left px-6 py-3 flex items-center justify-between transition-colors ${
                  activeKey === key
                    ? "bg-secondary/60 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                }`}
              >
                <span className="font-mono text-xs">{TEMPLATE_LABELS[key]}</span>
                {activeKey === key && (
                  <ChevronRight className="h-3 w-3 text-accent" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Editor panel */}
          <div className="lg:w-[380px] border-r border-border/40 p-6 space-y-6 shrink-0">
            <div>
              <h2 className="font-mono text-sm font-medium text-foreground">
                {TEMPLATE_LABELS[activeKey]}
              </h2>
              <p className="font-mono text-xs text-muted-foreground mt-1 leading-relaxed">
                {TEMPLATE_DESCRIPTIONS[activeKey]}
              </p>
            </div>

            {editCopy && (
              <div className="space-y-5">
                <div>
                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
                    Subject line
                  </label>
                  <input
                    value={editCopy.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 px-3 py-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
                    Heading
                  </label>
                  <input
                    value={editCopy.heading}
                    onChange={(e) => updateField("heading", e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 px-3 py-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
                    Body text
                  </label>
                  <textarea
                    value={editCopy.body}
                    onChange={(e) => updateField("body", e.target.value)}
                    rows={4}
                    className="w-full bg-secondary/50 border border-border/50 px-3 py-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-accent transition-colors resize-y"
                  />
                </div>

                <div className="bg-secondary/30 border border-border/30 px-3 py-2.5">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                    Available variables
                  </p>
                  <p className="font-mono text-xs text-accent">
                    {VARIABLE_HINTS[activeKey]}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preview panel */}
          <div className="flex-1 bg-[#0a0a0a] p-6 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                Preview
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                Sample data — what the client sees
              </p>
            </div>

            {editCopy && (
              <div className="max-w-[620px] mx-auto mb-3 border border-border/30 bg-card/50 px-4 py-3">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                  Subject line
                </p>
                <p className="font-mono text-sm text-foreground">
                  {resolvedSubject}
                </p>
              </div>
            )}

            {previewHtml ? (
              <div className="border border-border/30 bg-[#020202] max-w-[620px] mx-auto">
                <iframe
                  srcDoc={previewHtml}
                  title="Email preview"
                  className="w-full border-0"
                  style={{ minHeight: 900, height: "100%" }}
                  sandbox="allow-same-origin"
                  onLoad={(e) => {
                    const frame = e.currentTarget
                    try {
                      const h = frame.contentDocument?.body?.scrollHeight
                      if (h) frame.style.height = `${h + 40}px`
                    } catch {}
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="font-mono text-xs text-muted-foreground">
                  Loading preview...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
