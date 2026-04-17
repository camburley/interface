import { chromium } from "playwright";

const browser = await chromium.launch();

// === 447: proper decision card state transitions ===
console.log("=== TASK-447 decision card per-row ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0,120)); });
  await page.goto("https://prediction-quant-prod-git-cursor-right-e50246-camburley-s-team.vercel.app/scanner?demo=true", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  // Grab decision card panel — it's the right pane
  const rows = await page.locator("tbody tr").all();
  console.log("row count:", rows.length);
  const results = [];
  for (let i=0; i<rows.length; i++) {
    await rows[i].click();
    await page.waitForTimeout(400);
    // read decision card body (right panel)
    const panel = page.locator("aside, [class*='right'], [data-testid*='decision'], div").filter({ hasText: /EDGE SCORE|IN TRADE|PRE-ENTRY|EDGE LOST|BLOCKED/i }).first();
    const panelText = (await panel.textContent().catch(()=>""))?.slice(0, 400) || "";
    // Find state-pill like element
    const statePill = await page.locator(":text-matches('^(IN TRADE|PRE-ENTRY|EDGE LOST|BLOCKED)$')").first();
    const stateText = (await statePill.textContent().catch(()=>""))?.trim() || "";
    const stateColor = await statePill.evaluate(el => getComputedStyle(el).backgroundColor).catch(()=>"");
    // action text — big 26px one
    const actionCandidates = await page.locator(":text-matches('^(HOLD|READY|WAIT|AVOID|NO TRADE|EDGE LOST|EXIT|WATCH)$')").all();
    let actionText = "", actionColor = "";
    for (const c of actionCandidates) {
      const fs = await c.evaluate(el => parseFloat(getComputedStyle(el).fontSize)).catch(()=>0);
      if (fs >= 20) {
        actionText = (await c.textContent())?.trim() || "";
        actionColor = await c.evaluate(el => getComputedStyle(el).color).catch(()=>"");
        break;
      }
    }
    results.push({ row: i, state: stateText, stateBg: stateColor, action: actionText, actionColor });
  }
  console.log(JSON.stringify(results, null, 2));
  console.log("console errors:", errors.length, errors);
  await ctx.close();
}

// === dme-03: navigate through phase 1 to reach payment gate ===
console.log("\n=== dme-03 navigate to payment gate ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const base = "https://dme-engine-git-cursor-dme-stripe-paymen-10c63a-camburley-s-team.vercel.app";
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  // Try clicking any "Get Started" / "Start" / "Begin" button
  const startBtn = page.locator("button, a").filter({ hasText: /get started|start|begin|continue/i }).first();
  const startVisible = await startBtn.isVisible().catch(()=>false);
  console.log("start btn visible:", startVisible);
  if (startVisible) await startBtn.click().catch(()=>{});
  await page.waitForTimeout(1500);
  console.log("url after start:", page.url());
  // Walk phase 1 — keep clicking primary buttons until we see $299 or we've clicked 15 times
  let sawTiers = false;
  for (let step = 0; step < 20; step++) {
    const text = (await page.locator("body").textContent()) || "";
    if (text.includes("$299") || text.includes("$99 charged") || text.includes("Estate Plan")) { sawTiers = true; break; }
    const btn = page.locator("button:visible").last();
    const btnCount = await page.locator("button:visible").count();
    if (btnCount === 0) break;
    const label = (await btn.textContent()) || "";
    await btn.click().catch(()=>{});
    await page.waitForTimeout(700);
  }
  console.log("reached tiers:", sawTiers);
  if (sawTiers) {
    const t = await page.locator("body").textContent();
    const out = {
      has_299: t.includes("$299"),
      has_499: t.includes("$499"),
      has_599: t.includes("$599"),
      has_getProtected: t.includes("Get protected today"),
      has_startMyPlan99: t.includes("Start my plan for $99"),
      emDashes: (t.match(/—/g) || []).length,
      bannedHits: ["$17/mo","$17/month","$9/mo","$199/yr","$4.99","$399","completion fee","6-month minimum"].filter(b => t.includes(b)),
      consequenceAnchor: t.includes("12-month probate process"),
      attorneyAnchor: t.includes("$3,000 to $5,500") || t.includes("attorney charges for this"),
    };
    console.log(JSON.stringify(out, null, 2));
  }
  await ctx.close();
}
await browser.close();
