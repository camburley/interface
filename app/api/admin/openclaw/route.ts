import { NextResponse } from "next/server"
import { getSessionUser, isAdmin } from "@/lib/session"
import { readFile, writeFile } from "fs/promises"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)
const CONFIG_PATH = `${process.env.HOME}/.openclaw/openclaw.json`

async function requireAdmin() {
  const user = await getSessionUser()
  if (!user || !isAdmin(user.uid)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const raw = await readFile(CONFIG_PATH, "utf-8")
    const config = JSON.parse(raw)

    const bobAgent = config.agents?.list?.find((a: any) => a.id === "bob")
    const primary = bobAgent?.model?.primary ?? config.agents?.defaults?.model?.primary ?? "unknown"

    const providers = Object.entries(config.models?.providers ?? {}).flatMap(
      ([providerKey, provider]: [string, any]) =>
        (provider.models ?? []).map((m: any) => ({
          id: `${providerKey}/${m.id}`,
          name: `${m.name} (${providerKey})`,
        }))
    )

    return NextResponse.json({ primary, providers })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { action, model } = await req.json()

  if (action === "switch" && model) {
    try {
      const raw = await readFile(CONFIG_PATH, "utf-8")
      const config = JSON.parse(raw)

      const bobIdx = config.agents.list.findIndex((a: any) => a.id === "bob")
      if (bobIdx === -1) {
        return NextResponse.json({ error: "Bob agent not found in config" }, { status: 404 })
      }

      const bob = config.agents.list[bobIdx]
      const oldPrimary = bob.model.primary

      if (!bob.model.fallbacks) bob.model.fallbacks = []
      bob.model.fallbacks = bob.model.fallbacks.filter((f: string) => f !== model)
      if (oldPrimary !== model) {
        bob.model.fallbacks.unshift(oldPrimary)
      }
      bob.model.primary = model

      config.agents.list[bobIdx] = bob
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2))

      return NextResponse.json({ ok: true, primary: model })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (action === "restart") {
    try {
      const { stdout, stderr } = await execAsync("openclaw gateway restart", {
        timeout: 15000,
        env: { ...process.env, PATH: `/usr/local/bin:/opt/homebrew/bin:${process.env.HOME}/.nvm/versions/node/v22.22.0/bin:${process.env.PATH}` },
      })
      return NextResponse.json({ ok: true, output: stdout || stderr })
    } catch (e: any) {
      return NextResponse.json({ error: e.message, output: e.stderr }, { status: 500 })
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
