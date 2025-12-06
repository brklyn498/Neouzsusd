# Phase 2 Roadmap - NeoUZS Currency Exchange Tracker

*Last Updated: December 2024*

---

## Current State (Completed Features)

### Core Functionality
- [x] Live CBU (Central Bank) rate fetching with 30-day historical data
- [x] Real bank data scraping from 20+ banks via bank.uz
- [x] Currency calculator (USD, EUR, RUB, KZT, GBP)
- [x] 30-day history charts with Recharts
- [x] Manual refresh with backend server
- [x] Responsive 2-column dashboard layout

### Multi-Currency Support
- [x] USD (US Dollar)
- [x] EUR (Euro)
- [x] RUB (Russian Ruble)
- [x] KZT (Kazakhstani Tenge)
- [x] GBP (British Pound)

### Precious Metals & Crypto
- [x] Gold bar prices from bank.uz (5g, 10g, 20g, 50g, 100g)
- [x] Gold spot price history chart (XAU/USD)
- [x] Silver spot price history chart (XAG/USD)
- [x] Bitcoin price history chart (BTC/USD)
- [x] Gold investment banks section (NBU, SQB)

### Savings & Deposits
- [x] UZS savings deposits from bank.uz
- [x] USD/EUR savings deposits
- [x] Embedded calculator per savings card
- [x] Currency toggle (UZS/USD)

### News Feed
- [x] RSS feed aggregation (Gazeta.uz, UzDaily, Spot.uz)
- [x] CBU press releases scraping
- [x] IMF/World Bank news integration
- [x] WorldNewsAPI integration
- [x] Category filtering (Economy, Banking, Markets, Business, Regulation)
- [x] Source filtering
- [x] Language badges (EN, RU, UZ)
- [x] Source reliability scoring
- [x] Full article modal viewer

### Bank Features
- [x] Bank profile modals with contact info
- [x] Bank reliability/trust scoring
- [x] Interactive sector report
- [x] 32 bank profiles with addresses, websites, Telegram, hotlines

### UI/UX
- [x] Neubrutalism design system
- [x] Dark mode with glassmorphism
- [x] PWA & Offline experience (Service Worker, Install Prompt)
- [x] Custom animations (glitch logo, slide-in cards)
- [x] Skeleton loaders
- [x] AQI/Weather integration for Tashkent

---

## Upcoming Phases

### Phase 23: Security & Infrastructure Hardening

**Priority:** CRITICAL | **Complexity:** Low-Medium

Based on security audit findings:

| Task | Description | Status |
|------|-------------|--------|
| 23.1 | Remove hardcoded IQAir API key from scraper.py | Pending |
| 23.2 | Switch IQAir API to HTTPS | Pending |
| 23.3 | Pin Python dependencies in requirements.txt | Pending |
| 23.4 | Run npm audit fix for JavaScript vulnerabilities | Pending |
| 23.5 | Move playwright to devDependencies | Pending |
| 23.6 | Implement specific exception handling (replace broad `except Exception`) | Pending |
| 23.7 | Consider separate data branch to reduce git history bloat | Pending |

---

### Phase 24: Rate Alerts & Notifications

**Priority:** HIGH | **Complexity:** Medium-High

| Task | Description | Status |
|------|-------------|--------|
| 24.1 | User-configurable threshold alerts ("Notify when USD > 12,800") | Pending |
| 24.2 | Telegram bot integration (very popular in Uzbekistan) | Pending |
| 24.3 | Browser push notifications via Firebase | Pending |
| 24.4 | Daily rate summary notifications | Pending |
| 24.5 | Breaking news alerts for major CBU announcements | Pending |

**Tech Stack:**
- Telegram: `node-telegram-bot-api` or Python `python-telegram-bot`
- Push: Firebase Cloud Messaging (FCM)
- Storage: Supabase or Firebase for user preferences

---

### Phase 25: Multi-Currency Expansion

**Priority:** HIGH | **Complexity:** Low-Medium

| Task | Description | Status |
|------|-------------|--------|
| 25.1 | Add CNY (Chinese Yuan) | Pending |
| 25.2 | Add TRY (Turkish Lira) | Pending |
| 25.3 | Add AED (UAE Dirham) | Pending |
| 25.4 | Add KRW (Korean Won) | Pending |
| 25.5 | Currency comparison view (EUR vs USD trends) | Pending |
| 25.6 | Cross-rate calculator (USD -> EUR via UZS) | Pending |
| 25.7 | Currency basket view (weighted index) | Pending |

---

### Phase 26: Advanced Analytics

**Priority:** MEDIUM | **Complexity:** Medium

| Task | Description | Status |
|------|-------------|--------|
| 26.1 | Best rate finder ("Hamkorbank has best USD buy rate today") | Pending |
| 26.2 | Spread analysis (buy/sell difference per bank) | Pending |
| 26.3 | Weekly/monthly trend indicators with arrows | Pending |
| 26.4 | Rate volatility index | Pending |
| 26.5 | Historical comparison ("Rate 1 year ago was X") | Pending |
| 26.6 | Rate prediction hints based on historical patterns | Pending |
| 26.7 | Export rate history as CSV/PDF | Pending |

---

### Phase 27: Bank Coverage Expansion

**Priority:** MEDIUM | **Complexity:** Medium-High

| Task | Description | Status |
|------|-------------|--------|
| 27.1 | Add remaining banks: Uzum Bank, Davr Bank, Aloqabank, etc. | Pending |
| 27.2 | Cash vs card rate differentiation | Pending |
| 27.3 | Branch locator with map (Leaflet.js + OpenStreetMap) | Pending |
| 27.4 | Operating hours display | Pending |
| 27.5 | ATM locations with currency availability | Pending |
| 27.6 | Bank comparison tool (side-by-side) | Pending |
| 27.7 | Integrate extra_info.csv data (32 banks with full details) | Pending |

---

### Phase 28: User Personalization

**Priority:** MEDIUM | **Complexity:** Medium

| Task | Description | Status |
|------|-------------|--------|
| 28.1 | Favorite banks (pin to top) | Pending |
| 28.2 | Preferred currency setting | Pending |
| 28.3 | Transaction history calculator | Pending |
| 28.4 | Portfolio tracker (track holdings across currencies) | Pending |
| 28.5 | Custom quick-convert amounts | Pending |
| 28.6 | Theme customization (accent colors) | Pending |
| 28.7 | Local storage sync across devices (optional login) | Pending |

**Tech Stack:**
- Local: localStorage / IndexedDB
- Sync: Supabase Auth + Realtime

---

### Phase 29: Localization & Accessibility

**Priority:** MEDIUM | **Complexity:** Medium

| Task | Description | Status |
|------|-------------|--------|
| 29.1 | Uzbek (UZ) language support | Pending |
| 29.2 | Russian (RU) language support | Pending |
| 29.3 | RTL support for future Arabic/Persian | Pending |
| 29.4 | ARIA labels for screen readers | Pending |
| 29.5 | Keyboard navigation improvements | Pending |
| 29.6 | High contrast mode | Pending |
| 29.7 | Reduced motion mode | Pending |

---

### Phase 30: Performance & Polish

**Priority:** MEDIUM | **Complexity:** Low-Medium

| Task | Description | Status |
|------|-------------|--------|
| 30.1 | Skeleton loaders during all fetches | Completed |
| 30.2 | Optimistic UI updates | Pending |
| 30.3 | Chart virtualization for longer histories | Pending |
| 30.4 | Lazy loading for components (React.lazy) | Pending |
| 30.5 | Code splitting by route | Pending |
| 30.6 | Image optimization (WebP, lazy load) | Pending |
| 30.7 | Service worker cache optimization | Pending |
| 30.8 | Bundle size reduction | Pending |

---

### Phase 31: Testing & Quality

**Priority:** HIGH | **Complexity:** Medium

| Task | Description | Status |
|------|-------------|--------|
| 31.1 | Unit tests for utility functions | Pending |
| 31.2 | Component tests with React Testing Library | Pending |
| 31.3 | E2E tests with Playwright | Pending |
| 31.4 | API/scraper tests | Pending |
| 31.5 | Error boundary implementation | Pending |
| 31.6 | Sentry or similar error tracking | Pending |
| 31.7 | Performance monitoring (Core Web Vitals) | Pending |

---

### Phase 32: Social & Community Features

**Priority:** LOW | **Complexity:** High

| Task | Description | Status |
|------|-------------|--------|
| 32.1 | User-reported black market rates (crowdsourced, anonymous) | Pending |
| 32.2 | Rate discussion/comments | Pending |
| 32.3 | Share rate cards to Telegram/social media | Pending |
| 32.4 | Embeddable widget for websites | Pending |
| 32.5 | Public API for developers | Pending |

---

### Phase 33: SEO & Marketing

**Priority:** LOW | **Complexity:** Low

| Task | Description | Status |
|------|-------------|--------|
| 33.1 | Meta tags for all pages | Pending |
| 33.2 | Open Graph images for social sharing | Pending |
| 33.3 | Structured data (JSON-LD) for rates | Pending |
| 33.4 | Sitemap generation | Pending |
| 33.5 | Analytics integration (privacy-friendly) | Pending |

---

## Quick Wins

Implement these for immediate impact:

| Feature | Effort | Impact | Status |
|---------|--------|--------|--------|
| HTTPS for IQAir API | Very Low | High (Security) | Pending |
| Pin Python deps | Very Low | Medium (Stability) | Pending |
| "Best Rate" badge on cards | Low | High | Pending |
| Share button for Telegram | Low | Medium | Pending |
| CSV export for rate history | Low | Medium | Pending |
| Keyboard shortcuts | Low | Low | Pending |

---

## Recommended Implementation Order

1. **Phase 23 (Security Hardening)** - Critical security fixes
2. **Phase 31 (Testing)** - Foundation for stable development
3. **Phase 24 (Alerts)** - High engagement, Telegram is dominant in UZ
4. **Phase 26 (Analytics)** - Differentiate from competitors
5. **Phase 27 (Bank Expansion)** - More banks = more utility
6. **Phase 29 (Localization)** - Reach Uzbek/Russian speakers

---

## Tech Stack Reference

| Feature | Suggested Technology |
|---------|---------------------|
| PWA | Vite PWA Plugin (already in use), Workbox |
| Telegram Bot | `node-telegram-bot-api` or `python-telegram-bot` |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| User Auth | Supabase Auth, Firebase Auth |
| Branch Locator | Leaflet.js + OpenStreetMap |
| Testing | Playwright (already installed), Vitest, React Testing Library |
| Error Tracking | Sentry |
| Analytics | Plausible, Simple Analytics (privacy-friendly) |
| Localization | i18next, react-i18next |
| State Management | Zustand (if needed beyond React state) |

---

## Data Sources Reference

### Currency Rates
- **CBU**: `https://cbu.uz/common/json/` (official)
- **Bank.uz**: `https://bank.uz/uz/currency/` (aggregator)

### Precious Metals
- **Gold Bars**: `https://bank.uz/uz/gold-bars`
- **Spot Prices**: Polygon.io API

### News Sources
- Gazeta.uz RSS
- UzDaily RSS
- Spot.uz RSS
- CBU Press Center
- IMF/World Bank APIs
- WorldNewsAPI

### Bank Information
- Bank.uz for rates
- `extra_info.csv` for 32 banks with contact details
- `bankProfiles.js` for profile data

---

## Known Issues & Technical Debt

1. **Git history bloat**: `rates.json` committed hourly to main branch
2. **Hardcoded API key**: IQAir key in scraper.py (security risk)
3. **HTTP API call**: IQAir using HTTP instead of HTTPS
4. **Unpinned dependencies**: Python requirements not version-locked
5. **Broad exception handling**: Generic `except Exception` throughout scraper
6. **npm vulnerabilities**: esbuild/vite audit warnings
7. **No automated tests**: Manual testing only

---

## Metrics & Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| Banks tracked | 20+ | 35+ |
| Currencies supported | 5 | 10 |
| News freshness | 30 min | 15 min |
| Lighthouse score | ~85 | 95+ |
| Test coverage | 0% | 80% |
| Languages supported | 1 (EN) | 3 (EN, UZ, RU) |

---

*Document maintained by NeoUZS Development Team*
