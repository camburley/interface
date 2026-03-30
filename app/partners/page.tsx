import { PartnersHero } from "@/components/partners/hero"
import { PartnersLogoBar } from "@/components/partners/logo-bar"
import { PartnersHowItWorks } from "@/components/partners/how-it-works"
import { PartnersAbout } from "@/components/partners/about"
import { PartnersBenefits } from "@/components/partners/benefits"
import { PartnersPricing } from "@/components/partners/pricing"
import { PartnersRiskReversal } from "@/components/partners/risk-reversal"
import { PartnersRecentWork } from "@/components/partners/recent-work"
import { PartnersFaq } from "@/components/partners/faq"
import { PartnersBooking } from "@/components/partners/booking"
import { PartnersFooter } from "@/components/partners/footer"
import { PartnersTaskBuilder } from "@/components/partners/task-builder"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Burley — Async Software Delivery, Subscribed",
  description:
    "Add tasks to your queue. Work moves through the board. Standard-sized items turn around fast. No hourly billing, no scoping calls. One monthly price, predictable delivery.",
}

export default function PartnersPage() {
  return (
    <main className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />
      <div className="relative z-10">
        <PartnersHero />
        <PartnersLogoBar />
        <PartnersHowItWorks />
        <PartnersAbout />
        <PartnersBenefits />
        <PartnersPricing />
        <PartnersTaskBuilder />
        <PartnersRiskReversal />
        <PartnersRecentWork />
        <PartnersFaq />
        <PartnersBooking />
        <PartnersFooter />
      </div>
    </main>
  )
}

export const dynamic = "force-static"
