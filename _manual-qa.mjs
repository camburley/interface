import { chromium } from "playwright";

const targets = [
  {
    id: "TASK-447",
    url: "https://prediction-quant-prod-git-cursor-right-e50246-camburley-s-team.vercel.app/scanner?demo=true",
    checks: async (page) => {
      const out = {};
      // 1. table exists at 1440
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(targets[0].url, { waitUntil: "networkidle", timeout: 30000 });
      out.tableAt1440 = await page.locator("table, [data-testid='scanner-table']").first().count() > 0;
      // 2. sticky header — check first th position style
      const thPos = await page.locator("th").first().evaluate(el => getComputedStyle(el).position).catch(() => null);
      out.stickyHeader = thPos === "sticky";
      // 3. click row 1
      const firstRow = page.locator("tbody tr").first();
      await firstRow.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
      // 4. decision card visible
      const card = page.locator("[data-testid='decision-card'], :has-text('EDGE SCORE')").first();
      out.decisionCardVisible = await card.count() > 0;
      // 5. try find each row by positionState via test-ids if present
      const stateColors = {};
      for (const sel of ["state-pill-in_trade", "state-pill-pre_entry", "state-pill-edge_lost", "state-pill-blocked"]) {
        const el = page.locator(`[data-testid='${sel}']`);
        stateColors[sel] = await el.count();
      }
      out.statePillTestIds = stateColors;
      // 6. scan all action text colors — click through 4 rows
      const actions = [];
      const rows = await page.locator("tbody tr").all();
      for (let i=0; i<Math.min(rows.length, 10); i++) {
        await rows[i].click().catch(()=>{});
        await page.waitForTimeout(200);
        const t = await page.locator("[data-testid='action-text'], :text-matches('HOLD|WAIT|AVOID|READY|NO TRADE|EDGE LOST|EXIT|WATCH')").first();
        const txt = await t.textContent().catch(()=>null);
        const color = await t.evaluate(el => getComputedStyle(el).color).catch(()=>null);
        actions.push({ row: i, text: (txt||"").trim().slice(0,20), color });
      }
      out.actionsSweep = actions;
      // 7. console errors
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
      out.consoleErrors = errors;
      // 8. mobile
      await page.setViewportSize({ width: 375, height: 812 });
      await page.reload({ waitUntil: "networkidle" });
      out.mobileRenders = await page.locator("body").isVisible();
      return out;
    },
  },
  {
    id: "dme-03",
    url: "https://dme-engine-git-cursor-dme-stripe-paymen-10c63a-camburley-s-team.vercel.app",
    checks: async (page) => {
      const out = {};
      await page.setViewportSize({ width: 1440, height: 900 });
      const resp = await page.goto(targets[1].url, { waitUntil: "networkidle", timeout: 30000 });
      out.status = resp?.status();
      // 1. em dashes in DOM
      const bodyText = await page.locator("body").textContent();
      const dashMatches = (bodyText.match(/—/g) || []).length;
      out.emDashCount_landing = dashMatches;
      // 2. banned pricing strings
      const banned = ["$17/mo","$17/month","$9/mo","$199/yr","$4.99","$399","completion fee","6-month minimum"];
      out.bannedFound_landing = banned.filter(b => bodyText.includes(b));
      // 3. tier cards on payment gate — try /payment-gate route or navigate through phase1
      // simplest: check if the app exposes direct /payment-gate route
      try {
        await page.goto(targets[1].url + "/payment-gate", { waitUntil: "networkidle", timeout: 15000 });
        const txt = await page.locator("body").textContent();
        out.paymentGate_loaded = txt?.includes("$299") || txt?.includes("Estate Plan");
        out.has_299 = txt?.includes("$299");
        out.has_499 = txt?.includes("$499");
        out.has_599 = txt?.includes("$599");
        out.has_getProtected = txt?.includes("Get protected today");
        out.has_startMyPlan = txt?.includes("Start my plan for $99");
        out.emDashCount_gate = (txt.match(/—/g) || []).length;
        out.bannedFound_gate = banned.filter(b => txt.includes(b));
      } catch (e) {
        out.paymentGate_loaded = false;
        out.paymentGate_err = e.message;
      }
      // 4. API checks
      const sitebase = targets[1].url;
      // 4a. GET /api/stripe/checkout with empty
      const r1 = await fetch(sitebase + "/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "" });
      out.checkout_emptyBody_status = r1.status;
      out.checkout_emptyBody_text = (await r1.text()).slice(0, 200);
      // 4b. POST valid
      const r2 = await fetch(sitebase + "/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier: "protection", variant: "A", userId: "qa_test_user_1" }) });
      out.checkout_valid_status = r2.status;
      const r2txt = await r2.text();
      out.checkout_valid_hasUrl = /checkout\.stripe\.com/.test(r2txt);
      out.checkout_valid_text = r2txt.slice(0, 300);
      // 4c. missing tier -> should be 400
      const r3 = await fetch(sitebase + "/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variant: "A", userId: "u" }) });
      out.checkout_missingTier_status = r3.status;
      // 4d. webhook bad sig
      const r4 = await fetch(sitebase + "/api/stripe/webhook", { method: "POST", headers: { "Content-Type": "application/json", "Stripe-Signature": "t=1,v1=deadbeef" }, body: "{}" });
      out.webhook_badSig_status = r4.status;
      return out;
    },
  },
];

const results = {};
const browser = await chromium.launch();
for (const t of targets) {
  console.log("=== QA:", t.id, "===");
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    results[t.id] = await t.checks(page);
  } catch (e) {
    results[t.id] = { err: e.message };
  }
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
