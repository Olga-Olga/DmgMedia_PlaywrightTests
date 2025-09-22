# DmgMedia_PlaywrightTests

Playwright JS tests for Dmg Media websites.  
Includes two test suites that check Google Analytics events, consent modals, and theme appearance.

---

## 🚀 How to Run

```bash
# Install dependencies
npm install

# Run all tests
npx playwright test

# Run with UI (debug mode)
npx playwright test --ui
```

---

## Test Suites

### Test Suite 1 – Politics Page (inews.co.uk)

- Navigate to: `https://inews.co.uk/category/news/politics`
- Browser: **Mobile Chrome (UK region)**
- Validate Google Analytics `page_view` request:
  - `ep.sub_channel_1 = news/politics`
  - `gcs = G101`
  - `npa = 1`
- Accept the consent modal → confirm it is removed from the DOM
- Validate Google Analytics `user_engagement` request:
  - `gcs = G111`
  - `npa = 0` or absent

---

### 📂 Test Suite 2 – New Scientist (newscientist.com)

- Navigate to: `https://www.newscientist.com/`
- Browser: **Desktop Chrome (UK region, Dark Mode enabled)**
- Confirm after load:
  - `<html>` has class `Dark`
  - `localStorage["colourSchemeAppearance"] = "Dark"`
- Accept the consent modal → confirm it is removed from the DOM
- Toggle appearance → confirm:
  - `<html>` switches to `Light` (no `Dark`)
  - `localStorage["colourSchemeAppearance"] = "Light"`

---

## 📑 Project Structure

```
tests/
 ├── politics.spec.js       # Suite 1
 ├── newscientist.spec.js   # Suite 2
playwright.config.js
package.json
README.md
```
