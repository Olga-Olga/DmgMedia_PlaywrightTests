# DmgMedia_PlaywrightTests

Playwright JS tests for Dmg Media websites.\
Includes two test suites that check Google Analytics events, consent
modals, and theme appearance.

---

## 🚀 How to Run

```bash
# Install dependencies
npm install

# Run all tests on all projects
npx playwright test

Run Specific Suites or Projects
# Run Suite 1 (inews.co.uk politics page tests)
npm run test:suite1

# Run Suite 2 (newscientist.com dark/light mode tests)
npm run test:suite2

```

---

## Test Suites

### 📱 Test Suite 1 -- Politics Page (inews.co.uk)

- Navigate to: `https://inews.co.uk/category/news/politics`
- Project: **Mobile Chrome UK**
- Validate Google Analytics `page_view` request:
  - `ep.sub_channel_1 = news/politics`
  - `gcs = G101`
  - `npa = 1`
- Accept the consent modal → confirm it is removed from the DOM
- Validate Google Analytics `user_engagement` request:
  - `gcs = G111`
  - `npa = 0` or absent

---

### 💻 Test Suite 2 -- New Scientist (newscientist.com)

- Navigate to: `https://www.newscientist.com/`
- Project: **Desktop Chrome (UK region, Dark Mode enabled)**
- Confirm after load:
  - `<html>` has class `Dark`
  - `localStorage["colourSchemeAppearance"] = "Dark"`
- Accept the consent modal → confirm it is removed from the DOM
- Toggle appearance → confirm:
  - `<html>` switches to `Light` (no `Dark`)
  - `localStorage["colourSchemeAppearance"] = "Light"`
- Refresh page → confirm Light mode persists

---

## 📑 Project Structure

    tests/
     ├── TestSuite1_iNEWS/
     │    ├── test.spec.js
     ├── TestSuite2_NewScientist/
     │    └── test.spec.js
    playwright.config.js
    package.json
    README.md

---

## 🧪 Playwright Projects

The config defines **two projects**:

- **Desktop Chrome** → used in Test Suite 2 (New Scientist)\
- **Mobile Chrome UK** → used in Test Suite 1 (iNews Politics)

You can run tests for both in one go, or filter by project using the
`--project` flag.
