import { HeroSection } from "@/components/hero-section"
import { TechStackSection } from "@/components/tech-stack-section"
import { MvpBenefitsSection } from "@/components/mvp-benefits-section"
import { PullQuoteSection } from "@/components/pull-quote-section"
import { WorkSection } from "@/components/work-section"
import { ProcessSection } from "@/components/process-section"
import { FaqSection } from "@/components/faq-section"
import { ApplicationFormSection } from "@/components/application-form-section"
import { FooterSection } from "@/components/footer-section"
import { SideNav } from "@/components/side-nav"

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <SideNav />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10">
        <HeroSection />
        <TechStackSection />
        <MvpBenefitsSection />
        <PullQuoteSection />
        <WorkSection />
        <ProcessSection />
        <FaqSection />
        <ApplicationFormSection />
        <FooterSection />
      </div>
    </main>
  )
}

export const dynamic = 'force-static'
