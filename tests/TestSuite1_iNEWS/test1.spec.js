import { test as base, expect, devices } from "@playwright/test";
import fs from "fs";
import path from "path";

// Розширений тест з кастомним контекстом для мобільного Chrome UK
const test = base.extend({
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 393, height: 851 },
      userAgent:
        "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.199 Mobile Safari/537.36",
      locale: "en-GB",
      ignoreHTTPSErrors: true,
      permissions: [],
      storageState: undefined, // чистий контекст, без збережених cookies
    });
    await use(context);
    await context.close();
  },
});

test("GA page_view tracking test on iNews politics page", async ({
  context,
}) => {
  const page = await context.newPage();

  // Масив для зберігання знайдених GA page_view запитів
  const requestsLog = [];

  // Ловимо всі запити на GA з en=page_view
  page.on("request", (request) => {
    const url = request.url();
    const method = request.method();
    const urlObj = new URL(url);

    // Спершу парсимо GET-параметри
    let queryParams = Object.fromEntries(urlObj.searchParams);

    // Додаємо POST payload, якщо є
    if (method === "POST" && request.postData()) {
      const postParams = Object.fromEntries(
        new URLSearchParams(request.postData())
      );
      queryParams = { ...queryParams, ...postParams };
    }

    if (
      url.includes("google-analytics.com/g/collect") &&
      queryParams.en === "page_view"
    ) {
      requestsLog.push({
        url,
        method,
        queryParams,
        postData: request.postData(),
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Відкриваємо сторінку
  await page.goto("https://inews.co.uk/category/news/politics");

  // // Натискаємо Accept на consent modal
  // const acceptButton = page.locator('button:has-text("Accept")');
  // await acceptButton.click();
  // await expect(acceptButton).toHaveCount(0);

  // Чекаємо кілька секунд, щоб GA запити точно пройшли
  await page.waitForTimeout(7000); // можна збільшити, якщо потрібно

  // Зберігаємо всі знайдені запити у файл
  // Поточний файл тесту
  const currentTestFile = __filename;

  // Папка, де лежить тест
  const testFolder = path.dirname(currentTestFile);

  // Шлях до файлу для збереження GA запитів у тій же папці
  const logFilePath = path.join(testFolder, "ga_page_view_requests.json");

  // Якщо файл існує — видаляємо його
  if (fs.existsSync(logFilePath)) {
    fs.unlinkSync(logFilePath);
    console.log(`🗑 Старий файл видалено: ${logFilePath}`);
  }

  let existingData = [];
  if (fs.existsSync(logFilePath)) {
    const raw = fs.readFileSync(logFilePath, "utf-8");
    existingData = JSON.parse(raw);
  }

  // Додаємо нові запити
  const allRequests = [...existingData, ...requestsLog];

  // Записуємо все назад у файл
  fs.writeFileSync(logFilePath, JSON.stringify(allRequests, null, 2));
  console.log(`🎯 Збережено GA page_view запит_${logFilePath}`);

  // ----------------- Асерти -----------------
  // Беремо останні зловлені запити
  const lastRequests = requestsLog;

  expect(lastRequests.length).toBeGreaterThan(0); // хоча б один запит має бути
  lastRequests.forEach((req) => {
    const qp = req.queryParams;

    // ep.sub_channel_1 === 'news/politics'
    expect(qp["ep.sub_channel_1"]).toBeDefined();
    expect(qp["ep.sub_channel_1"]).toBe("news/politics");

    // gcs === 'G101'
    expect(qp["gcs"]).toBeDefined();
    expect(qp["gcs"]).toBe("G101");

    // npa === '1'
    expect(qp["npa"]).toBeDefined();
    expect(qp["npa"]).toBe("1");
  });
});
