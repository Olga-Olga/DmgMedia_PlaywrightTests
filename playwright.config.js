// playwright.config.js
const { devices } = require("@playwright/test");

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: "./tests",
  timeout: 30 * 1000,
  retries: 0,
  use: {
    headless: false,
  },
  projects: [
    {
      name: "Mobile Chrome UK",
      use: {
        browserName: "chromium", // тільки Chromium
        ...devices["Pixel 5"], // мобільна емуляція
        locale: "en-GB",
        geolocation: { longitude: -0.1276, latitude: 51.5074 },
        permissions: ["geolocation"],
      },
    },
  ],
};

module.exports = config;
