import { test as base, expect } from "@playwright/test";
import chalk from "chalk";

// Extended test with custom context for mobile Chrome UK
const test = base.extend({
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 393, height: 851 },
      userAgent:
        "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.199 Mobile Safari/537.36",
      locale: "en-GB",
      ignoreHTTPSErrors: true,
      permissions: [],
      storageState: undefined, // clean context
    });
    await use(context);
    await context.close();
  },
});

test("GA tracking and consent modal test on iNews politics page", async ({
  context,
}) => {
  const page = await context.newPage();

  // ---------------------------
  // Step 1: page_view GA request
  // ---------------------------
  const pageViewRequests = [];
  page.on("request", (req) => {
    const url = new URL(req.url());
    const params = Object.fromEntries(url.searchParams);

    if (
      req.url().includes("google-analytics.com/g/collect") &&
      params.en === "page_view"
    ) {
      pageViewRequests.push(params);
      console.log(chalk.blue("📘 page_view GA request:"), params);
    }
  });

  await page.goto("https://inews.co.uk/category/news/politics");

  // Wait a few seconds to make sure page_view requests are sent
  await page.waitForTimeout(3000);

  // Assertions for page_view
  expect(pageViewRequests.length).toBeGreaterThan(0);
  pageViewRequests.forEach((qp) => {
    expect(qp["ep.sub_channel_1"]).toBe("news/politics");
    expect.soft(qp["gcs"]).toBe("G101");
    expect.soft(qp["npa"]).toBe("1");
  });

  // ---------------------------
  // Step 2: click Accept
  // ---------------------------
  const acceptButton = page.locator('button:has-text("Accept")');
  await acceptButton.click();
  await expect(acceptButton).toHaveCount(0); // check that modal disappeared
  console.log(chalk.yellow("✔ Consent modal accepted"));

  // ---------------------------
  // Step 3: wait for user_engagement GA request
  // ---------------------------
  const userEngagementRequest = await page.waitForRequest(
    (req) => {
      if (!req.url().includes("google-analytics.com/g/collect")) return false;
      const params = Object.fromEntries(new URL(req.url()).searchParams);
      return params.en === "user_engagement";
    },
    { timeout: 10000 } // wait up to 10 seconds
  );

  const ueParams = Object.fromEntries(
    new URL(userEngagementRequest.url()).searchParams
  );

  // Logging
  console.log(chalk.green.bold("📗 user_engagement GA request:"));

  // Assertions for user_engagement
  expect.soft(ueParams["gcs"]).toBe("G111");
  expect
    .soft(ueParams["npa"] === "0" || ueParams["npa"] === undefined)
    .toBe(true);
  console.log(chalk.yellow("✔ user_engagement GA params validated"));
});
