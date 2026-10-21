import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir(".tools/qa", { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const [name, width] of [
    ["desktop", 1440],
    ["tablet", 768],
    ["mobile", 375],
  ]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await page.screenshot({ path: `.tools/qa/${name}.png`, fullPage: true });
    if (name === "mobile")
      await page.screenshot({ path: ".tools/qa/mobile-first-screen.png" });
    console.log(
      JSON.stringify({
        screen: name,
        status: "rendered",
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      }),
    );
  }
  await page.goto("http://127.0.0.1:3000/admin", { waitUntil: "networkidle" });
  await page.screenshot({ path: ".tools/qa/admin-login.png", fullPage: true });
  console.log(JSON.stringify({ pageErrors: errors }));
} finally {
  await browser.close();
}
