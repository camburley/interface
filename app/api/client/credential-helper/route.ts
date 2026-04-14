import { NextRequest, NextResponse } from "next/server"
import { validateClientSession } from "@/lib/client-auth"
import { getSessionUser, isAdmin } from "@/lib/session"

const SYSTEM_PROMPT = `You are a helpful assistant that tells non-technical business owners exactly what credentials, API keys, or access they need to provide their developer before an integration can be built.

Given a service or platform name, respond with valid JSON:
{
  "service": "The service name",
  "credentials": [
    {
      "name": "What to provide (e.g. Secret Key)",
      "example": "A realistic-looking FAKE example so the user knows the format (e.g. sk_live_51T4a3wB7P... or FLWSECK-abc123def456-X)",
      "where": "Where to find it (e.g. Settings → API Keys in your Stripe dashboard)",
      "note": "Optional extra context (e.g. use the test key first, switch to live when ready)"
    }
  ],
  "tip": "One sentence of practical advice for the client"
}

Rules:
- Write for someone who is NOT technical. No jargon.
- Be specific about WHERE to find each credential (menu paths, URLs).
- Include 2-6 credentials depending on the service.
- If the service requires OAuth or app creation, explain that simply.
- If you don't recognize the service, still give a reasonable best guess and note uncertainty.
- The "example" field MUST contain a realistic-looking but completely FAKE credential so the user can visually recognize what they're looking for. Truncate long examples with "..." to keep them short. Use the real prefix/format of the service (e.g. Stripe keys start with sk_live_ or pk_live_, TikTok pixels are numeric IDs like C5N8H...). Never use a real credential.`

export async function POST(request: NextRequest) {
  const clientSession = await validateClientSession()
  const user = await getSessionUser()
  const isAuthorized = clientSession || (user && isAdmin(user.uid))

  if (!isAuthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  try {
    const { service } = await request.json()

    if (!service || typeof service !== "string" || service.trim().length < 2) {
      return NextResponse.json(
        { error: "Please provide a service name." },
        { status: 400 },
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured." },
        { status: 503 },
      )
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        temperature: 0.2,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `What credentials does a developer need to integrate: ${service.trim()}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error("[credential-helper] Anthropic error:", await response.text())
      return NextResponse.json(
        { error: "Failed to look up credentials. Please try again." },
        { status: 502 },
      )
    }

    const data = await response.json()
    const content = data.content?.[0]?.text

    if (!content) {
      return NextResponse.json(
        { error: "No response. Please try again." },
        { status: 502 },
      )
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse response. Please try again." },
        { status: 502 },
      )
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (error) {
    console.error("[credential-helper] error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }
}
