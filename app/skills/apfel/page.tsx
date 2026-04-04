import type { Metadata } from "next"
import { SkillPage } from "@/components/skill-page"

export const metadata: Metadata = {
  title: "Burley — Apple's Hidden On-Device LLM",
  description:
    "Free agent skill: Use Apple's built-in on-device LLM from the command line. No API keys, no cloud, no subscriptions. Already on your Mac.",
}

export default function ApfelSkillPage() {
  return (
    <SkillPage
      name="Apple's Hidden On-Device LLM"
      description="Every Apple Silicon Mac has a built-in AI model. Apfel wraps it in a CLI and OpenAI-compatible server. No downloads, no API keys, no cost."
      skillFile="apfel-macos.md"
      rawUrl="/skills/apfel.md"
      githubUrl="https://github.com/camburley/skills/blob/main/apfel-macos/SKILL.md"
      agentPrompt="Set up Apfel on my Mac so I can use Apple's on-device LLM."
    />
  )
}
