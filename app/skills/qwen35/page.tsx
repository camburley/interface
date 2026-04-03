import type { Metadata } from "next"
import { SkillPage } from "@/components/skill-page"

export const metadata: Metadata = {
  title: "Burley — Run Qwen 3.5 Locally",
  description:
    "Free agent skill: Run Alibaba's Qwen 3.5 locally. Near-Opus reasoning on consumer hardware. No API costs.",
}

export default function Qwen35SkillPage() {
  return (
    <SkillPage
      name="Run Qwen 3.5 Locally"
      description="Near-Opus reasoning on consumer hardware. Open source. No API costs. Runs on a Mac Mini."
      skillFile="qwen35-local.md"
      rawUrl="/skills/qwen35/raw"
      githubUrl="https://github.com/camburley/skills/blob/main/qwen35-local/SKILL.md"
      agentPrompt="Set up Qwen 3.5 on my machine."
    />
  )
}
