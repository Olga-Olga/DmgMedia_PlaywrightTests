import { test as base, expect, devices } from "@playwright/test";

// Створюємо новий тестовий "базовий" тест з власним контекстом
const test = base.extend({
  // Хук для створення контексту для кожного тесту
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 393, height: 851 },
      userAgent:
        "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.199 Mobile Safari/537.36",
      locale: "en-GB",
    });
    await use(context); // передаємо контекст тесту
    await context.close(); // закриваємо після тесту
  },
});

test("Google Analytics tracking test on iNews politics page", async ({
  context,
}) => {
  const page = await context.newPage();

  // --- Логування усіх GA-запитів ---
  page.on("request", async (req) => {
    if (req.url().includes("google-analytics.com/g/collect")) {
      console.log("GA request URL:", req.url());

      const postData = req.postData();
      if (postData) {
        console.log("GA request payload:", postData);
      } else {
        console.log("No POST data, might be GET query params");
      }
    }
  });

  // Перехід на сторінку
  await page.goto("https://inews.co.uk/category/news/politics");

  // Натискаємо Accept на consent modal
  const acceptButton = page.locator('button:has-text("Accept")');
  await acceptButton.click();
  await expect(acceptButton).toHaveCount(0);

  // Чекаємо будь-який GA-запит після кліку
  const gaRequest = await page.waitForRequest(
    (req) => req.url().includes("google-analytics.com/g/collect"),
    { timeout: 60000 }
  );

  console.log("🎯 Спіймали GA-запит:", gaRequest.url());
});
