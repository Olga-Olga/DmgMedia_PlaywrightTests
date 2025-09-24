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

  // Step 1: 1. Navigate to https://www.newscientist.com/ in a desktop Chrome browser from
  // the UK region with Dark Mode enabled

  await page.goto("https://www.newscientist.com/");

  // Step 2: Confirm that the <html> element has a class Dark added to it after the load event;

  const htmlClassAfterLoad = await page.locator("html").getAttribute("class");
  console.log(chalk.green("Initial <html> class:"), htmlClassAfterLoad);
  expect(htmlClassAfterLoad).toContain("Dark");

  // Step 3: Confirm that a local storage key of colourSchemeAppearance has been set with a value of Dark
  const colourScheme = await page.evaluate(() =>
    localStorage.getItem("colourSchemeAppearance")
  );
  console.log(
    chalk.green("Local storage colourSchemeAppearance:"),
    colourScheme
  );
  expect(colourScheme).toBe("Dark");

  // Step 4: Click on the Got It button shown in the consent modal on page.
  // Step 5 Confirm that the modal is now removed from the DOM.

  const gotItButton = page.getByRole("button", { name: "Got it" });
  await gotItButton.click({ force: true });
  await expect(gotItButton).toHaveCount(0);
  console.log(chalk.green("Consent modal closed"));

  //   Step 6: Locate the Appearance toggle (#appearance-toggle) and click it to force the
  // theme to Light

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
  console.log(chalk.green("toggle is visible"));

  await toggle.click({ timeout: 10000, force: true });
  console.log(chalk.green("Clicked appearance toggle"));
  await page.waitForTimeout(3000);

  //  Step 7: Confirm that the <html> element has now had a class of Light added to it and
  // the Dark classname has been removed.

  const html = page.locator("html");
  console.log(chalk.redBright(await html.getAttribute("class")));
  await expect(html).toHaveAttribute("class", /Light/, { timeout: 10000 });

  const htmlClassAfterToggle = await page.locator("html").getAttribute("class");
  console.log(chalk.yellow("After toggle <html> class:"), htmlClassAfterToggle);
  expect(htmlClassAfterToggle).toContain("Light");
  expect(htmlClassAfterToggle).not.toContain("Dark");

  // Step 8: Confirm that the local storage key of colourSchemeAppearance has been
  // updated with a value of Light

  const colourSchemeAfterTogle = await page.evaluate(() =>
    localStorage.getItem("colourSchemeAppearance")
  );
  console.log(
    chalk.yellow("Local storage colourSchemeAppearance after toggle:"),
    colourSchemeAfterTogle
  );
  expect(colourSchemeAfterTogle).toBe("Light");

  // 9. Refresh the page, and confirm that the colour scheme override is working by
  // confirming that the <html> element has a class of Light added to it after the load
  // event.

  await page.goto("https://www.newscientist.com/", {
    waitUntil: "domcontentloaded",
  });

  const html_ = page.locator("html");

  // Confirm that <html> has "Light" class
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
