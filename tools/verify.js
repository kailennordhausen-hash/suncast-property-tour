// Headless verification of the scroll experience. Usage: node verify.js <site_dir> <out_dir> [mobile]
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs");
(async () => {
  const site = path.resolve(process.argv[2]), out = path.resolve(process.argv[3]), mobile = process.argv[4] === "mobile";
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
  await page.goto("file://" + path.join(site, "index.html"));
  await page.waitForFunction(() => document.getElementById("loader").hidden === true, null, { timeout: 120000 });
  const vh = mobile ? 844 : 900;
  const INTRO = 1.0, CH = 3.6;
  const stops = [["00-intro", 0.1], ["01-approach", INTRO + 0.15 * CH], ["01-arrival", INTRO + 0.40 * CH], ["01-showcase", INTRO + 0.70 * CH], ["01-depart", INTRO + 0.95 * CH],
    ["02-arrival", INTRO + 1 * CH + 0.45 * CH], ["03-arrival", INTRO + 2 * CH + 0.45 * CH], ["04-arrival", INTRO + 3 * CH + 0.45 * CH], ["05-arrival", INTRO + 4 * CH + 0.45 * CH], ["05-depart-end", INTRO + 5 * CH + 0.2]];
  const report = [];
  for (const [name, units] of stops) {
    await page.evaluate((y) => window.scrollTo(0, y), units * vh);
    await page.waitForTimeout(350);
    const info = await page.evaluate(() => {
      const hs = document.getElementById("hotspot"); const ov = document.getElementById("overlay");
      return { ovOpacity: getComputedStyle(ov).getPropertyValue("--ov-o").trim(), name: document.getElementById("ov-name").textContent, hotspotHidden: hs.hidden, hotspotTransform: hs.style.transform, current: [...document.querySelectorAll("#rail-list button")].findIndex((b) => b.getAttribute("aria-current") === "true") };
    });
    report.push({ name, units, ...info });
    await page.screenshot({ path: path.join(out, `${mobile ? "m-" : ""}${name}.jpg`), type: "jpeg", quality: 70 });
  }
  // reverse scrub check: scroll back to chapter 1 arrival and confirm the same overlay
  await page.evaluate((y) => window.scrollTo(0, y), (INTRO + 0.4 * CH) * vh); await page.waitForTimeout(300);
  report.push({ name: "reverse-to-01", current: await page.evaluate(() => document.getElementById("ov-name").textContent) });
  // open panel via hotspot
  await page.evaluate(() => document.getElementById("hotspot").click()); await page.waitForTimeout(300);
  report.push({ name: "panel", open: await page.evaluate(() => document.getElementById("panel").open), title: await page.evaluate(() => document.getElementById("panel-title").textContent) });
  await page.screenshot({ path: path.join(out, `${mobile ? "m-" : ""}panel.jpg`), type: "jpeg", quality: 70 });
  await page.keyboard.press("Escape"); await page.waitForTimeout(200);
  report.push({ name: "panel-after-esc", open: await page.evaluate(() => document.getElementById("panel").open) });
  // nav click to chapter 4
  await page.evaluate(() => document.querySelectorAll("#rail-list button")[3].click()); await page.waitForTimeout(1200);
  report.push({ name: "nav-to-04", current: await page.evaluate(() => document.getElementById("ov-name").textContent) });
  // closing section
  await page.evaluate(() => document.getElementById("closing").scrollIntoView()); await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, `${mobile ? "m-" : ""}closing.jpg`), type: "jpeg", quality: 70 });
  // reduced motion toggle
  await page.evaluate(() => document.getElementById("motion-toggle").click()); await page.waitForTimeout(300);
  report.push({ name: "static-mode", hidden: await page.evaluate(() => document.getElementById("static").hidden), cards: await page.evaluate(() => document.querySelectorAll(".static-ch").length) });
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, `${mobile ? "m-" : ""}static.jpg`), type: "jpeg", quality: 70, fullPage: false });
  console.log(JSON.stringify(report, null, 1));
  console.log("console errors:", errors.length ? errors : "none");
  await browser.close();
})();
