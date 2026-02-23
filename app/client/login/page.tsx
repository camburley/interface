"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { getFirebaseClient } from "@/lib/firebase-client"
import { toast } from "sonner"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? "/client/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { auth } = getFirebaseClient()
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await credential.user.getIdToken()

      const res = await fetch("/api/client/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })

      if (!res.ok) throw new Error("Login failed")

      router.push(redirect)
      router.refresh()
    } catch {
      toast.error("Invalid email or password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo / wordmark */}
        <div className="mb-10">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Client Portal</p>
          <h1 className="font-bebas text-4xl text-foreground tracking-tight">Burley</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-muted/30 border border-border rounded-sm px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-muted/30 border border-border rounded-sm px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-mono text-sm uppercase tracking-widest py-3 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 font-mono text-xs text-muted-foreground text-center">
          Access is by invitation only.{" "}
          <a href="mailto:cam@burley.dev" className="text-primary hover:underline">
            Contact Cam
          </a>
        </p>
      </div>
    </div>
  )
}

export default function ClientLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
