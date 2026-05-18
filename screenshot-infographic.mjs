import { chromium } from 'playwright';
import { resolve } from 'path';

const htmlPath = resolve('..', 'career-ops-infographic.html');
const outPath  = resolve('..', 'career-ops-infographic.png');
const fileUrl  = 'file:///' + htmlPath.split('\\').join('/');

const browser = await chromium.launch();
const page    = await browser.newPage();

await page.setViewportSize({ width: 1200, height: 900 });
await page.goto(fileUrl);
await page.waitForTimeout(800);

const height = await page.evaluate(() => document.body.scrollHeight);
await page.setViewportSize({ width: 1200, height });

await page.screenshot({ path: outPath, fullPage: false });
await browser.close();

console.log('Saved:', outPath);
