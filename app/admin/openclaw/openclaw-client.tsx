"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { RotateCw, Zap, Cpu, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProviderModel {
  id: string
  name: string
}

const MODEL_META: Record<string, { label: string; icon: typeof Cpu; color: string; desc: string }> = {
  "ollama/gemma4:26b": {
    label: "Gemma 4",
    icon: Cpu,
    color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
    desc: "Local \u00b7 Free \u00b7 M3 Max laptop",
  },
  "anthropic/claude-opus-4-6": {
    label: "Claude Opus",
    icon: Zap,
    color: "text-amber-400 border-amber-400/30 bg-amber-400/5",
    desc: "Cloud \u00b7 API billing \u00b7 Fast",
  },
}

function ModelCard({
  model,
  isActive,
  switching,
  onSelect,
}: {
  model: ProviderModel
  isActive: boolean
  switching: boolean
  onSelect: () => void
}) {
  const meta = MODEL_META[model.id] ?? {
    label: model.name,
    icon: Cpu,
    color: "text-muted-foreground border-border bg-card",
    desc: model.id,
  }
  const Icon = meta.icon

  return (
    <button
      onClick={onSelect}
      disabled={isActive || switching}
      className={`
        relative w-full text-left p-6 border transition-all duration-200
        ${isActive
          ? `${meta.color} ring-1 ring-current/20`
          : "border-border bg-card hover:border-muted-foreground/40 hover:bg-secondary/50"
        }
        ${switching ? "opacity-50 pointer-events-none" : ""}
        disabled:cursor-default
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Icon className="w-4 h-4" />
            <span className="font-mono text-sm font-medium tracking-tight">
              {meta.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">{meta.desc}</p>
          <p className="text-[10px] text-muted-foreground/60 font-mono">{model.id}</p>
        </div>
        {isActive && (
          <span className="shrink-0 text-[10px] font-mono uppercase tracking-widest opacity-70">
            Active
          </span>
        )}
      </div>
    </button>
  )
}

export function OpenClawAdmin() {
  const [primary, setPrimary] = useState<string | null>(null)
  const [providers, setProviders] = useState<ProviderModel[]>([])
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)
  const [restarting, setRestarting] = useState(false)

  async function fetchState() {
    try {
      const res = await fetch("/api/admin/openclaw")
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPrimary(data.primary)
      setProviders(data.providers)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchState() }, [])

  async function switchModel(modelId: string) {
    setSwitching(true)
    try {
      const res = await fetch("/api/admin/openclaw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch", model: modelId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPrimary(modelId)
      toast.success(`Bob switched to ${modelId}`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSwitching(false)
    }
  }

  async function restartGateway() {
    setRestarting(true)
    try {
      const res = await fetch("/api/admin/openclaw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restart" }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success("Gateway restarted")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setRestarting(false)
    }
  }

  const featured = providers.filter((p) => p.id in MODEL_META)
  const other = providers.filter((p) => !(p.id in MODEL_META))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-xl mx-auto px-6 py-16">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" />
          admin
        </Link>

        <header className="mb-12">
          <h1 className="font-mono text-sm font-medium tracking-tight text-muted-foreground mb-1">
            OpenClaw
          </h1>
          <p className="font-mono text-2xl tracking-tight">
            Bob&apos;s Model
          </p>
        </header>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading config...
          </div>
        ) : (
          <>
            <section className="space-y-3 mb-8">
              {featured.map((m) => (
                <ModelCard
                  key={m.id}
                  model={m}
                  isActive={primary === m.id}
                  switching={switching}
                  onSelect={() => switchModel(m.id)}
                />
              ))}
            </section>

            {other.length > 0 && (
              <section className="mb-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                  Other providers
                </p>
                <div className="space-y-2">
                  {other.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => switchModel(m.id)}
                      disabled={primary === m.id || switching}
                      className={`
                        w-full text-left px-4 py-3 border font-mono text-xs transition-all
                        ${primary === m.id
                          ? "border-foreground/20 bg-foreground/5 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                        }
                        disabled:cursor-default
                      `}
                    >
                      <span className="flex items-center justify-between">
                        <span>{m.name}</span>
                        {primary === m.id && (
                          <span className="text-[10px] uppercase tracking-widest opacity-60">Active</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <div className="border-t border-border pt-8">
              <button
                onClick={restartGateway}
                disabled={restarting}
                className="
                  inline-flex items-center gap-2 px-5 py-2.5 
                  border border-border bg-card font-mono text-xs
                  text-muted-foreground hover:text-foreground hover:border-muted-foreground/40
                  transition-all disabled:opacity-50
                "
              >
                <RotateCw className={`w-3.5 h-3.5 ${restarting ? "animate-spin" : ""}`} />
                {restarting ? "Restarting..." : "Restart Gateway"}
              </button>
              <p className="mt-3 font-mono text-[10px] text-muted-foreground/50">
                Model switch takes effect immediately. Restart the gateway if Bob seems stuck.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
