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

### Phase 10: Dark Mode Polish
- **Theme Selector Fix**: Removed hardcoded white background from the theme toggle button in dark mode, allowing it to inherit the correct brutalist styles.
- **Card Background Consistency**: Updated `--card-bg` in dark mode to `#334155` (Slate Gray) to match the page background, creating a seamless look for bank cards while maintaining their borders.

### Phase 11: Synchronization & Maintenance
- **GitHub Sync**: Synchronized local repository with remote, resolving merge conflicts in `rates.json` by prioritizing local (newer) data.
- **Documentation**: Updated `GEMINI.md` to reflect the synchronization and maintenance steps.

### Phase 12: AQI Integration
- **IQAir API**: Configured `scraper.py` with IQAir API key to fetch real-time weather and air quality data for Tashkent.
- **Frontend Display**: Verified `WeatherBadge` component correctly displays the fetched AQI (e.g., 402 Hazardous) and temperature.

### Phase 13: Automation (Refresh Button)
- **Backend Server**: Created `server.js` to run the Python scraper on demand.
- **Scraper Update**: Added `--force` flag to `scraper.py` to bypass cache limits when manually triggered.
- **Frontend Integration**: Connected the "Refresh" button to the backend server via a proxy, allowing users to trigger real-time data updates from the UI.

### Phase 14: Euro Support (Synced from Remote)
- **New Currency**: Added support for Euro (EUR) currency.
- **Verification**: Added verification images for EUR state.
- **Header Update**: Updated `Header.jsx` to support the new currency toggle or display.

### Phase 15: Time Display & Backend Server Configuration
- **GMT+5 Clock**: Added live updating clock showing Uzbekistan time (GMT+5) in the header.
- **Backend Server Setup**: Updated backend server configuration to use ports 3050 and 3051 for redundancy.
- **Documentation**: Added comprehensive backend server setup instructions.

### Phase 16: KZT (Kazakhstani Tenge) Support
- **New Currency**: Added full support for KZT (Kazakhstani Tenge) currency.
- **Backend Integration**:
  - Added KZT configuration to `scraper.py` with CBU code, bank.uz URL, and fallback rates
  - Implemented scraping from `https://bank.uz/uz/currency/kzt`
  - Successfully scraping real data from 7 banks (Tenge Bank, NBU, Kapitalbank, etc.)
  - Adjusted tolerance to 30% for KZT due to higher spread variance (vs 10% for other currencies)
- **Frontend Update**: Added KZT toggle button to Header component matching USD/RUB/EUR styling
- **Data Quality**: Real bank data (not mock) with CBU rate: 23.44 UZS per KZT
- **Technical Challenge**: Bank.uz KZT page shows multiple currencies; scraper correctly identifies KZT container using rate range validation

### Phase 17: Gold Prices Integration
- **New Feature**: Added comprehensive gold prices from bank.uz with 30-day historical charts
- **Backend Implementation**:
  - Created `fetch_gold_bar_prices()` function to scrape https://bank.uz/uz/gold-bars
  - Parses HTML table for gold bar weights (5g, 10g, 20g, 50g, 100g) and prices in UZS
  - Successfully scraping **6 gold bar prices** with real-time data
  - Created `fetch_gold_history()` function for 30-day historical gold prices (USD per troy ounce)
  - Currently generates sample data; ready for API integration (Metals-API, GoldAPI, FreeGoldAPI)
  - Cached for 24 hours to optimize performance
- **Frontend Components**:
  - **GoldBarPrices.jsx**: Neubrutalist card displaying MB gold bars with prices and hover animations
  - **GoldHistoryChart.jsx**: Advanced interactive chart with multiple features:
    - Line + Area chart with gold gradient fill
    - **Zoom & Brush**: Interactive zoom control for time range selection
    - **7-Day Moving Average**: Trend line overlaid on price data
    - **Min/Max Markers**: Visual indicators for highest/lowest prices
    - **Custom Tooltips**: Shows date, price, daily change %, and 7-day MA
    - **Data Table**: Toggle button reveals full 30-day table with sortable columns
    - **Price Change Stats**: Header badge displays total 30-day change ($ and %)
- **Styling**: Added gold-specific CSS variables (`--gold-accent: #FFD700`, `--gold-dark: #B8860B`)
- **Integration**: Components added to left panel (Tools section) after currency history chart
- **Verification**: All features tested and working perfectly in browser

### Phase 18: UI Polish - Chart Visibility & Dark Mode Improvements
- **Chart Hover Indicators**: Improved visibility of chart hover dots across all precious metal charts
  - Replaced small colored dots with **white dots (8px radius)** with **thick black borders (4px stroke)**
  - Applied to `GoldHistoryChart.jsx`, `SilverHistoryChart.jsx`, and `BitcoinHistoryChart.jsx`
  - Much easier to see which data point you're hovering over in both light and dark modes
  - Implemented via `activeDot` prop on Area components in recharts
- **Dark Mode Button Visibility**: Fixed "SHOW TABLE"/"HIDE TABLE" button text invisibility in dark mode
  - Added dark mode CSS override for `.brutal-button` class in `src/index.css`
  - Applied `color: #FFFFFF` and `border-color: #FFFFFF` for better contrast against purple gradient background
  - Maintains original Neobrutalist design while ensuring readability
- **Git Workflow**: Successfully stashed local changes, pulled latest from remote, and reapplied changes without conflicts


## Backend Server Setup

This application requires backend servers to handle data refresh requests.

### Running the Backend Servers

The application uses two backend server instances for redundancy:

**Server 1 (Port 3050):**
```bash
node server.js --port=3050
```

**Server 2 (Port 3051):**
```bash
node server.js --port=3051
```

### Development Workflow

1. **Start the Vite dev server:**
   ```bash
   npm run dev
   ```

2. **Start backend server 1 (in a separate terminal):**
   ```bash
   node server.js --port=3050
   ```

3. **Start backend server 2 (in a separate terminal):**
   ```bash
   node server.js --port=3051
   ```

### What the Backend Servers Do

- Handle `/api/refresh` POST requests
- Trigger the Python scraper (`scripts/scraper.py`) with `--force` flag
- Update exchange rates and weather/AQI data
- The scraper fetches:
  - CBU exchange rates for USD, RUB, EUR, KZT
  - Commercial bank rates from bank.uz
  - Air quality data from IQAir API for Tashkent

### Troubleshooting

If the refresh button doesn't update AQI data:
1. Ensure at least one backend server is running
2. Check that the server is accessible at the configured port
3. Verify the Python scraper can run: `python scripts/scraper.py --force`
4. Check the IQAir API key in `scripts/scraper.py` (default key is included)

### Port Configuration

The Vite development server proxies `/api` requests to the backend servers:
- Primary: `http://localhost:3050`
- Fallback: `http://localhost:3051`

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
