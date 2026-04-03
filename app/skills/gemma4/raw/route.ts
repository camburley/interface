import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function GET() {
  const filePath = join(process.cwd(), "public", "skills", "gemma4-local.md")
  try {
    const content = readFileSync(filePath, "utf-8")
    return new NextResponse(content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch {
    return new NextResponse("Skill file not found", { status: 404 })
  }
}
