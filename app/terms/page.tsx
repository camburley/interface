import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service — Burley",
  description: "Terms of Service for Burley subscription development services.",
}

export default function TermsPage() {
  return (
    <main className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <Link
          href="/"
          className="inline-block mb-12 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </Link>

        <div className="space-y-2 mb-16">
          <h1 className="font-[var(--font-bebas)] text-5xl tracking-tight">
            TERMS OF SERVICE
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            Last updated: April 5, 2026
          </p>
        </div>

        <div className="prose-terms space-y-12 font-mono text-sm text-foreground/80 leading-relaxed">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of
            Burley&apos;s subscription development services
            (&quot;Services&quot;) provided by Burley AI LLC, a Pennsylvania
            limited liability company (&quot;Burley,&quot; &quot;we,&quot;
            &quot;us&quot;). By subscribing to any lane, you (&quot;Client,&quot;
            &quot;you&quot;) agree to these Terms.
          </p>

          <section>
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground mb-4">
              1. SERVICES
            </h2>
            <div className="space-y-3">
              <p>
                1.1 Burley provides software development services on a
                subscription basis. You add tasks to your board. We build them in
                priority order. Standard-sized tasks are delivered within
                approximately 48 business hours once active.
              </p>
              <p>
                1.2 Your subscription lane determines throughput (number of
                concurrent active tasks), not a fixed quantity of hours. This is
                a managed delivery service, not hourly consulting.
              </p>
              <p>
                1.3 We reserve the right to determine whether a task is
                standard-sized. Tasks that exceed standard scope will be broken
                into multiple standard tasks.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground mb-4">
              2. SUBSCRIPTION & BILLING
            </h2>
            <div className="space-y-3">
              <p>
                2.1 Subscriptions are billed monthly via Stripe. Your billing
                cycle begins on the date of your first payment.
              </p>
              <p>
                2.2 You may pause your subscription at any time. Unused days
                carry forward when you resume. You may cancel at any time with no
                penalty. There are no long-term contracts or minimum commitments.
              </p>
              <p>
                2.3 Refunds are not provided for partial months. If you cancel
                mid-cycle, you retain access through the end of your current
                billing period.
              </p>
              <p>
                2.4 Burley may adjust pricing with 30 days written notice. Price
                changes take effect at the start of your next billing cycle.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground mb-4">
              3. INTELLECTUAL PROPERTY
            </h2>
            <div className="space-y-3">
              <p>
                3.1{" "}
                <span className="text-foreground font-medium">
                  Work Product.
                </span>{" "}
                All custom work product created specifically for you — including
                application code, designs, configurations, and documentation
                built to your specifications — is yours. Upon payment, we assign
                all right, title, and interest in such work product to you.
              </p>
              <p>
                3.2{" "}
                <span className="text-foreground font-medium">
                  Pre-Existing IP.
                </span>{" "}
                Burley retains full ownership of all tools, frameworks,
                libraries, components, systems, methodologies, and
                general-purpose code that exist prior to or independent of your
                engagement (&quot;Burley Tools&quot;). This includes but is not
                limited to: development infrastructure, deployment systems,
                internal automation, reusable component patterns, and any
                software or systems used to operate the Burley platform itself.
              </p>
              <p>
                3.3{" "}
                <span className="text-foreground font-medium">
                  License to Burley Tools.
                </span>{" "}
                Where Burley Tools are incorporated into your work product, you
                receive a perpetual, non-exclusive, royalty-free license to use
                them within the context of your project. This license does not
                grant you ownership of Burley Tools or the right to resell,
                sublicense, or distribute them independently.
              </p>
              <p>
                3.4{" "}
                <span className="text-foreground font-medium">
                  No Prior Invention Disclosure Required.
                </span>{" "}
                Burley works with multiple clients simultaneously and maintains a
                broad portfolio of pre-existing intellectual property. You
                acknowledge that Burley is not required to enumerate or disclose
                specific prior inventions. The distinction in Sections 3.1 and
                3.2 governs ownership.
              </p>
              <p>
                3.5{" "}
                <span className="text-foreground font-medium">
                  Open Source.
                </span>{" "}
                Where open-source software is used in your project, it retains
                its original license. We will not introduce open-source
                dependencies that conflict with your intended use.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground mb-4">
              4. CONFIDENTIALITY
            </h2>
            <div className="space-y-3">
              <p>
                4.1 Both parties agree to keep confidential any non-public
                information shared during the engagement, including business
                plans, technical architecture, credentials, and user data.
              </p>
              <p>
                4.2 Confidentiality obligations do not apply to information that:
                (a) is or becomes publicly available through no fault of the
                receiving party; (b) was already known to the receiving party;
                (c) is independently developed without use of confidential
                information; or (d) is required to be disclosed by law.
              </p>
              <p>
                4.3 Burley may use your company name, logo, and a general
                description of work performed in portfolios, case studies, and
                marketing materials unless you request otherwise in writing.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground mb-4">
              5. CLIENT RESPONSIBILITIES
            </h2>
            <div className="space-y-3">
              <p>
                5.1 You are responsible for providing timely feedback, approvals,
                and any materials (content, credentials, assets, third-party
                access) required for task completion.
              </p>
              <p>
                5.2 Delays caused by missing client input do not pause the
                billing cycle. If a task is blocked waiting on you, we will move
                to the next item in your queue.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground mb-4">
              6. INDEPENDENT CONTRACTOR
            </h2>
            <div className="space-y-3">
              <p>
                6.1 Burley is an independent contractor. Nothing in these Terms
                creates an employment, partnership, joint venture, or agency
                relationship.
              </p>
              <p>
                6.2 Burley works with multiple clients simultaneously. Nothing in
                these Terms restricts Burley from performing services for other
                clients, including clients in the same or similar industries.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground mb-4">
              7. NO NON-COMPETE / NO NON-SOLICITATION
            </h2>
            <p>
              7.1 These Terms impose no non-compete or non-solicitation
              obligations on either party beyond the confidentiality provisions
              in Section 4.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground mb-4">
              8. WARRANTIES & LIMITATION OF LIABILITY
            </h2>
            <div className="space-y-3">
              <p>
                8.1 Burley warrants that all work product will be delivered with
                professional care and skill. If delivered work does not meet the
                specifications described in the task, we will correct it at no
                additional charge.
              </p>
              <p>
                8.2 Services are provided &quot;as is&quot; beyond the warranty
                in 8.1. Burley makes no guarantees regarding business outcomes,
                revenue, user growth, or product-market fit.
              </p>
              <p>
                8.3 Burley&apos;s total liability for any claim arising from
                these Terms or the Services is limited to the fees paid by you in
                the three (3) months preceding the claim.
              </p>
              <p>
                8.4 Neither party is liable for indirect, incidental,
                consequential, or punitive damages.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground mb-4">
              9. TERMINATION
            </h2>
            <div className="space-y-3">
              <p>
                9.1 Either party may terminate this agreement at any time by
                canceling the subscription. No written notice period is required.
              </p>
              <p>
                9.2 Upon termination: (a) you retain ownership of all work
                product per Section 3.1; (b) Burley retains ownership of all
                Burley Tools per Section 3.2; (c) both parties continue to be
                bound by Section 4 (Confidentiality).
              </p>
              <p>
                9.3 Burley may terminate immediately if: (a) payment fails and
                is not resolved within 7 days; (b) you engage in conduct that is
                abusive, threatening, or materially disruptive to the working
                relationship.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground mb-4">
              10. DISPUTE RESOLUTION
            </h2>
            <div className="space-y-3">
              <p>
                10.1 Both parties agree to attempt to resolve any dispute
                informally before pursuing formal remedies.
              </p>
              <p>
                10.2 If informal resolution fails, disputes will be resolved by
                binding arbitration under the rules of the American Arbitration
                Association, conducted remotely. Each party bears its own costs.
              </p>
              <p>
                10.3 These Terms are governed by the laws of the Commonwealth of
                Pennsylvania without regard to conflict of laws principles.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground mb-4">
              11. GENERAL
            </h2>
            <div className="space-y-3">
              <p>
                11.1 These Terms constitute the entire agreement between the
                parties regarding the Services and supersede all prior
                agreements, proposals, or representations — written or oral —
                including any client-provided contractor agreements, NDAs, or IP
                assignment agreements, unless explicitly agreed to in a separate
                written amendment signed by both parties.
              </p>
              <p>
                11.2 Burley may update these Terms with 30 days notice. Continued
                use of the Services after notice constitutes acceptance.
              </p>
              <p>
                11.3 If any provision is held unenforceable, the remaining
                provisions continue in full force.
              </p>
              <p>
                11.4 You may not assign this agreement without Burley&apos;s
                consent. Burley may assign this agreement in connection with a
                business transfer.
              </p>
            </div>
          </section>

          <div className="pt-8 border-t border-border/30">
            <p className="text-muted-foreground text-xs">
              Burley AI LLC · Pennsylvania · cam@burley.ai
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export const dynamic = "force-static"
