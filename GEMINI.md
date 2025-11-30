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
- [x] **Frontend (React)**
    - [x] Setup Vite + React
    - [x] Implement Design System (CSS)
    - [x] Build Components (Card, Header, List, Calculator)
    - [x] Integration with `rates.json`
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
