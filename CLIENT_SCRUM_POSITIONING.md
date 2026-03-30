# Client SCRUM Board Positioning Report
> Generated: March 11, 2026 — from exhaustive Upwork conversation analysis

---

## 1. ALI R. — DOJO TECH LABS LLC (Prediction Quant)

### Contracts
| ID | Title | Status |
|---|---|---|
| 42502597 | Seeking Expert Developer for Prediction Markets Analytics Platform | ACTIVE |
| 42565264 | Frontend UI Developer (Framer) Needed for Prediction Market Analytics App | ACTIVE |

### What It Is
Prediction market analytics platform identifying +EV and arbitrage opportunities across Polymarket and Kalshi. Deterministic decision engine, not a betting bot.

### Contract 42502597 — Backend Engine (COMPLETE — 6/6 milestones paid, $0 remaining)
| M# | Deliverable | Amount | Status |
|---|---|---|---|
| 1 | Deterministic Prime/Hedge/Arbitrage rule definitions. Pure scoring and stake-sizing functions. Hard guardrails (max loss, liquidity, eligibility). Venue-agnostic signal JSON contract. Golden test fixtures and unit tests. Signal lifecycle rules. No frontend, analytics, or historical work. | $500 | Paid |
| 2 | All 4 signal types LIVE. Hedge/Middle/Arb activated with cross-platform mappings. | $1,500 | Paid |
| 3 | Production REST API + deep-links to Polymarket/Kalshi + server-side risk caps. | $2,500 | Paid |
| 4 | Firebase persistence + API docs + performance checks + final Loom walkthrough. Defect coverage included. | $2,600 | Paid |
| 5 | Auto-journal at CTA click. Signal snapshot persistence, OPEN→CLOSED lifecycle, analytics-ready fields per Backend API Input Checklist. | $600 | Paid |
| 6 | AI-Powered Market Mapper: Auto-enumerate markets, semantic matching via embeddings, GPT settlement analysis, admin review dashboard. ~$20/mo ongoing API costs. | $600 | Paid |
| | **Total** | **$8,300** | **Complete** |

### Contract 42565264 — Frontend UI (7/8 paid, 1 active in escrow)
| M# | Deliverable | Amount | Status |
|---|---|---|---|
| 1 | App shell, auth screens, Prime Bets + Hedge Bets modules | $1,400 | Paid |
| 2 | Arbitrage Bets, Middle Bets, Journal | $1,400 | Paid |
| 3 | Analytics Dashboard, polish, handoff | $700 | Paid |
| 4 | Stripe subscription integration + webhooks & persistence (Checkout, webhooks, DB persistence, backend enforcement + frontend paywall, admin override. No proration/trials/coupons in v1.) | $1,000 | Paid |
| 5 | Mobile Responsiveness across UI | $800 | Paid |
| 6 | +EV (Directional) signal type with guardrails and Kelly-based sizing. Backend: +EV emitter (≥4% net edge), resolution objectivity gate, liquidity gate, Kelly sizing buckets, aggression toggle, 1.5% max/bet, MIDDLE fully deprecated. Frontend: /bets/ev page, aggression toggle, max exposure setting, sports filtering for Arb/+EV. | $2,000 | Paid |
| 7 | Merge hedge signals into arbitrage with dual execution paths on a single card. Remove Hedge from nav/filters/analytics. Hedge-only signals absorbed as arb variants. Journal + analytics updated. | $750 | Paid |
| **8** | **v1 Feature Hardening**: Remove Prime + Prime EV Badge Logic, Filter System + Filter Drawer, Liquidity Display on cards, Hide Opportunity (per-user persistence). Build into current layout; grid redesign deferred to separate milestone. | **$3,650** | **Active & funded. Due Mar 18.** |

### NDA signed (Burley AI LLC)

### Financial Summary
- Backend contract: **COMPLETE** — 6/6 paid = $8,300
- Frontend contract: 7/8 paid = $8,050 | 1 active in escrow = $3,650
- **Total paid (released):** $16,350
- **In escrow (M8, due Mar 18):** $3,650
- Cam needs to start M8 and submit work to Ali by Wed, Mar 18

### Current Sprint — What's Actively Happening
- Ali testing +EV dashboard with debug console
- Sports markets live: **NBA, NFL, MLB, NHL, NCAAB, Soccer (Premier League, Champions League, La Liga, Bundesliga, Serie A, Ligue 1, MLS, World Cup), Tennis (ATP, WTA, Grand Slams), UFC/MMA, Golf (PGA, LPGA), Boxing, Darts**
- Esports tracked but mostly live-only events (not showing in UI)
- NO-side evaluation now live in prod (was hardcoded to YES only)
- Florida Panthers/Governor mapping fix merged to production
- Ali recording Loom videos with feedback regularly

### Backlog — What Needs to Be Done (AFTER current $3,650 milestone)
| Item | Priority | Notes |
|---|---|---|
| Fix remaining sports +EV cross-matching edge cases | HIGH | NCAAB vs NCAAW same school |
| Esports market coverage | MEDIUM | Mostly live-only events; may punt until live-market support |
| Grid/UI redesign | NEXT MILESTONE | Ali explicitly deferred: "Once V1 is live and we have real user interaction data, we can revisit the grid redesign as a separate milestone" |
| Mobile responsiveness | MEDIUM | $800 scope, not yet funded |
| Spreads/totals support (currently moneyline only) | LOW | Future phase |
| Prediction Flow engine | LOW | Pushed to V2 by Ali due to scope/cost |

### Known Bugs
| Bug | Severity | Details |
|---|---|---|
| Sports phantom edges | HIGH | System compared YES prices where YES meant different teams across platforms |
| Esports not surfacing | MEDIUM | Markets exist with +EV but not showing in debug console |
| NCAAB/NCAAW confusion | MEDIUM | Men's and women's basketball at same school cross-matching |

### Key Decisions Made
- Prime signal type REMOVED, replaced conceptually with Prediction Flow (then pushed to V2)
- Pre-game only for sports (no live-game odds)
- Blanket 0.5% EV minimum for all markets
- OpenAI embeddings moved to Pinecone for semantic market mapping
- Provider screen for user's own OpenAI API key

---

## 2. CHASE K. — Grain Ledger

### Contracts
| ID | Title | Status |
|---|---|---|
| 42425696 | AI Developer Needed to Build Grain Price Prediction Tool | CLOSED |
| 42897197 | Hauling Calculator Upgrade — Iowa State Model | ACTIVE |

### What It Is
Grain marketing decision tool for corn and soybean farmers. Breakeven calculator, sales tracker, risk snapshot. Live at **grainledger.vercel.app**.

### Completed Milestones (Contract 42425696 — Original MVP, ~$5,000)
| # | Deliverable | Status |
|---|---|---|
| M1 | Prototype (pivoted from prediction → ledger/breakeven) | DONE |
| M2 | Wireframes + UX Lock | DONE |
| M3 | Core Data Model + Auth (email/password, persistence) | DONE |
| M4 | Breakeven Builder + Sales Tracker (itemized: seed/fert/chem/fuel/land/overhead/insurance/interest/drying/labor) | DONE |
| M5 | Dashboard polish (Farm at a Glance, corn/soybean breakeven split, positioning, mobile Safari fix) | DONE |

### Completed Milestones (Contract 42897197 — Iterations)
| Item | Amount | Status |
|---|---|---|
| Iowa State hauling calculator (interpolation, elevator-to-elevator, standard/custom toggle) | $350 | DONE |
| Risk slider | $75 | DONE |
| Expense line items | $125 | DONE |
| Admin dashboard (users, last login, activity) | $300 | DONE |
| Percentage Sold on dashboard/sales | from balance | DONE |
| Year Switcher | from balance | DONE |
| Delivery Tracking (progress bar, completion state) | from balance | DONE (Mar 10) |

### Current Sprint — What's Actively Happening
- Chase actively validating with farmers — "extremely positive" feedback
- $1K iteration balance set up through client portal (burley.ai)
- Delivery tracking just approved by Chase (Mar 11)
- Chase meeting farmers and collecting real-world UX feedback
- Infrastructure remains on Cam's accounts; Chase explicitly deferred migration (Jan 21): "for now I'm happy to have you keep managing the infrastructure while I finish farmer validation"
- Chase said (Mar 3): "I'm going to run with this version for a bit and get real feedback from the group. Once I've got solid direction from actual usage, I'll circle back and we can build from there."

### Backlog — What Needs to Be Done
| Item | Priority | Notes |
|---|---|---|
| Ongoing farmer feedback iteration | HIGH | Chase running pilot testing, will circle back with Phase 2 direction |
| Search by tracking number / customer name | LOW | Farmer feedback item |
| "Pending Pickup" bucket for label-created shipments | LOW | UX enhancement |
| Phase 2 scoping | WAITING | Chase will initiate when farmer feedback is consolidated |

### Known Bugs
- None currently reported. Location field bug was fixed. Mobile Safari Firebase bug was fixed.

### Key Decisions Made
- Pivoted from AI prediction tool to ledger/breakeven approach (Dec 17)
- Clarity-first messaging ("what this is NOT / who it's FOR")
- Breakeven split by crop (corn and soybean separately)
- Iowa State Extension hauling rates as defensible standard
- Admin dashboard for pilot visibility

---

## 3. JOHN L. — FedEx Dashboard

### Contracts
| ID | Title | Status |
|---|---|---|
| 42615545 | Custom FedEx Dashboard and Alerting | ACTIVE |

### What It Is
Custom FedEx shipment tracking dashboard with intelligent warning/off-track alerting. Real-time sync via FedEx API every 15 minutes.

### Completed Milestones
| # | Deliverable | Status |
|---|---|---|
| M1 | Initial dashboard + FedEx API integration | DONE |
| M2 | Warning/Off-Track alerting system | DONE |

### M2 Details (Completed Jan 26)
- **Off-Track rules**: Past delivery date, no scan 48h+, not out for delivery by 10:30am
- **Warning rules**: Not delivered by expected delivery time (dynamic per tracking number)
- Historical event tracking in DB
- Delivery exception handling (business close, local issue)
- Copy widget for FedEx tracking links
- Dynamic thresholds (e.g., Riposta always 5pm)
- GitHub repo shared with John

### Current Sprint — What's Actively Happening
- **Infrastructure migration IN PROGRESS** — John is finally ready to migrate (Mar 10)
  - Asked about one-time migration fee
  - Cam agreed to handle it
  - Need: John's Supabase, Upstash, Vercel accounts
- App currently running on Cam's Pro Vercel + Supabase accounts

### Backlog — What Needs to Be Done
| Item | Priority | Notes |
|---|---|---|
| Infrastructure migration to John's accounts | URGENT | Ongoing carrying cost on Cam's infra |
| M3: Delivery schedule change tracking | HIGH | Store previous expected delivery dates, sorting/filtering/alerting |
| M3: Sync refinement | MEDIUM | Fixed sync safeguard issue, may need more edge cases |
| Search by tracking number/customer name/reference | MEDIUM | John requested |
| "Pending Pickup" bucket | LOW | For label-created-but-not-picked-up shipments |
| "OK" marking for reviewed warnings | LOW | Prevent duplicate checking efforts |

### Known Bugs
| Bug | Severity | Details |
|---|---|---|
| Rescheduled package edge cases | LOW | FedEx-side: some packages show incorrect location after reschedule |

### Key Decisions Made
- Off-track based on expected delivery TIME (not fixed time of day)
- Exceptions always go to Off-Track (Delivery Exception, Business Close, Local Issue)
- Pre-game label creation shipments excluded from main dashboard view
- Historical event tracking stored for schedule change detection

---

## 4. JULIANNA M. — DME Engine (Estate Planning)

### Contracts
| ID | Title | Status |
|---|---|---|
| 42976408 | Lead MVP Developer – Launch the "DME Engine" in 4 Weeks | ACTIVE |

### What It Is
AI-driven estate planning assessment tool. Users complete a risk profile, receive a scorecard, and get matched to relevant decisions/agents. Live at **dme-engine.vercel.app**.

### Milestone Structure
| Phase | Deliverable | Amount | Status |
|---|---|---|---|
| Phase 1 | Design Sprint (prototype, 3 iterations, pattern library) | $1,250 | COMPLETE |
| M2 | Core Lock Completion + Analytics (guardianship, distribution, executor/trustee, Firebase auth, GA4, ad pixels) | $1,000 | SCOPED — awaiting funding |
| M3 | Full Intake (people/relationships, assets, guardianship details, distribution details, healthcare/POA, special conditions) | $2,500 | SCOPED |
| M4 | Review, Payment & Document Generation (summary review, Stripe checkout, PDF generation, trust funding checklist) | $2,500 | SCOPED |
| M5 | Dashboard, Updates & Launch (plan overview, life events/annual review, admin panel, QA, launch support) | $1,500 | SCOPED |

**Full build (M2–M5): $7,500**
**Total including Phase 1: $8,750**

Full MVP scope and pricing sent to Julianna on March 10 with detailed breakdown of every screen, feature, and technical architecture.

### Phase 1 Delivery History
| Iteration | Date | Delivered |
|---|---|---|
| V1 | Feb 24 | Full assessment flow (11 screens), live staging, Loom walkthrough |
| V2 | Mar 2 | All V1 feedback implemented (time estimates, copy, CTA, jurisdiction gate, relationship/children options), Loom walkthrough |
| V2 feedback | Mar 6 | Time framing restructured into 2 phases, scorecard restructured |
| V3 (Phase 1 final) | Mar 10 | Hook screen, backup agent removal, "I'll decide later", progress signals — all live. Phase 1 declared complete. |

### Current Sprint — What's Actively Happening
- **Phase 1 is COMPLETE** — all V3 feedback implemented and live
- Full MVP scope (M2–M5, $7,500) delivered to Julianna on Mar 10
- Julianna gathering feedback from preliminary user group to validate MVP direction
- Julianna went full-time on DME
- Awaiting Julianna's response on full build scope to begin M2

### What Phase 1 Delivered
- Live interactive prototype (11 screens, 3 iterations)
- Hook screen ("See your estate planning risk profile in 60 seconds")
- Risk Profile flow: state selection, minor children, real estate, marital status, financial authority, trust status
- Risk Scorecard with diagnosis arc, personalized results + email capture
- Decision Makers: financial agent, healthcare agent (backup removed, "I'll decide later" escape valves)
- Section completion screen with progress summary
- Jurisdiction gate (UT-only, other states → Coming Soon with email capture)
- Two-phase progress system (Risk Profile ~60 sec / Core Decisions ~8 min)
- Two-column desktop layout with micro-education sidebar
- Pattern library at /patternlibrary
- Responsive design (mobile + desktop)
- Brand identity: Playfair Display, Inter, aubergine/lime/lavender
- Deployed to Vercel with auto-deploy from GitHub

### Backlog — What Needs to Be Done (in M2–M5)
| Item | Milestone | Notes |
|---|---|---|
| Guardianship section (conditional, 2 screens) | M2 | Only if minor children |
| Distribution Style (outright/staggered/trustee discretion) | M2 | |
| Executor & Trustee (2 screens + conflict validation) | M2 | |
| Firebase/Firestore persistence + auth | M2 | Email/password + optional Google/Apple |
| GA4 + Meta pixel + TikTok pixel + UTM capture | M2 | Cam recommended including before ad spend begins |
| People & Relationships (3 screens) | M3 | |
| Asset Overview (5 screens) | M3 | |
| Healthcare & POA (2 screens) | M3 | |
| Special Conditions (4 screens) | M3 | |
| Summary review + legal disclaimers | M4 | |
| Stripe checkout ($499 flat or tiered) | M4 | |
| PDF document generation (Will, Trust, POA, Healthcare Directive) | M4 | |
| Trust Funding Checklist | M4 | |
| Dashboard + life events/annual review | M5 | |
| Admin panel (edit questions, view submissions) | M5 | |
| QA + launch support | M5 | |

### Known Bugs
- None reported

### Key Decisions Made
- Backup agent removed for MVP (reduces friction)
- "I'll decide later" escape valves on agent screens
- Risk scorecard is the conversion moment; email capture framed as "save your personalized risk profile"
- UT-only for MVP (architecture supports multi-state later)
- No AI/LLM-generated legal content in MVP
- Agentic AI positioning: DME's intelligence is in the design, not a language model

---

## 5. JAN S. — PrimaNuova Group (BizRight, DolceRight, TrustGuard)

### Contracts
| ID | Title | Status |
|---|---|---|
| 42555903 | Prototype — Single Assessment Flow (Build to Spec) | CLOSED |
| 42997603 | Updated authentication flow | CLOSED |
| 43078632 | Development of the DolceRight: Find & Secure Mobile Application | ACTIVE |

### What It Is
Portfolio of apps for PrimaNuova Group. BizRight (complete), DolceRight (active build), TrustGuard IQ (declined by Cam).

---

### BizRight Clarity — COMPLETE
- Assessment flow app, fully built and deployed
- **Apple App Store**: APPROVED (after multiple rejection rounds — account deletion, privacy/terms links, Pro login)
- **Google Play**: APPROVED (Feb 23)
- Auth fix completed (separate contract 42997603)
- Analytics feature discussed but **deferred by Jan**
- Jan hired Project Manager (Alex) for PrimaNuova Group

---

### TrustGuard IQ — NOT MOVING FORWARD
- Jan sent full specs (11 screens, AI pipeline with guardrails, UI/UX + icons)
- Cam scoped at **$15K** minimum
- Jan's budget was below that
- **Cam stepped aside** — couldn't deliver under $15K
- No hard feelings, door open for future

---

### DolceRight: Find & Secure — ACTIVE BUILD
Italian property buying guide mobile app. One-time purchase (paid download, no subscription, no IAP).

**Contract: $6,000 total, 4 milestones × $1,500**
**Dev sprint kicked off: March 9**
**Store submission target: Week of March 28**

### Assets Received
| Asset | Status |
|---|---|
| 11 orientation screens (locked copy) | RECEIVED |
| Brand Design Kit (colors, typography, spacing, components) | RECEIVED |
| Logo wordmark (SVG) | RECEIVED |
| App icon | NEEDS SVG VERSION (sent PNG initially) |
| Privacy policy (dolceright.com/privacy) | RECEIVED |
| Terms (dolceright.com/terms) | RECEIVED |
| Contact support (info@primanuovagroup.com) | RECEIVED |
| QR redirect URL (dolceright.com/app) | RECEIVED |
| eBook placeholder (dolceright.com/resources) | RECEIVED |
| Italian property search site links | RECEIVED |
| Disclaimer copy | RECEIVED |
| Softr URL (temporary) | RECEIVED |

### Current Sprint — What's Actively Happening (Mar 11)
- **TestFlight build sent to Jan TODAY**
- Apple Developer Portal permissions issue resolved (Jan accidentally removed Cam as Admin, re-added)
- Provisioning profile certificate issue resolved (Jan selected correct cert)
- M1 development actively in progress
- Jan is checking out first milestone progress via TestFlight

### Backlog — What Needs to Be Done
| Item | Priority | Notes |
|---|---|---|
| Complete M1 | HIGH | $1,500 — in progress, TestFlight sent |
| App icon in SVG | HIGH | Jan needs to finalize in Figma |
| M2 build | NEXT | $1,500 |
| M3 build | PENDING | $1,500 |
| M4 build + store submissions | PENDING | $1,500, target week of Mar 28 |
| eBook → Amazon Kindle link | MEDIUM | Jan working on getting placeholder up |
| 5-app portfolio (DolceRight is #1 of 5) | FUTURE | Discussed but not committed |

### Known Bugs/Issues
| Issue | Severity | Details |
|---|---|---|
| Apple Developer Portal permissions | RESOLVED | Jan accidentally removed Cam as Admin |
| Icon format | MEDIUM | Needs SVG, was sent as PNG |

### Key Decisions Made
- DolceRight scoped as standalone $6K engagement (not portfolio deal)
- No subscription, no in-app purchase — one-time paid download
- Cam handles all UI design (no external Figma designer)
- TrustGuard IQ declined at current budget
- Jan hired PM (Alex) for future project management
- BizRight analytics deferred

---

## Summary Matrix

| Client | Project | Contract Status | Current Phase | Immediate Next Action |
|---|---|---|---|---|
| **Ali R.** | Prediction Quant | ACTIVE | $3,650 V1 features milestone (7–10 days) | Deliver Prime EV badge, filters, liquidity, hide, timestamps, threshold tabs |
| **Chase K.** | Grain Ledger | ACTIVE | Farmer pilot testing | Wait for Chase to consolidate farmer feedback and initiate Phase 2 |
| **John L.** | FedEx Dashboard | ACTIVE | Infrastructure migration | Complete one-time migration to John's accounts, then scope M3 |
| **Julianna M.** | DME Engine | ACTIVE | Phase 1 COMPLETE, full MVP scoped ($7,500) | Awaiting Julianna's go-ahead to fund M2 and begin full build |
| **Jan S.** | DolceRight | ACTIVE | M1 build (dev sprint) | Complete M1, resolve icon SVG, continue build to Mar 28 |
