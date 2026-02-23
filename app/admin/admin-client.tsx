"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { ClientData, RetainerItem } from "../client/dashboard/page"
import { Users, Plus, RefreshCw, CheckCircle, Clock, Wrench, CircleDot, ExternalLink } from "lucide-react"

const STATUS_LABELS: Record<RetainerItem["status"], string> = {
  pending_approval: "Pending",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
}

const STATUS_COLORS: Record<RetainerItem["status"], string> = {
  pending_approval: "text-amber-400",
  approved: "text-emerald-400",
  in_progress: "text-blue-400",
  completed: "text-muted-foreground",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

interface Props {
  clients: ClientData[]
  items: RetainerItem[]
}

export function AdminClient({ clients, items }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"clients" | "items">("clients")

  // Create client form
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientProject, setClientProject] = useState("")
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [creatingClient, startCreateClient] = useTransition()

  // Create item form
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "")
  const [itemTitle, setItemTitle] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [itemCost, setItemCost] = useState("")
  const [creatingItem, startCreateItem] = useTransition()

  function handleCreateClient(e: React.FormEvent) {
    e.preventDefault()
    startCreateClient(async () => {
      const res = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clientName, email: clientEmail, projectName: clientProject }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create client")
        return
      }
      setInviteLink(data.inviteLink)
      toast.success(`Client created. Invite link generated.`)
      setClientName("")
      setClientEmail("")
      setClientProject("")
      router.refresh()
    })
  }

  function handleCreateItem(e: React.FormEvent) {
    e.preventDefault()
    startCreateItem(async () => {
      const res = await fetch("/api/admin/create-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          title: itemTitle,
          description: itemDescription,
          estimatedCost: Number(itemCost),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create item")
        return
      }
      toast.success("Item added. Client will see it immediately.")
      setItemTitle("")
      setItemDescription("")
      setItemCost("")
      router.refresh()
    })
  }

  const clientItems = (clientId: string) => items.filter((i) => i.clientId === clientId)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 sticky top-0 z-10 backdrop-blur-sm bg-background/80">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bebas text-2xl tracking-tight">Burley</span>
            <span className="font-mono text-xs text-muted-foreground border border-border/50 rounded-sm px-2 py-0.5 bg-primary/10 text-primary">
              Admin
            </span>
          </div>
          <a
            href="/client/dashboard"
            className="font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Client view
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border/30">
          {(["clients", "items"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-mono text-xs uppercase tracking-widest px-5 py-3 transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "clients" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Create client form */}
            <div className="lg:col-span-2">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">New Client</p>
              <form onSubmit={handleCreateClient} className="space-y-4">
                {[
                  { id: "cname", label: "Name", value: clientName, set: setClientName, placeholder: "Chase Koopmans" },
                  { id: "cemail", label: "Email", value: clientEmail, set: setClientEmail, placeholder: "chase@example.com" },
                  { id: "cproject", label: "Project", value: clientProject, set: setClientProject, placeholder: "Grain Ledger" },
                ].map((f) => (
                  <div key={f.id} className="space-y-1.5">
                    <label htmlFor={f.id} className="block font-mono text-xs text-muted-foreground uppercase tracking-widest">
                      {f.label}
                    </label>
                    <input
                      id={f.id}
                      required
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full bg-muted/20 border border-border/50 rounded-sm px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={creatingClient}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest py-2.5 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {creatingClient ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Create & Send Invite
                </button>
              </form>

              {inviteLink && (
                <div className="mt-4 p-4 bg-emerald-400/5 border border-emerald-400/20 rounded-sm space-y-2">
                  <p className="font-mono text-xs text-emerald-400 uppercase tracking-widest">Invite Link</p>
                  <p className="font-mono text-xs text-muted-foreground break-all leading-relaxed">{inviteLink}</p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success("Copied!") }}
                    className="font-mono text-xs text-emerald-400 hover:underline"
                  >
                    Copy to clipboard
                  </button>
                </div>
              )}
            </div>

            {/* Client list */}
            <div className="lg:col-span-3">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                All Clients ({clients.length})
              </p>
              <div className="space-y-3">
                {clients.map((c) => {
                  const ci = clientItems(c.id)
                  return (
                    <div key={c.id} className="border border-border/40 rounded-sm p-5 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-sm text-foreground font-medium">{c.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{c.email}</p>
                          <p className="font-mono text-xs text-primary mt-0.5">{c.projectName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xl font-bold text-foreground">${c.balance}</p>
                          <p className="font-mono text-xs text-muted-foreground">balance</p>
                        </div>
                      </div>
                      {ci.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                          {ci.slice(0, 5).map((item) => (
                            <span key={item.id} className={`font-mono text-xs ${STATUS_COLORS[item.status]}`}>
                              · {item.title}
                            </span>
                          ))}
                          {ci.length > 5 && (
                            <span className="font-mono text-xs text-muted-foreground">+{ci.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
                {clients.length === 0 && (
                  <div className="border border-dashed border-border/30 rounded-sm p-8 text-center">
                    <p className="font-mono text-xs text-muted-foreground">No clients yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "items" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Add item form */}
            <div className="lg:col-span-2">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">Add Scope Item</p>
              <form onSubmit={handleCreateItem} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="iclient" className="block font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    Client
                  </label>
                  <select
                    id="iclient"
                    required
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-muted/20 border border-border/50 rounded-sm px-4 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ititle" className="block font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    Item Title
                  </label>
                  <input
                    id="ititle"
                    required
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    placeholder="Risk slider clarity update"
                    className="w-full bg-muted/20 border border-border/50 rounded-sm px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="idesc" className="block font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    Description
                  </label>
                  <textarea
                    id="idesc"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    rows={3}
                    placeholder="Clarify whether the slider shows gross impact or margin impact per bushel..."
                    className="w-full bg-muted/20 border border-border/50 rounded-sm px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="icost" className="block font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    Estimated Cost ($)
                  </label>
                  <input
                    id="icost"
                    required
                    type="number"
                    min="1"
                    value={itemCost}
                    onChange={(e) => setItemCost(e.target.value)}
                    placeholder="75"
                    className="w-full bg-muted/20 border border-border/50 rounded-sm px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingItem || clients.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest py-2.5 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {creatingItem ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Add Item
                </button>
              </form>
            </div>

            {/* Items list */}
            <div className="lg:col-span-3">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
                All Items ({items.length})
              </p>
              <div className="space-y-2">
                {items.map((item) => {
                  const c = clients.find((cl) => cl.id === item.clientId)
                  return (
                    <div key={item.id} className="border border-border/40 rounded-sm px-5 py-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-mono text-xs ${STATUS_COLORS[item.status]}`}>
                            {STATUS_LABELS[item.status]}
                          </span>
                          {c && (
                            <span className="font-mono text-xs text-muted-foreground">· {c.name}</span>
                          )}
                        </div>
                        <p className="font-mono text-sm text-foreground truncate">{item.title}</p>
                        <p className="font-mono text-xs text-muted-foreground mt-0.5">{formatDate(item.createdAt)}</p>
                      </div>
                      <p className="font-mono text-sm text-foreground shrink-0">${item.estimatedCost}</p>
                    </div>
                  )
                })}
                {items.length === 0 && (
                  <div className="border border-dashed border-border/30 rounded-sm p-8 text-center">
                    <p className="font-mono text-xs text-muted-foreground">No items yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
