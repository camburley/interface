import { chromium } from 'playwright';
const url = 'https://prediction-quant-prod-git-cursor-edgest-3af850-camburley-s-team.vercel.app/scanner?demo=true';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/scanner-1440.png', fullPage: false });
await page.screenshot({ path: '/tmp/scanner-1440-full.png', fullPage: true });
// extract visible text signals
const text = await page.evaluate(() => document.body.innerText.slice(0, 3000));
console.log(text);
await browser.close();
