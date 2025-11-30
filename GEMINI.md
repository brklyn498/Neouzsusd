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

## Future Roadmap (Next Steps)

### Option 1: The "Visuals" Update (Charts) 📈 (COMPLETED)
- **Goal:** Visualise CBU rate history over the last 30 days.
- **Style:** Brutalist Charts - Jagged black lines, yellow background, no smooth curves.

### Option 2: The "App" Experience (PWA) 📱
- **Goal:** Turn the React site into a Progressive Web App.
- **Features:** "Add to Home Screen", offline support, custom splash screen.

### Option 3: Real Data Integration 🕷️
- **Goal:** Replace mock data with real scraping where possible.
- **Target:** Hamkorbank (seems less protected than Kapitalbank).

### Option 4: "Reverse" Calculator & UX 🧮
- **Features:**
    - Toggle for UZS -> USD calculation.
    - "Dark Brutalism" mode (Black background, neon text).
