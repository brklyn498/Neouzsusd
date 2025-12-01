# GEMINI.md - Dev Log

## Progress Tracker

- [x] **Project Initialization**
    - [x] Create `GEMINI.md`
    - [x] Create `ROADMAP.md`
    - [x] Update `README.md`
- [x] **Backend (Python)**
    - [x] Create `scraper.py`
    - [x] Implement CBU fetching
    - [x] Implement Mock Bank data
    - [x] Create GitHub Action workflow
    - [x] Implement Historical Data Fetching (30 days)
- [x] **Frontend (React)**
    - [x] Setup Vite + React
    - [x] Implement Design System (CSS)
    - [x] Build Components (Card, Header, List, Calculator)
    - [x] Integration with `rates.json`
    - [x] Implement 30-Day History Chart (`recharts`)
- [x] **Verification**
    - [x] Test Scraper
    - [x] Build React App

## Updates

### Phase 1: Setup
- Started the project.
- Switched from Flutter to React based on environment constraints.
- Decided to use Mock data for commercial banks to ensure reliability.

### Phase 2: Backend
- Implemented `scripts/scraper.py`.
- Successfully fetched live CBU rates from `https://cbu.uz/common/json/`.
- Generated consistent mock data for commercial banks.
- Set up GitHub Actions workflow for hourly updates.

### Phase 3: Frontend
- Built a React app with Vite.
- Implemented **Neubrutalism** design system using CSS variables (JetBrains Mono font, bold borders, hard shadows).
- Created a "Brutal" Card component.
- Implemented Currency Calculator and Sorting features.

### Phase 4: Verification
- Verified the build process (`npm run build`) works.
- Confirmed `rates.json` is generated correctly.

### Phase 5: Visuals (Charts)
- Updated `scraper.py` to fetch 30 days of historical data from CBU (`https://cbu.uz/en/arkhiv-kursov-valyut/json/all/{date}/`).
- Installed `recharts` and created `HistoryChart` component.
- Applied "Neubrutalist" styling to the chart (thick strokes, hard shadows, custom tooltips).
- Verified chart rendering with Playwright.

### Phase 6: Real Data Integration (COMPLETED)
- **Real bank data scraping implemented!** All 5 banks now show live data from bank.uz.
- Banks included: Kapitalbank, Hamkorbank, Ipak Yuli Bank, Saderat Bank, Anorbank.
- All marked as `"is_mock": false` in `rates.json`.

### Phase 7: Manual Refresh Feature
- Created `src/utils/fetchUtils.js` with client-side CBU API fetching.
- Added manual refresh button to Header component with brutal styling.
- Implemented loading state ("⏳ REFRESHING...") during fetch.
- Added "Last refreshed" timestamp display.
- Error handling with user alerts for failed fetches.
- Button disabled during refresh to prevent concurrent requests.

### Phase 8: Desktop Layout Refactor (16:9)
- **Implemented Responsive Dashboard**: Transformed the "long phone page" into a 2-column dashboard for desktop screens (`min-width: 1024px`).
- **Left Panel (Sticky)**: Contains "Tools" (CBU Rate, Calculator, History Chart).
- **Right Panel (Scrollable)**: Contains "Market" (Sorting Controls, Bank Grid).
- **CSS Grid Integration**: Used CSS Grid for the main layout and the bank list.
- **Bank Card Improvements**: Fixed text layout issues by centering content and adjusting spacing.
- **Mobile Preservation**: Maintained the optimized single-column layout for mobile devices.

### Phase 9: UI/UX Polish & Data Accuracy
- **Kapitalbank Logo Update**: Switched to official SVG logo for better quality.
- **Card Layout Refinement**:
    - Moved Bank Name to the **Left**.
    - Moved Bank Logo to the **Right**.
    - Removed absolute positioning for better flow.
- **Icon Visibility**: Increased bank logo size from 40px to **60px** for better readability.
- **System Verification**: Verified Python scraper environment and data freshness.

### Phase 10: Multi-Currency Support (RUB Added) 🇷🇺
- **Backend Overhaul**: Refactored `scripts/scraper.py` to be currency-agnostic. It now supports multiple currencies via configuration.
- **RUB Scraping**: Added logic to scrape Russian Ruble rates from `https://bank.uz/uz/currency/rossiyskiy-rubl`.
- **Nested Data Structure**: Updated `rates.json` to store data by currency (e.g., `{"usd": {...}, "rub": {...}}`).
- **Frontend Toggle**: Added a "USD | RUB" toggle in the Header to switch the entire dashboard view.
- **Dynamic Components**: Updated Chart, Calculator, and Bank List to react to the selected currency.
- **Code Cleanup**: Fixed syntax errors in `src/index.css` and improved button styling.

## Future Roadmap (Next Steps)

### Option 1: The "Visuals" Update (Charts) 📈 (COMPLETED)
- **Goal:** Visualise CBU rate history over the last 30 days.
- **Style:** Brutalist Charts - Jagged black lines, yellow background, no smooth curves.

### Option 2: The "App" Experience (PWA) 📱
- **Goal:** Turn the React site into a Progressive Web App.
- **Features:** "Add to Home Screen", offline support, custom splash screen.

### Option 3: Real Data Integration 🕷️ (COMPLETED)
- **Goal:** Replace mock data with real scraping where possible.
- **Status:** ✅ All 5 banks now show real data from bank.uz!

### Option 4: "Reverse" Calculator & UX 🧮
- **Features:**
    - Toggle for UZS -> USD calculation.
    - "Dark Brutalism" mode (Black background, neon text).

### Option 5: More Currencies? 🌍
- **Goal:** Add Euro (EUR) support using the new scalable architecture.
