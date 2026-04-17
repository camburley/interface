import { chromium } from 'playwright';
const url = 'https://prediction-quant-prod-git-cursor-edgest-3af850-camburley-s-team.vercel.app/scanner?demo=true';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 700 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
// Find the scroll container and scroll down
await page.evaluate(() => {
  const el = document.querySelector('[data-testid="table-wrap"]');
  if (el) el.scrollTop = 400;
});
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/scanner-scrolled.png', fullPage: false });
// Also check computed position on first th
const firstThPos = await page.evaluate(() => {
  const th = document.querySelector('[data-testid="scanner-table-header"] th');
  if (!th) return null;
  const cs = getComputedStyle(th);
  return { position: cs.position, top: cs.top, zIndex: cs.zIndex, bg: cs.backgroundColor };
});
console.log(JSON.stringify(firstThPos));
await browser.close();
