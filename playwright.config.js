const { devices } = require("@playwright/test");

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  // The root folder where all test files are located
  testDir: "./tests",

  // Global test timeout
  timeout: 30 * 1000,

  // Reporters: console list + HTML report (opens automatically)
  reporter: [["list"], ["html", { open: "always" }]],

  // Default test options
  use: { headless: false },

  // Define multiple projects (different environments or devices)
  projects: [
    {
      name: "Mobile_Chrome_UK",
      // Only run tests in this folder for this project
      testDir: "./tests/TestSuite1_iNEWS",
      use: {
        browserName: "chromium",
        ...devices["Galaxy S20"], // Mobile emulation
        locale: "en-GB", // UK locale
      },
    },
    {
      name: "Desktop_Chrome",
      // Only run tests in this folder for this project
      testDir: "./tests/TestSuite2_NewScientist",
      use: {
        browserName: "chromium",
        viewport: { width: 1920, height: 1080 }, // Desktop viewport
        locale: "en-GB",
      },
    },
  ],
};

module.exports = config;
