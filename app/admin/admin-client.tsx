"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { ClientData, RetainerItem } from "../client/dashboard/page"
import type { MilestoneProjectSummary } from "./page"
import { Users, Plus, RefreshCw, CheckCircle, Wrench, CircleDot, ExternalLink, ChevronDown, ChevronUp, Eye, ListChecks, LayoutGrid, Mail, Github } from "lucide-react"

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
  milestoneProjects: MilestoneProjectSummary[]
}

export function AdminClient({ clients, items, milestoneProjects }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"clients" | "items" | "projects">("clients")

  // Create client form
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientProject, setClientProject] = useState("")
  const [clientMilestoneProjectId, setClientMilestoneProjectId] = useState("")
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [creatingClient, startCreateClient] = useTransition()

  // Create item form
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "")
  const [itemTitle, setItemTitle] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [itemCost, setItemCost] = useState("")
  const [creatingItem, startCreateItem] = useTransition()

  // Update item
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
  const [linkingClientId, setLinkingClientId] = useState<string | null>(null)
  const [clientMilestoneLinks, setClientMilestoneLinks] = useState<Record<string, string>>(
    Object.fromEntries(clients.map((client) => [client.id, client.milestoneProjectId ?? ""])),
  )
  const [clientGithubRepos, setClientGithubRepos] = useState<Record<string, string>>(
    Object.fromEntries(clients.map((client) => [client.id, client.githubRepo ?? ""])),
  )
  const [clientGithubPats, setClientGithubPats] = useState<Record<string, string>>(
    Object.fromEntries(clients.map(() => ["", ""])),
  )
  const [savingGithubId, setSavingGithubId] = useState<string | null>(null)

  function handleCreateClient(e: React.FormEvent) {
    e.preventDefault()
    startCreateClient(async () => {
      const res = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          projectName: clientProject,
          milestoneProjectId: clientMilestoneProjectId || null,
        }),
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
      setClientMilestoneProjectId("")
      router.refresh()
    })
  }

  async function handleLinkMilestones(clientId: string) {
    setLinkingClientId(clientId)
    try {
      const res = await fetch("/api/admin/update-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          milestoneProjectId: clientMilestoneLinks[clientId] || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update client")
      }
      toast.success(clientMilestoneLinks[clientId] ? "Milestones linked." : "Milestones unlinked.")
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update client")
    } finally {
      setLinkingClientId(null)
    }
  }

  async function handleSaveGithub(clientId: string) {
    setSavingGithubId(clientId)
    try {
      const repo = clientGithubRepos[clientId]?.trim() || null
      const pat = clientGithubPats[clientId]?.trim() || null
      const res = await fetch("/api/admin/update-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, githubRepo: repo, githubPat: pat }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? "Failed to save")
      toast.success(repo ? `Repo ${repo} connected.` : "Repo disconnected.")
      setClientGithubPats((prev) => ({ ...prev, [clientId]: "" }))
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save GitHub config")
    } finally {
      setSavingGithubId(null)
    }
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

  async function handleUpdateItem(itemId: string, status: string, actualCost?: number) {
    setUpdatingItemId(itemId)
    try {
      const res = await fetch("/api/admin/update-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, status, ...(actualCost != null && { actualCost }) }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Failed to update")
      }
      toast.success(`Item updated to ${STATUS_LABELS[status as RetainerItem["status"]] ?? status}.`)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update item")
    } finally {
      setUpdatingItemId(null)
    }
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
          <div className="flex items-center gap-4">
            <a
              href="/admin/tracker"
              className="font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
            >
              Tracker
            </a>
            <a
              href="/admin/board"
              className="font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
            >
              Board
            </a>
            <a
              href="/admin/emails"
              className="font-mono text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
            >
              <Mail className="h-3 w-3" />
              Emails
            </a>
            <a
              href="/client/dashboard"
              className="font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Client view
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border/30">
          {(["clients", "items", "projects"] as const).map((tab) => (
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
                <div className="space-y-1.5">
                  <label htmlFor="cmilestones" className="block font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    Milestones Project
                  </label>
                  <select
                    id="cmilestones"
                    value={clientMilestoneProjectId}
                    onChange={(e) => setClientMilestoneProjectId(e.target.value)}
                    className="w-full bg-muted/20 border border-border/50 rounded-sm px-4 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">None</option>
                    {milestoneProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.projectName} — {project.clientName}
                      </option>
                    ))}
                  </select>
                </div>
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
                        <div className="text-right flex flex-col items-end gap-2">
                          <div>
                            <p className="font-mono text-xl font-bold text-foreground">${c.balance}</p>
                            <p className="font-mono text-xs text-muted-foreground">balance</p>
                          </div>
                          <a
                            href={`/admin/client/${c.id}`}
                            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/40 rounded-sm px-2.5 py-1 hover:border-border"
                          >
                            <Eye className="h-3 w-3" />
                            View as client
                          </a>
                          {c.milestoneProjectId ? (
                            <>
                              <a
                                href={`/admin/projects/${c.milestoneProjectId}/milestones`}
                                className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/40 rounded-sm px-2.5 py-1 hover:border-border"
                              >
                                <ListChecks className="h-3 w-3" />
                                Milestones
                              </a>
                              <a
                                href={`/admin/board/client/${c.id}`}
                                className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/40 rounded-sm px-2.5 py-1 hover:border-border"
                              >
                                <LayoutGrid className="h-3 w-3" />
                                Client board
                              </a>
                            </>
                          ) : (
                            <span className="font-mono text-[10px] text-muted-foreground border border-border/30 rounded-sm px-2.5 py-1">
                              No milestones linked
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
                        <select
                          value={clientMilestoneLinks[c.id] ?? ""}
                          onChange={(e) =>
                            setClientMilestoneLinks((prev) => ({
                              ...prev,
                              [c.id]: e.target.value,
                            }))
                          }
                          className="min-w-[240px] bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                        >
                          <option value="">No milestone project</option>
                          {milestoneProjects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.projectName} — {project.clientName}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleLinkMilestones(c.id)}
                          disabled={linkingClientId === c.id}
                          className="font-mono text-[10px] uppercase tracking-widest border border-border/40 rounded-sm px-2.5 py-2 text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-50"
                        >
                          {linkingClientId === c.id ? "Saving..." : "Save Milestones Link"}
                        </button>
                      </div>
                      {/* GitHub repo */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
                        <Github className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <input
                          value={clientGithubRepos[c.id] ?? ""}
                          onChange={(e) =>
                            setClientGithubRepos((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                          placeholder="owner/repo"
                          className="w-[180px] bg-muted/20 border border-border/50 rounded-sm px-2.5 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                        <input
                          type="password"
                          value={clientGithubPats[c.id] ?? ""}
                          onChange={(e) =>
                            setClientGithubPats((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                          placeholder={c.githubRepo ? "PAT saved ·····" : "ghp_xxxxx"}
                          className="w-[180px] bg-muted/20 border border-border/50 rounded-sm px-2.5 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                        <button
                          onClick={() => handleSaveGithub(c.id)}
                          disabled={savingGithubId === c.id}
                          className="font-mono text-[10px] uppercase tracking-widest border border-border/40 rounded-sm px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-50"
                        >
                          {savingGithubId === c.id ? "Saving..." : c.githubRepo ? "Update" : "Connect"}
                        </button>
                        {c.githubRepo && (
                          <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Connected
                          </span>
                        )}
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

        {activeTab === "projects" && (
          <div>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <ListChecks className="h-3.5 w-3.5" />
              All Projects ({milestoneProjects.length})
            </p>
            <div className="space-y-3">
              {milestoneProjects.map((p) => {
                const progressPct = p.milestoneCount > 0 ? Math.round((p.completedCount / p.milestoneCount) * 100) : 0
                return (
                  <a
                    key={p.id}
                    href={`/admin/projects/${p.id}/milestones`}
                    className="block border border-border/40 rounded-sm p-5 hover:border-border transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-mono text-sm text-foreground font-medium group-hover:text-primary transition-colors">{p.projectName}</p>
                        <p className="font-mono text-xs text-muted-foreground mt-0.5">{p.clientName}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="font-mono text-xs text-foreground">${p.totalBudget.toLocaleString()}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">${p.funded.toLocaleString()} funded</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs text-foreground">{p.completedCount}/{p.milestoneCount}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{progressPct}%</p>
                        </div>
                        <ListChecks className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </a>
                )
              })}
              {milestoneProjects.length === 0 && (
                <div className="border border-dashed border-border/30 rounded-sm p-8 text-center">
                  <p className="font-mono text-xs text-muted-foreground">No milestone projects yet. Run the seed script first.</p>
                </div>
              )}
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
                  const isUpdating = updatingItemId === item.id
                  return (
                    <AdminItemCard
                      key={item.id}
                      item={item}
                      clientName={c?.name}
                      isUpdating={isUpdating}
                      onUpdateStatus={handleUpdateItem}
                    />
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

const STATUS_ORDER: RetainerItem["status"][] = ["pending_approval", "approved", "in_progress", "completed"]

function AdminItemCard({
  item,
  clientName,
  isUpdating,
  onUpdateStatus,
}: {
  item: RetainerItem
  clientName?: string
  isUpdating: boolean
  onUpdateStatus: (itemId: string, status: string, actualCost?: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [actualCost, setActualCost] = useState(item.actualCost?.toString() ?? item.estimatedCost.toString())

  const currentIdx = STATUS_ORDER.indexOf(item.status)
  const nextStatus = currentIdx < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIdx + 1] : null

  function handleAdvance() {
    if (!nextStatus) return
    if (nextStatus === "completed") {
      onUpdateStatus(item.id, nextStatus, Number(actualCost))
    } else {
      onUpdateStatus(item.id, nextStatus)
    }
  }

  const NEXT_ACTION_LABELS: Record<string, string> = {
    approved: "Mark Approved",
    in_progress: "Start Work",
    completed: "Mark Completed",
  }

  return (
    <div className="border border-border/40 rounded-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-mono text-xs ${STATUS_COLORS[item.status]}`}>
              {STATUS_LABELS[item.status]}
            </span>
            {clientName && (
              <span className="font-mono text-xs text-muted-foreground">· {clientName}</span>
            )}
          </div>
          <p className="font-mono text-sm text-foreground truncate">{item.title}</p>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">{formatDate(item.createdAt)}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0 ml-4">
          <p className="font-mono text-sm text-foreground">${item.estimatedCost}</p>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border/30 pt-4 space-y-4">
          {item.description && (
            <p className="font-mono text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-muted-foreground">
            <div>
              <p className="uppercase tracking-widest mb-1">Est. Cost</p>
              <p className="text-foreground">${item.estimatedCost}</p>
            </div>
            {item.actualCost != null && (
              <div>
                <p className="uppercase tracking-widest mb-1">Actual Cost</p>
                <p className="text-foreground">${item.actualCost}</p>
              </div>
            )}
            {item.approvedAt && (
              <div>
                <p className="uppercase tracking-widest mb-1">Approved</p>
                <p className="text-foreground">{formatDate(item.approvedAt)}</p>
              </div>
            )}
            {item.completedAt && (
              <div>
                <p className="uppercase tracking-widest mb-1">Completed</p>
                <p className="text-foreground">{formatDate(item.completedAt)}</p>
              </div>
            )}
          </div>

          {nextStatus && (
            <div className="flex items-center gap-3 pt-2 border-t border-border/20">
              {nextStatus === "completed" && (
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    Actual Cost ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    className="w-28 bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}
              <button
                onClick={handleAdvance}
                disabled={isUpdating}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 mt-auto"
              >
                {isUpdating ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : nextStatus === "completed" ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : nextStatus === "in_progress" ? (
                  <Wrench className="h-3.5 w-3.5" />
                ) : (
                  <CircleDot className="h-3.5 w-3.5" />
                )}
                {NEXT_ACTION_LABELS[nextStatus] ?? nextStatus}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
