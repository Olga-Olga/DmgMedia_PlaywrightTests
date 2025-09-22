DmgMedia_PlaywrightTests

This project contains Playwright JS tests for Dmg Media websites.
It includes two test suites that check analytics events, consent modals, and theme appearance.

🚀 How to Run

Install dependencies:
npm install

Run all tests:
npx playwright test

Run with UI:
npx playwright test --ui

📂 Test Suites
Test Suite 1 – Politics Page (inews.co.uk)

Open inews.co.uk/category/news/politics
in mobile Chrome (UK region)

Check Google Analytics request page_view has correct parameters (ep.sub_channel_1, gcs, npa)

Accept the consent modal → confirm it disappears

Check Google Analytics request user_engagement has updated parameters (gcs, npa)

Test Suite 2 – New Scientist (newscientist.com)

Open newscientist.com
in desktop Chrome (UK region, Dark Mode)

Confirm <html> has class Dark and localStorage value colourSchemeAppearance = Dark

Accept the consent modal → confirm it disappears

Toggle appearance → confirm <html> switches to Light and localStorage updates to Light

📑 Structure
tests/
├── politics.spec.js # Suite 1
├── newscientist.spec.js # Suite 2
playwright.config.js
package.json
README.md
