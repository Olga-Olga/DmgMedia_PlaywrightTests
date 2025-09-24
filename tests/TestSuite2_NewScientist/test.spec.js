import { test as base, expect, devices } from "@playwright/test";
import chalk from "chalk";

// Extended test with custom desktop Chrome context for UK
const test = base.extend({
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      ...devices["Desktop Chrome"], // desktop Chrome emulation
      locale: "en-GB",
      colorScheme: "dark", // force dark mode
      ignoreHTTPSErrors: true,
    });
    await use(context);
    await context.close();
  },
});

test("New Scientist Dark/Light Mode and Consent Modal", async ({ context }) => {
  const page = await context.newPage();

  // Step 1: Navigate to New Scientist
  await page.goto("https://www.newscientist.com/");

  // Step 2: Confirm <html> has Dark class after load
  const htmlClassAfterLoad = await page.locator("html").getAttribute("class");
  console.log(chalk.green("Initial <html> class:"), htmlClassAfterLoad);
  expect(htmlClassAfterLoad).toContain("Dark");

  // Step 3: Confirm localStorage key "colourSchemeAppearance" = Dark
  const colourScheme = await page.evaluate(() =>
    localStorage.getItem("colourSchemeAppearance")
  );
  console.log(
    chalk.green("Local storage colourSchemeAppearance:"),
    colourScheme
  );
  expect(colourScheme).toBe("Dark");

  // Step 4: Handle consent modal (if visible)
  const gotItButton = page.locator('button:has-text("Got It")');
  if (await gotItButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await gotItButton.click();
    await expect(gotItButton).toHaveCount(0);
    console.log(chalk.green("Consent modal closed"));
  } else {
    console.log(chalk.yellow("Consent modal not visible, skipping click."));
  }

  // Step 5 & 6: Toggle theme to Light
  const toggle = page.locator("#appearance-toggle");
  // Wait until no overlay is blocking the page
  await page
    .locator(".overlay_QGo9N")
    .waitFor({ state: "hidden", timeout: 10000 })
    .catch(() => {
      console.log(
        chalk.yellow("Overlay did not disappear, forcing click anyway")
      );
    });

  // Wait until the toggle is visible before clicking
  await toggle.waitFor({ state: "visible", timeout: 15000 });
  await expect(toggle).toBeVisible({ timeout: 15000 });
  await expect(toggle).toBeEnabled({ timeout: 15000 });

  await toggle.click();

  // Wait for <html> class to include "Light"
  await page.waitForFunction(() =>
    document.documentElement.classList.contains("Light")
  );
  const htmlClassAfterToggle = await page.locator("html").getAttribute("class");
  console.log(chalk.yellow("After toggle <html> class:"), htmlClassAfterToggle);
  expect(htmlClassAfterToggle).toContain("Light");
  expect(htmlClassAfterToggle).not.toContain("Dark");

  // Step 7: Confirm localStorage updated to Light
  await page.waitForFunction(
    () => localStorage.getItem("colourSchemeAppearance") === "Light"
  );
  const colourSchemeAfterToggle = await page.evaluate(() =>
    localStorage.getItem("colourSchemeAppearance")
  );
  console.log(
    chalk.yellow("Local storage colourSchemeAppearance after toggle:"),
    colourSchemeAfterToggle
  );
  expect(colourSchemeAfterToggle).toBe("Light");

  // Step 8: Refresh page and confirm Light class persists
  await page.reload(); // default wait until load
  // Wait until localStorage key is 'Light'
  await page.waitForFunction(
    () => {
      return (
        localStorage.getItem("colourSchemeAppearance") === "Light" &&
        document.documentElement.classList.contains("Light")
      );
    },
    { timeout: 15000 }
  ); // give it up to 15s

  // Now check html class
  const htmlClassAfterReload = await page.locator("html").getAttribute("class");
  console.log(chalk.blue("After reload <html> class:"), htmlClassAfterReload);
  expect(htmlClassAfterReload).toContain("Light");
  expect(htmlClassAfterReload).not.toContain("Dark");
});
