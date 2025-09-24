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
    // await context.close();
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

  // Wait for any overlay to disappear
  await page
    .locator(".overlay_QGo9N")
    .waitFor({ state: "hidden", timeout: 10000 })
    .catch(() => {
      console.log(
        chalk.yellow(
          "Overlay still present after 10s, will force click on toggle"
        )
      );
    });

  // Ensure toggle is visible and enabled
  await toggle.waitFor({ state: "visible", timeout: 15000 });
  await expect(toggle).toBeVisible({ timeout: 15000 });
  await expect(toggle).toBeEnabled({ timeout: 15000 });

  // Try normal click first, fallback to force click if overlay blocks
  try {
    await toggle.click({ timeout: 10000 });
    console.log(chalk.green("Clicked appearance toggle (first attempt)"));
  } catch {
    await toggle.click({ force: true });
    console.log(
      chalk.yellow("Clicked appearance toggle with force due to overlay")
    );
  }

  // Wait until <html> has "Light" class using locator
  const html = page.locator("html");

  // Retry until the class contains "Light" or timeout after 15s
  await expect(html).toHaveAttribute("class", /Light/, { timeout: 15000 });

  const htmlClassAfterToggle = await page.locator("html").getAttribute("class");
  console.log(chalk.yellow("After toggle <html> class:"), htmlClassAfterToggle);
  expect(htmlClassAfterToggle).toContain("Light");
  expect(htmlClassAfterToggle).not.toContain("Dark");

  // Step 7: Confirm localStorage updated to Light
  // await page.waitForFunction(
  //   () => localStorage.getItem("colourSchemeAppearance") === "Light"
  // );

  // Update localStorage after toggle
  const colourSchemeAfterTogle = await page.evaluate(() =>
    localStorage.getItem("colourSchemeAppearance")
  );
  console.log(
    chalk.yellow("Local storage colourSchemeAppearance after toggle:"),
    colourSchemeAfterTogle
  );
  expect(colourSchemeAfterTogle).toBe("Light");

  // Step 8: Refresh page and confirm Light class persists

  // 9. Refresh the page, and confirm that the colour scheme override is working by
  // confirming that the <html> element has a class of Light added to it after the load
  // event.

  await page.reload(); // reload page and wait until load
  const html_ = page.locator("html");

  // Wait until <html> has "Light" class
  await expect(html_).toHaveAttribute("class", /Light/, { timeout: 15000 });

  // Confirm localStorage key is "Light"
  const colourSchemeAfterReload = await page.evaluate(() =>
    localStorage.getItem("colourSchemeAppearance")
  );
  expect(colourSchemeAfterReload).toBe("Light");

  // Now check html class
  const htmlClassAfterReload = await page.locator("html").getAttribute("class");
  console.log(chalk.blue("After reload <html> class:"), htmlClassAfterReload);
  expect(htmlClassAfterReload).toContain("Light");
  expect(htmlClassAfterReload).not.toContain("Dark");
});
