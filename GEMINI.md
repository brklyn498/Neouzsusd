# GEMINI.md - Dev Log

## ⚠️ CRITICAL RULES

1. **NEVER overwrite `.env` file** - Always check if it exists first and APPEND new keys, never replace the entire file.
2. **NEVER put actual API keys in documentation** - Use placeholders like `YOUR_KEY_HERE` or reference GitHub Secrets only.
3. **NEVER commit `.env` to git** - It's in `.gitignore` for a reason.

---

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

### Phase 19: Animations & Backend Fixes
- **Backend Fix**: Resolved missing `firebase-admin` dependency issue that was causing the scraper to fail.
- **Neubrutalist Animations**: Implemented a comprehensive animation system:
  - **Global Keyframes**: Added `slideInBrutal`, `popInBrutal`, and `glitchBrutal` to `index.css`.
  - **Staggered Entry**: Bank cards and Savings cards now slide in one by one with staggered delays.
  - **Header Animations**: "NEOUZS" title pops in, and rate cards slide in.
  - **Component Animations**: Applied slide-in effects to Gold Bar Prices and all History Charts.
- **Result**: The application now feels significantly more dynamic and "alive" while maintaining its brutalist aesthetic.

### Phase 20: Glitch & Clock Animations
- **Glitch Logo**: Replaced the static "NEOUZS" header with a custom `<GlitchLogo />` component.
  - **Implementation**: Uses a "CSS Stack" method with 3 layers (Base, Red, Blue) and `clip-path` animations.
  - **Refinement**: Tuned the animation to be slower (6-8s loop) with random pauses for a "stable but glitchy" cyberpunk look.
- **Clock Animation**: Implemented a live `<Clock />` component.
  - **Tick Pop**: Digits animate with a `tick-pop` effect (slide up + fade in) whenever they change.
  - **Alignment**: Switched to `JetBrains Mono` monospace font to ensure perfect alignment and prevent jitter.
  - **Robustness**: Used `Intl.DateTimeFormat` for reliable GMT+5 time formatting.
- **Animation Fixes**: Resolved conflicts between "Slide In" entry animations and "Hover Pop" effects by separating them into wrapper `divs`.

### Phase 21: News Feed Enhancements
- **SVG Flag Badges**: Replaced emoji flags with proper SVG images from Wikipedia for language indicators
  - UK, Russia, and Uzbekistan flag SVGs for EN, RU, UZ articles
  - Consistent white backgrounds with black text for visibility in dark mode
- **Glassmorphism Buttons**: Applied frosted glass effect to "READ MORE" and "CLOSE" buttons
  - `backdrop-filter: blur(10px)` with semi-transparent backgrounds
  - "READ ORIGINAL ARTICLE" stays bright cyan as primary action
- **Modal Close Animation**: Added smooth exit animation for article modal
  - Fades out with `opacity: 0` 
  - Scales down with `scale(0.95)` and slides down
  - 200ms transition for smooth UX
- **Tag-Based Filtering**: New "FILTER BY TAGS" sidebar card
  - 8 clickable tags: Economy, Business, Markets, Banks, Currency, Politics, Tech, Tashkent
  - Filters news articles by keyword matching in title, summary, and category
  - Shows article count and active filter badge
- **Independent Sidebar Scroll**: Fixed sidebar scroll behavior
  - Left panel now scrollable independently with `max-height: calc(100vh - 2rem)`
  - Custom minimal scrollbar styling
  - Added padding to prevent card hover clipping
- **Updated News Sources**: Simplified to show Gazeta.uz, Daryo.uz, UzDaily, Spot.uz


## Backend Server Setup

This application requires backend servers to handle data refresh requests.

### Running with PM2 (Recommended)

PM2 keeps servers alive with auto-restart capability. An `ecosystem.config.cjs` file is provided for easy management.

**Start both servers:**
```bash
pm2 start ecosystem.config.cjs
```

**Check status:**
```bash
pm2 status
```

**View logs:**
```bash
pm2 logs
```

**Stop all servers:**
```bash
pm2 stop all
```

**Restart after crash or manual stop:**
```bash
pm2 restart all
```

**Save process list (for auto-restart on reboot):**
```bash
pm2 save
```

### Manual Mode (Development Only)

If you prefer manual control:

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

2. **Start backend servers with PM2:**
   ```bash
   pm2 start ecosystem.config.cjs
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

### Option 2: The "App" Experience (PWA) 📱 (COMPLETED)
- **Goal:** Turn the React site into a Progressive Web App.
- **Features:** "Add to Home Screen", offline support, custom splash screen.
- **Status:** ✅ Visual polish (Scrollbar, Skeleton Loading) completed to give "App-like" feel.

### Phase 21: Visual Polish & "App-Like" Feel
- **Custom Brutalist Scrollbar**: Implemented a chunky, square scrollbar with high-contrast colors (Purple/Pink) to match the theme.
- **Skeleton Loading**: Replaced text-based loading states with shimmering gray/metallic blocks for a smoother, premium experience.
- **CBU Logo Update**: Switched to the official Central Bank of Uzbekistan logo (PNG) for better authenticity.
- **Dark Mode Refinements**:
  - Fixed "NEOUZS" logo color to be white in dark mode.
  - Adjusted CBU card background to a softer yellow (`#FFF59D`) for better contrast.
- **Goal:** Replace mock data with real scraping where possible.
- **Status:** ✅ All 5 banks now show real data from bank.uz!

### Option 4: "Reverse" Calculator & UX 🧮
- **Features:**
    - Toggle for UZS -> USD calculation.
    - "Dark Brutalism" mode (Black background, neon text).

### Phase 21: News Feed Implementation (Phase 1) 📰
- **Goal**: Implement a financial news feed aggregation system.
- **Backend**:
    - Add `feedparser` and `python-dateutil` dependencies.
    - Implement RSS fetching for Gazeta.uz, Daryo.uz, and UzDaily in `scraper.py`.
    - Update `rates.json` schema to include a `news` section.
- **Frontend**:
    - Create `NewsFeed` and `NewsCard` components.
    - Add "NEWS" view mode to `App.jsx` and `Header.jsx`.
    - Apply Neubrutalist styling to news cards.

### Phase 24: News Feed Enhancements (Spot.uz + Language Badges)
- **New Source**: Added Spot.uz business news with multi-language support.
  - Russian feed: `https://www.spot.uz/rss`
  - Uzbek feed: `https://www.spot.uz/oz/rss/`
- **Language Badges**: Each news card now displays a language badge:
  - 🇬🇧 EN (cyan) - English sources (Gazeta.uz, Daryo.uz, UzDaily)
  - 🇷🇺 RU (magenta) - Russian Spot.uz
  - 🇺🇿 UZ (lime green) - Uzbek Spot.uz
- **Backend Changes**: Updated `scraper.py` to include `lang` field in source config and news items.
- **Frontend Changes**: Updated `NewsCard.jsx` with conditional language badge rendering using flag emojis and distinct colors.

### Phase 25: Article Modal Viewer
- **Full Content Fetching**: Updated `scraper.py` to extract full article content from RSS (up to 2000 chars).
  - Uses `content:encoded` field when available, falls back to `summary`.
  - Stores both `summary` (200 char preview) and `full_content` (full text) in `rates.json`.
- **New Component**: Created `ArticleModal.jsx` - a Neubrutalist modal for reading full articles:
  - Header image display (if available)
  - Metadata badges (source, language with flag, category)
  - Full article text with proper formatting
  - "READ ORIGINAL ARTICLE" button to visit source
  - Keyboard support (Escape to close)
  - Body scroll lock when open
- **NewsCard Updates**: Added "📖 READ MORE" button and made cards clickable to open modal.
- **NewsFeed Integration**: Added modal state management with `selectedArticle` useState hook.

### Phase 26: Source Reliability Scoring (NEWS_ROADMAP Task 3.5)
- **Feature**: Added trust/reliability indicators to news sources for user transparency.
- **Backend Changes** (`scripts/scraper.py`):
  - Added `SOURCE_RELIABILITY` dictionary with 4-tier system:
    - **Official** (1.0): CBU, IMF, World Bank - Government/international sources
    - **Verified** (0.8): Gazeta.uz, Kapital.uz - Established local outlets
    - **Standard** (0.5): UzDaily, Spot.uz - Regular sources
    - **Aggregator** (0.3): WorldNewsAPI - News aggregators
  - Added `get_reliability()` helper function
  - Updated all 5 news fetch functions to include `reliability_tier`, `reliability_score`, `reliability_label` fields
- **Frontend Changes** (`src/components/NewsCard.jsx`):
  - Created `ReliabilityBadge` component with color-coded badges:
    - ✓ OFFICIAL (bright green)
    - ✓ VERIFIED (cyan)
    - ⚡ AGGREGATOR (yellow)
  - Badge appears next to source name on news cards
- **Verification**: Confirmed badges display correctly in browser


### Phase 27: Debugging Hidden Trust Button
- **Issue**: The "TRUST" button in the header was hidden/cut off on smaller screens due to the button group being too wide and not wrapping.
- **Fix**: Updated `Header.jsx` to make the button group container scrollable horizontally (`overflow-x: auto`) and prevented text wrapping inside buttons (`white-space: nowrap`).
- **Result**: The "TRUST" button is now accessible on all screen sizes by scrolling the button group if needed.

### Phase 28: Interactive Report & Trust UI Polish
- **Interactive Report**: Integrated `report.html` as a fully interactive React component (`InteractiveReport.jsx`).
  - Features tabbed navigation (Market Structure, Activity, Reliability).
  - Implemented interactive charts using `recharts` (Pie, Bar, Radar).
  - Added a sortable, filterable table for bank data.
- **Trust Section Enhancements**:
  - Added a prominent "VIEW INTERACTIVE REPORT" button with a **Soft Indigo-Purple Gradient** and **Smooth Hover** effect.
  - Fixed "Blank Screen" error by restoring missing logic in `BankReliability.jsx`.
  - Updated bank data (Ownership, License Year) in `rates.json` via `scraper.py` to match the report.
- **Kursiv Removal**: Removed "Kursiv.uz" from news sources and reliability configuration as requested.

### Phase 29: Trust Page Animations
- **Entrance Animations**: Implemented staggered slide-in effects for bank cards and a pop-in animation for the "Interactive Report" button.
- **Dropdown Animations**: Added smooth `slideDownBrutal` animation for the "Scoring Criteria" and "Bank Details" dropdowns.
- **CSS Updates**: Added new keyframes (`slideDownBrutal`, `popInBrutal`) and utility classes to `index.css`.

### Phase 30: Scoped Refresh & UI Polish
- **Scoped Refresh**: Implemented `scope` parameter in `refreshRates` (Frontend) and `scraper.py` (Backend) to optimize data fetching.
- **Chart Badges**: Updated Gold, Silver, and Bitcoin charts to display "CURRENT" instead of "TODAY" to reflect real-time data.
- **Backend Update**: Updated `server.js` to parse request body and pass `--scope` flag.

### Phase 31: USD Savings Deposits
- **New Feature**: Added support for USD/foreign currency savings deposits from bank.uz.
- **Backend**: Created `fetch_usd_savings_rates()` function with pagination support (5 pages).
- **Frontend**: Added UZS/USD toggle in Savings view, currency badges (USD/EUR) on SavingsCard.
- **Dynamic Tips**: Fixed SAVINGS TIPS card to show correct top rate based on selected currency.

### Phase 32: Refresh Button Animation
- **Smooth Animation**: Replaced choppy dots animation with fluid gradient + pulse effect.
- **Dark Mode Fix**: White text for SYNCING in dark mode.
- **Spinner**: Added spinning ⟳ icon during refresh.

### Phase 33: Bank Profile Modal
- **Clickable Bank Cards**: Bank cards in Exchange view now open a profile modal.
- **New Files**:
  - `src/data/bankProfiles.js` - 32 banks with address, website, savings URL, telegram, hotline, email
  - `src/components/BankProfileModal.jsx` - Modal with header, rates, quick actions, contact info
- **Features**:
  - Bank logo, name, type badge (State/Private/Foreign)
  - Today's exchange rates (Buy/Sell/Spread)
  - Quick action buttons: Website, Deposits, Telegram
  - Contact info: Address, Hotline (clickable), Email (clickable)
- **Styling**: Neobrutalist modal with animations (slideUp, fadeIn)

---

## Future Phases: Bank Profile Enhancements

### Instructions for Adding Extra Bank Info

When the user provides `extra_info.xlsx` with additional bank data (working hours, branch count, SWIFT code, etc.):

1. **Update `src/data/bankProfiles.js`**:
   ```javascript
   // Add new fields to each bank object
   "Kapitalbank": {
     ...existing fields...,
     working_hours: "Mon-Fri 9:00-18:00, Sat 9:00-14:00",
     branch_count: 150,
     swift_code: "KPUZUZ22",
     instagram: "https://instagram.com/kapitalbank",
     facebook: "https://facebook.com/kapitalbank"
   }
   ```

2. **Update `BankProfileModal.jsx`**:
   - Add new section for "Working Hours" if available
   - Add branch count display
   - Add Instagram/Facebook icons to social links
   - Add SWIFT code in contact section (for business users)

3. **Parse PDF for research data**:
   - File: `Uzbekistan Bank Information Research.pdf`
   - Extract any additional structured data
   - Cross-reference with existing bank profiles

### Potential Future Features
- Separate page routes (`/bank/kapitalbank`) for SEO
- Bank comparison feature (select 2-3 banks to compare)
- Historical rate chart per bank
- User reviews/ratings

### Phase 34: Savings Card Embedded Calculator
- **New Feature**: Each savings card now has an embedded neobrutalist calculator
- **Toggle Button**: "▼ CALCULATE EARNINGS" / "▲ HIDE CALCULATOR"
- **Slider Controls**:
  - UZS deposits: Min amount → 200M UZS (1M steps)
  - USD deposits: $500 → $100,000 ($100 steps)
- **Calculations**: Shows 1-year interest + total amount
- **Styling**:
  - Slide-down animation on open
  - Custom neobrutalist slider thumb
  - Bright green (#00C853) for interest display
  - Theme-aware colors (black/white text for light/dark modes)
- **Files Modified**: `SavingsCard.jsx`, `index.css`

### Phase 35: Gold Investment Banks
- **New Feature**: Added "Invest in Real Gold" section to Metals/Gold view
- **Banks Displayed**:
  - **NBU (National Bank of Uzbekistan)**: Золотой депозит (Golden Deposit)
    - Min investment: 5g in-branch, 0.1g via Milliy app
    - No commission, VAT exempt, partial withdrawals allowed
    - Website: https://nbu.uz/ru/fizicheskim-litsam-vklady/zolotoy-depozit
  - **SQB (Sanoat Qurilish Bank)**: Gold via SQB Mobile
    - 1-25g per transaction
    - Buy/sell via app, daily rate monitoring
    - Available to residents & non-residents
    - Contact: +99871 200 43 43
    - Website: https://sqb.uz/press-center/ads-ru/investiruyte-v-zoloto-legko-i-bezopasno/
- **New Files**:
  - `src/components/GoldInvestmentBanks.jsx` - Component with bank data and LEARN MORE links
- **Styling**:
  - Gold gradient cards with Neubrutalist design
  - Hover effects (lift + shadow)
  - Responsive layout (stacks on mobile)
- **Note**: Reference information only, not affiliate links. Both are state-owned banks.

