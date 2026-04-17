import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0,100)); });
page.on("pageerror", e => errors.push("pageerror: " + e.message.slice(0,100)));
await page.goto("https://prediction-quant-prod-git-cursor-right-e50246-camburley-s-team.vercel.app/scanner?demo=true", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(1500);
const rowCount = await page.locator("tbody tr").count();
const data = [];
for (let i=0; i<rowCount; i++) {
  await page.locator("tbody tr").nth(i).click();
  await page.waitForTimeout(300);
  // Read ALL elements that look like state or action keywords
  const pill = await page.evaluate(() => {
    const out = {};
    const candidates = Array.from(document.querySelectorAll("*")).filter(el => {
      const t = (el.textContent || "").trim();
      return /^(IN TRADE|PRE-ENTRY|EDGE LOST|BLOCKED)$/.test(t) && el.children.length === 0;
    });
    if (candidates.length) {
      const el = candidates[0];
      out.state = el.textContent.trim();
      const s = getComputedStyle(el);
      out.stateBg = s.backgroundColor;
      out.stateColor = s.color;
    }
    const actions = Array.from(document.querySelectorAll("*")).filter(el => {
      const t = (el.textContent || "").trim();
      return /^(HOLD|READY|WAIT|AVOID|NO TRADE|EDGE LOST|EXIT|WATCH)$/.test(t) && el.children.length === 0 && parseFloat(getComputedStyle(el).fontSize) >= 20;
    });
    if (actions.length) {
      const el = actions[0];
      out.action = el.textContent.trim();
      out.actionColor = getComputedStyle(el).color;
      out.actionFontSize = getComputedStyle(el).fontSize;
    }
    return out;
  });
  data.push({ row: i, ...pill });
}
console.log(JSON.stringify(data, null, 2));
console.log("console errors:", errors.length);
for (const e of errors) console.log("  -", e);
await browser.close();
