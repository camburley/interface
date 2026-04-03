import type { Metadata } from "next"
import { SkillPage } from "@/components/skill-page"

export const metadata: Metadata = {
  title: "Burley — Run Gemma 4 Locally",
  description:
    "Free agent skill: Run Google's Gemma 4 locally on your machine. No API key, no cloud, no cost. Paste into your agent and go.",
}

export default function Gemma4SkillPage() {
  return (
    <SkillPage
      name="Run Gemma 4 Locally"
      description="Google's most capable open model. Multimodal (text + image + audio). 256K context. Runs on your hardware for free."
      skillFile="gemma4-local.md"
      rawUrl="/skills/gemma4/raw"
      githubUrl="https://github.com/camburley/skills/blob/main/gemma4-local/SKILL.md"
      agentPrompt="Set up Gemma 4 on my machine."
    />
  )
}
