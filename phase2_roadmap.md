# Phase 2 Roadmap - Currency Exchange Tracker

## Current State (Completed)

- ✅ Live CBU (Central Bank) rate fetching with 30-day historical data
- ✅ Real bank data scraping from 5 banks (Kapitalbank, Hamkorbank, Ipak Yuli, Saderat, Anorbank)
- ✅ Currency calculator (USD, EUR)
- ✅ 30-day history charts with Recharts
- ✅ Manual refresh with backend server
- ✅ Responsive 2-column dashboard layout
- ✅ Dark mode
- ✅ AQI/Weather integration
- ✅ GitHub Actions for hourly updates
- ✅ PWA & Offline Experience (Service Worker, Install Prompt)
- ✅ Euro (EUR) Support
- ✅ RUB (Russian Ruble) Support

---

## New Phases

### Phase 16: Rate Alerts & Notifications 🔔

- [ ] User-configurable threshold alerts ("Notify me when USD > 12,800")
- [ ] Telegram bot integration (very popular in Uzbekistan)
- [ ] Email alerts option
- [ ] Daily summary notifications

**Priority:** High  
**Complexity:** Medium-High

---

### Phase 17: Multi-Currency Expansion 💱

- [ ] Add GBP, CNY, KZT (Kazakh Tenge)
- [ ] Currency comparison view (EUR vs USD trends)
- [ ] Cross-rate calculator (USD → EUR via UZS)

**Priority:** High  
**Complexity:** Low-Medium

---

### Phase 18: Advanced Analytics 📊

- [ ] Best rate finder ("Hamkorbank has best USD buy rate today")
- [ ] Spread analysis (buy/sell difference per bank)
- [ ] Weekly/monthly trend indicators
- [ ] Rate prediction hints based on historical patterns

**Priority:** Medium  
**Complexity:** Medium

---

### Phase 19: Bank Coverage Expansion 🏦

- [ ] Add more banks: Uzum Bank, Davr Bank, Asakabank, NBU
- [ ] Cash vs card rate differentiation
- [ ] Branch locator integration (nearest bank with best rate)
- [ ] Operating hours display

**Priority:** Medium  
**Complexity:** Medium-High

---

### Phase 20: User Personalization 👤

- [ ] Favorite banks (pin to top)
- [ ] Preferred currency setting
- [ ] Transaction history calculator ("I exchanged $500 last week at X rate")
- [ ] Portfolio tracker (track your holdings across currencies)

**Priority:** Medium  
**Complexity:** Medium

---

### Phase 21: Social & Community Features 🗣️

- [ ] User-reported black market rates (crowdsourced, anonymous)
- [ ] Rate discussion/comments
- [ ] Share rate screenshots (brutalist styled cards for social media)

**Priority:** Low  
**Complexity:** High

---

### Phase 22: Performance & Polish ⚡

- [ ] Skeleton loaders during fetch
- [ ] Optimistic UI updates
- [ ] Chart performance optimization (virtualization for longer histories)
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

**Priority:** Medium  
**Complexity:** Low-Medium

---

## Quick Wins 🚀

These can be implemented quickly for immediate value:

| Feature | Effort | Impact |
|---------|--------|--------|
| RUB support | Low | High |
| "Best Rate" badge | Low | High |
| Spread display (buy/sell diff) | Low | Medium |
| Share button for Telegram | Low | Medium |

---

## Recommended Next Steps

1. **Phase 16 (Telegram Alerts)** — High engagement, Telegram is dominant in UZ
2. **Phase 18 (Advanced Analytics)** — Differentiate from competitors
3. **Phase 19 (Bank Coverage Expansion)** — More banks = more utility

---

## Tech Stack Considerations

| Feature | Suggested Tech |
|---------|----------------|
| PWA | Vite PWA Plugin, Workbox |
| Telegram Bot | node-telegram-bot-api, Python telegram library |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| User Auth (if needed) | Supabase, Firebase Auth |
| Branch Locator | Leaflet.js, OpenStreetMap |

---

*Last Updated: December 2024*
