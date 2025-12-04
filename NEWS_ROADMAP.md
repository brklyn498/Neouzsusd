# NeoUZS News Feed Implementation Roadmap

## Executive Summary

This roadmap outlines the implementation strategy for adding a comprehensive financial news feed to the NeoUZS currency exchange tracking PWA. The news feed will aggregate Uzbekistan-focused finance, economics, and banking news from multiple local and international sources.

---

## Table of Contents

1. [Current Architecture Analysis](#current-architecture-analysis)
2. [Uzbek Finance News Sources](#uzbek-finance-news-sources)
3. [Technical Implementation Plan](#technical-implementation-plan)
4. [Phase Breakdown](#phase-breakdown)
5. [Data Structure Design](#data-structure-design)
6. [UI/UX Design Specifications](#uiux-design-specifications)
7. [API Integration Strategy](#api-integration-strategy)
8. [Timeline & Priorities](#timeline--priorities)

---

## Current Architecture Analysis

### Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18.2.0 + Vite 6.4.1 |
| Charts | Recharts 2.15.0 |
| Styling | Custom CSS (Neubrutalism design) |
| PWA | Vite PWA Plugin + Workbox 7.4.0 |
| Backend Scraper | Python 3 + BeautifulSoup |
| Notifications | Firebase Cloud Messaging |
| Data Storage | Static JSON (rates.json) |
| CI/CD | GitHub Actions (hourly updates) |

### Existing Data Flow
```
GitHub Actions (Hourly)
    ↓
Python Scraper (scripts/scraper.py)
    ↓
Fetches from: CBU, Bank.uz, IQAir, Polygon.io
    ↓
Generates public/rates.json
    ↓
Git commit & push → Frontend fetches on load
```

### Current View Modes
- `exchange` - Currency exchange rates
- `metals` - Gold, Silver, Bitcoin prices
- `savings` - Bank deposit products

**Proposed Addition:** `news` - Financial news feed

---

## Uzbek Finance News Sources

### Tier 1: Primary Local Sources (RSS/Scraping Priority)

| Source | URL | Focus | RSS Available |
|--------|-----|-------|---------------|
| **Gazeta.uz** | [gazeta.uz/en](https://www.gazeta.uz/en/) | Politics, Economy, Society | ✅ [RSS Feeds](https://www.gazeta.uz/en/feeds/) |
| **Kun.uz** | [kun.uz/en](https://kun.uz/en/news/list) | General News, Economy | ✅ Available |
| **Daryo.uz** | [daryo.uz/en](https://daryo.uz/en/) | Breaking News, Finance | ✅ `daryo.uz/rss` |
| **UzDaily.com** | [uzdaily.uz/en](https://www.uzdaily.uz/en/) | Business, Finance, Markets | ✅ Available |
| **Review.uz** | [review.uz/en](https://review.uz/en) | Business, Economic Analysis | ⚠️ To verify |

### Tier 2: Official Government Sources

| Source | URL | Focus | Data Access |
|--------|-----|-------|-------------|
| **Central Bank of Uzbekistan** | [cbu.uz/en](https://cbu.uz/en/) | Monetary Policy, Exchange Rates | [News Page](https://cbu.uz/en/press_center/news/), [Open Data](https://cbu.uz/en/services/open_data/) |
| **UZA.uz** | [uza.uz](https://uza.uz) | National News Agency | ✅ `uza.uz/uz/rss` |
| **Ministry of Finance** | mf.uz | Budget, Fiscal Policy | Scraping required |

### Tier 3: International Finance Sources (Uzbekistan Focus)

| Source | URL | Focus |
|--------|-----|-------|
| **IMF - Uzbekistan** | [imf.org](https://www.imf.org/en/countries/uzb) | Article IV Consultations, Economic Reports |
| **World Bank - Uzbekistan** | [worldbank.org](https://www.worldbank.org/en/country/uzbekistan/overview) | Development Projects, Economic Data |
| **Asian Development Bank** | [adb.org](https://www.adb.org/countries/uzbekistan/main) | Infrastructure, Growth Forecasts |
| **EBRD** | ebrd.com | Investment, Regional Development |
| **Central Banking** | [centralbanking.com](https://www.centralbanking.com/regions/uzbekistan) | CBU Analysis, Policy |

### Tier 4: Business & Specialty Sources

| Source | URL | Focus |
|--------|-----|-------|
| **Spot.uz** | spot.uz | Business, Entrepreneurship, Tech |
| **UzReport.news** | uzreport.news | Economic, Political, Cultural |
| **Newsline.uz** | newslineuz.com | Economic Updates |
| **Nuz.uz** | nuz.uz | Politics, Economics, Sports |

### API Services

| Service | URL | Details |
|---------|-----|---------|
| **WorldNewsAPI** | [worldnewsapi.com](https://worldnewsapi.com/docs/news-sources/uzbekistan-news-api/) | 53+ daily items, country code "uz", 6 monitored sources, history from Jan 2022 |
| **NewsAPI.org** | [newsapi.org](https://newsapi.org/) | Global news search, JSON format |
| **NewsData.io** | [newsdata.io](https://newsdata.io/) | Real-time & historical news API |

---

## Technical Implementation Plan

### Phase 1: Foundation (MVP)
**Goal:** Basic news feed with manual RSS/scraping integration

#### 1.1 Data Structure Extension
Add `news` array to `rates.json`:
```json
{
  "last_updated": "2025-12-04 09:05",
  "usd": { ... },
  "news": {
    "last_fetched": "2025-12-04 09:00",
    "items": [
      {
        "id": "gz-2025-12-04-001",
        "title": "Uzbekistan GDP grows 7.6% in 9M25",
        "summary": "President Mirziyoyev outlines 2026 budget targets...",
        "source": "Gazeta.uz",
        "source_url": "https://gazeta.uz/en/...",
        "category": "economy",
        "published_at": "2025-12-04T08:30:00Z",
        "image_url": null,
        "is_breaking": false
      }
    ]
  }
}
```

#### 1.2 Python Scraper Enhancement
Add to `scripts/scraper.py`:
```python
import feedparser

def fetch_news():
    sources = [
        {"name": "Gazeta.uz", "rss": "https://www.gazeta.uz/en/feeds/news.xml", "category": "general"},
        {"name": "Daryo.uz", "rss": "https://daryo.uz/en/feed/", "category": "general"},
        {"name": "UzDaily", "rss": "https://uzdaily.uz/en/rss", "category": "business"},
    ]

    all_news = []
    for source in sources:
        feed = feedparser.parse(source["rss"])
        for entry in feed.entries[:10]:  # Limit per source
            all_news.append({
                "id": generate_id(source["name"], entry.published),
                "title": entry.title,
                "summary": clean_summary(entry.get("summary", "")),
                "source": source["name"],
                "source_url": entry.link,
                "category": categorize(entry.title, entry.summary),
                "published_at": parse_date(entry.published),
                "image_url": extract_image(entry),
                "is_breaking": False
            })

    return sorted(all_news, key=lambda x: x["published_at"], reverse=True)[:30]
```

#### 1.3 Frontend Component
Create `src/components/NewsFeed.jsx`:
```jsx
function NewsFeed({ news, darkMode }) {
  return (
    <div className="news-feed">
      <h2 className="brutal-title">FINANCIAL NEWS</h2>
      <div className="news-grid">
        {news.map((item, index) => (
          <NewsCard key={item.id} item={item} darkMode={darkMode} delay={index} />
        ))}
      </div>
    </div>
  );
}
```

---

### Phase 2: Enhanced Features

#### 2.1 News Categories
- `economy` - GDP, inflation, fiscal policy
- `banking` - CBU decisions, bank products
- `markets` - Currency, stocks, commodities
- `business` - Corporate news, investments
- `regulation` - Laws, government decisions

#### 2.2 Category Filter Component
```jsx
const categories = ['all', 'economy', 'banking', 'markets', 'business', 'regulation'];

function CategoryFilter({ active, onChange }) {
  return (
    <div className="category-filter brutal-row">
      {categories.map(cat => (
        <button
          key={cat}
          className={`brutal-btn ${active === cat ? 'active' : ''}`}
          onClick={() => onChange(cat)}
        >
          {cat.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

#### 2.3 News Card Styling (Neubrutalism)
```css
.news-card {
  background: var(--card-bg);
  border: 3px solid var(--border-color);
  box-shadow: 4px 4px 0 var(--shadow-color);
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.news-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--shadow-color);
}

.news-card .source-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--accent-cyan);
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.news-card .category-tag {
  background: var(--accent-pink);
  padding: 0.2rem 0.4rem;
  font-size: 0.65rem;
}

.news-card.breaking {
  border-color: #FF5200;
  animation: breakingPulse 2s infinite;
}

@keyframes breakingPulse {
  0%, 100% { box-shadow: 4px 4px 0 var(--shadow-color); }
  50% { box-shadow: 4px 4px 0 #FF5200, 0 0 20px rgba(255, 82, 0, 0.3); }
}
```

---

### Phase 3: Advanced Integration

#### 3.1 WorldNewsAPI Integration
```python
import requests

def fetch_worldnews_api():
    """Fetch from WorldNewsAPI for broader coverage"""
    API_KEY = os.environ.get("WORLDNEWS_API_KEY")

    response = requests.get(
        "https://api.worldnewsapi.com/search-news",
        params={
            "api-key": API_KEY,
            "source-country": "uz",
            "language": "en",
            "number": 20,
            "sort": "publish-time",
            "sort-direction": "DESC"
        }
    )

    return response.json().get("news", [])
```

#### 3.2 CBU Official News Scraping
```python
from bs4 import BeautifulSoup

def fetch_cbu_news():
    """Scrape Central Bank of Uzbekistan press releases"""
    url = "https://cbu.uz/en/press_center/news/"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    news_items = []
    for article in soup.select('.news-item'):  # Adjust selector
        news_items.append({
            "title": article.select_one('.title').text.strip(),
            "source": "CBU",
            "category": "banking",
            "is_official": True
        })

    return news_items
```

#### 3.3 Real-time Updates with Firebase
```javascript
// src/firebase-news.js
import { getFirestore, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export function subscribeToBreakingNews(callback) {
  const db = getFirestore();
  const q = query(
    collection(db, 'breaking_news'),
    orderBy('published_at', 'desc'),
    limit(5)
  );

  return onSnapshot(q, (snapshot) => {
    const news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(news);
  });
}
```

---

### Phase 4: User Experience Enhancements

#### 4.1 Infinite Scroll / Pagination
```jsx
function NewsFeed({ darkMode }) {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(() => {
    if (loading) return;
    setLoading(true);
    fetchNews(page).then(newItems => {
      setNews(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
      setLoading(false);
    });
  }, [page, loading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries[0].isIntersecting && loadMore(),
      { threshold: 0.1 }
    );
    // Observe sentinel element
  }, [loadMore]);
}
```

#### 4.2 Search Functionality
```jsx
function NewsSearch({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="news-search brutal-input-group">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search news..."
        className="brutal-input"
      />
      <button type="submit" className="brutal-btn">SEARCH</button>
    </form>
  );
}
```

#### 4.3 Bookmark / Save Articles
```jsx
function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('news_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleBookmark = (article) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.id === article.id);
      const updated = exists
        ? prev.filter(b => b.id !== article.id)
        : [...prev, article];
      localStorage.setItem('news_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  return { bookmarks, toggleBookmark };
}
```

---

## Phase Breakdown

### Phase 1: MVP News Feed
**Priority:** HIGH | **Complexity:** Medium

| Task | Description | Dependencies |
|------|-------------|--------------|
| 1.1 | Add `feedparser` to Python dependencies | None |
| 1.2 | Extend `scraper.py` with RSS fetching | 1.1 |
| 1.3 | Add `news` array to `rates.json` schema | 1.2 |
| 1.4 | Create `NewsFeed.jsx` component | None |
| 1.5 | Create `NewsCard.jsx` component | 1.4 |
| 1.6 | Add news view mode to `App.jsx` | 1.4, 1.5 |
| 1.7 | Add news toggle to `Header.jsx` | 1.6 |
| 1.8 | Style news components (neubrutalism) | 1.4, 1.5 |
| 1.9 | Test RSS feed parsing | 1.2 |
| 1.10 | Update GitHub Actions workflow | 1.3 |

### Phase 2: Categories & Filtering
**Priority:** HIGH | **Complexity:** Low

| Task | Description |
|------|-------------|
| 2.1 | Implement category detection algorithm |
| 2.2 | Create `CategoryFilter.jsx` component |
| 2.3 | Add filter state to `App.jsx` |
| 2.4 | Style category badges |
| 2.5 | Add category icons |

### Phase 3: Multi-Source Integration
**Priority:** MEDIUM | **Complexity:** High

| Task | Description |
|------|-------------|
| 3.1 | Integrate WorldNewsAPI (API key setup) |
| 3.2 | Add CBU news scraper |
| 3.3 | Add IMF/World Bank press release scraper |
| 3.4 | Implement source deduplication |
| 3.5 | Add source reliability scoring |

### Phase 4: Real-time & UX
**Priority:** MEDIUM | **Complexity:** Medium

| Task | Description |
|------|-------------|
| 4.1 | Implement infinite scroll |
| 4.2 | Add pull-to-refresh on mobile |
| 4.3 | Implement search functionality |
| 4.4 | Add bookmarking feature |
| 4.5 | Add share functionality |

### Phase 5: Notifications & Alerts
**Priority:** LOW | **Complexity:** Medium

| Task | Description |
|------|-------------|
| 5.1 | Breaking news push notifications |
| 5.2 | Keyword alert subscriptions |
| 5.3 | Daily digest email (optional) |

---

## Data Structure Design

### News Item Schema
```typescript
interface NewsItem {
  id: string;                    // Unique identifier: "source-date-hash"
  title: string;                 // Article headline
  summary: string;               // 150-200 char excerpt
  content?: string;              // Full article (if available)
  source: string;                // Publisher name
  source_url: string;            // Original article URL
  source_logo?: string;          // Publisher logo URL
  category: NewsCategory;        // Categorization
  tags?: string[];               // Additional keywords
  published_at: string;          // ISO 8601 timestamp
  fetched_at: string;            // When we scraped it
  image_url?: string;            // Featured image
  is_breaking: boolean;          // Breaking news flag
  is_official: boolean;          // Official source (CBU, govt)
  relevance_score?: number;      // AI-generated relevance (0-1)
  sentiment?: 'positive' | 'negative' | 'neutral';
}

type NewsCategory =
  | 'economy'      // GDP, inflation, growth
  | 'banking'      // CBU, bank products, rates
  | 'markets'      // Currency, stocks, commodities
  | 'business'     // Corporate, investments
  | 'regulation'   // Laws, policies
  | 'international'; // Foreign investment, trade
```

### rates.json Extension
```json
{
  "last_updated": "2025-12-04 09:05",
  "usd": { ... },
  "eur": { ... },
  "news": {
    "last_fetched": "2025-12-04 09:00",
    "total_count": 45,
    "sources_status": {
      "gazeta": { "status": "ok", "last_success": "2025-12-04 09:00" },
      "daryo": { "status": "ok", "last_success": "2025-12-04 09:00" },
      "cbu": { "status": "ok", "last_success": "2025-12-04 09:00" }
    },
    "breaking": [],
    "items": [
      { ... },
      { ... }
    ]
  }
}
```

---

## UI/UX Design Specifications

### Desktop Layout (2-Column)
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Logo | USD EUR RUB | [Exchange] [Metals] [Savings] [NEWS] │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌────────────────────────────────────────┐│
│  │  SIDEBAR    │  │  NEWS FEED                             ││
│  │             │  │  ┌─────────────────────────────────────┤│
│  │  CBU Rate   │  │  │ [ALL] [ECONOMY] [BANKING] [MARKETS] ││
│  │  Calculator │  │  ├─────────────────────────────────────┤│
│  │  Quick Stats│  │  │ ┌──────────┐ ┌──────────┐          ││
│  │             │  │  │ │ NEWS     │ │ NEWS     │          ││
│  │             │  │  │ │ CARD 1   │ │ CARD 2   │          ││
│  │             │  │  │ │          │ │          │          ││
│  │             │  │  │ └──────────┘ └──────────┘          ││
│  │             │  │  │ ┌──────────┐ ┌──────────┐          ││
│  │             │  │  │ │ NEWS     │ │ NEWS     │          ││
│  │             │  │  │ │ CARD 3   │ │ CARD 4   │          ││
│  └─────────────┘  │  └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (Single Column)
```
┌─────────────────────┐
│  HEADER             │
├─────────────────────┤
│ [Categories scroll] │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │  NEWS CARD 1    │ │
│ │  Full width     │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │  NEWS CARD 2    │ │
│ └─────────────────┘ │
│        ...          │
└─────────────────────┘
```

### News Card Design (Neubrutalism)
```
┌─────────────────────────────────────────┐
│  [ECONOMY]  [GAZETA.UZ]      12h ago   │ ← Category & Source badges
├─────────────────────────────────────────┤
│                                         │
│  Uzbekistan GDP Grows 7.6%              │ ← Bold title
│  in First 9 Months of 2025              │
│                                         │
│  President Mirziyoyev outlines 2026     │ ← Summary excerpt
│  budget and growth targets during...    │
│                                         │
├─────────────────────────────────────────┤
│  [📖 READ MORE]        [🔖 SAVE]        │ ← Action buttons
└─────────────────────────────────────────┘
```

### Color Coding by Category
| Category | Light Mode | Dark Mode |
|----------|------------|-----------|
| Economy | `#CCFF00` (lime) | `rgba(204,255,0,0.2)` |
| Banking | `#00FFFF` (cyan) | `rgba(0,255,255,0.2)` |
| Markets | `#FF00FF` (magenta) | `rgba(255,0,255,0.2)` |
| Business | `#FF5200` (orange) | `rgba(255,82,0,0.2)` |
| Regulation | `#9D4EDD` (purple) | `rgba(157,78,221,0.2)` |

---

## API Integration Strategy

### Priority Order
1. **RSS Feeds** (Free, reliable, structured)
   - Gazeta.uz, Daryo.uz, UzDaily

2. **Web Scraping** (Free, requires maintenance)
   - CBU.uz press center
   - Review.uz economy section

3. **News APIs** (Paid, comprehensive)
   - WorldNewsAPI (backup/enrichment)
   - NewsData.io (historical data)

### Rate Limiting Strategy
```python
# Stagger requests to avoid overwhelming sources
import time
import random

def fetch_all_sources():
    results = []

    # RSS sources (fast, low impact)
    for rss_source in RSS_SOURCES:
        results.extend(fetch_rss(rss_source))
        time.sleep(random.uniform(0.5, 1.5))

    # Scraped sources (slower, be respectful)
    for scrape_source in SCRAPE_SOURCES:
        results.extend(scrape_news(scrape_source))
        time.sleep(random.uniform(2, 4))

    # API sources (rate limited by provider)
    if WORLDNEWS_API_KEY:
        results.extend(fetch_worldnews_api())

    return deduplicate(results)
```

### Caching Strategy
- **Full refresh:** Every 30 minutes (GitHub Actions)
- **Breaking news:** Real-time via Firebase (future)
- **Client cache:** 5 minutes (Service Worker)

---

## Timeline & Priorities

### Implementation Priority Matrix

| Phase | Priority | Impact | Effort | Recommended Order |
|-------|----------|--------|--------|-------------------|
| Phase 1: MVP | 🔴 Critical | High | Medium | 1st |
| Phase 2: Categories | 🟠 High | Medium | Low | 2nd |
| Phase 3: Multi-source | 🟡 Medium | High | High | 3rd |
| Phase 4: UX Features | 🟡 Medium | Medium | Medium | 4th |
| Phase 5: Notifications | 🟢 Low | Low | Medium | 5th |

### Recommended Implementation Order

1. **MVP News Feed** (Phase 1)
   - Basic RSS fetching from Gazeta.uz, Daryo.uz
   - Simple news card UI
   - View mode toggle

2. **Categorization** (Phase 2)
   - Category badges and filtering
   - Basic keyword-based categorization

3. **Source Expansion** (Phase 3)
   - Add CBU official news
   - Integrate WorldNewsAPI
   - Source reliability indicators

4. **Enhanced UX** (Phase 4)
   - Search functionality
   - Infinite scroll
   - Bookmarking

5. **Alerts** (Phase 5)
   - Push notifications for breaking news
   - Personalized alerts

---

## Dependencies & Requirements

### Python Dependencies (add to scraper)
```
feedparser>=6.0.0
python-dateutil>=2.8.0
```

### Environment Variables
```bash
# Optional - for WorldNewsAPI integration
WORLDNEWS_API_KEY=your_api_key_here

# Existing
IQAIR_API_KEY=...
POLYGON_API_KEY=...
```

### GitHub Actions Update
```yaml
# .github/workflows/update_rates.yml
- name: Install dependencies
  run: |
    pip install requests beautifulsoup4 feedparser python-dateutil

- name: Run scraper
  env:
    WORLDNEWS_API_KEY: ${{ secrets.WORLDNEWS_API_KEY }}
  run: python scripts/scraper.py
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| News freshness | < 30 min delay | Time between publish and display |
| Source coverage | 5+ sources | Unique sources in feed |
| Load time | < 2s | News section initial load |
| User engagement | > 30% CTR | Clicks on news cards |
| Uptime | 99.9% | Successful scraper runs |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| RSS feed format changes | Medium | Implement robust parsing with fallbacks |
| Source website blocking | High | Use polite scraping, rotating user agents |
| API rate limits | Medium | Implement caching, fallback to RSS |
| Content in Uzbek/Russian only | Medium | Focus on English sources, consider translation |
| Duplicate articles | Low | Implement title similarity matching |

---

## References & Resources

### Official Sources
- [Central Bank of Uzbekistan](https://cbu.uz/en/)
- [IMF - Uzbekistan](https://www.imf.org/en/countries/uzb)
- [World Bank - Uzbekistan](https://www.worldbank.org/en/country/uzbekistan/overview)
- [Asian Development Bank](https://www.adb.org/countries/uzbekistan/main)

### News Sources
- [Gazeta.uz](https://www.gazeta.uz/en/) - [RSS Feeds](https://www.gazeta.uz/en/feeds/)
- [Kun.uz](https://kun.uz/en/news/list)
- [Daryo.uz](https://daryo.uz/en/)
- [UzDaily.com](https://www.uzdaily.uz/en/)
- [Review.uz](https://review.uz/en)

### APIs
- [WorldNewsAPI - Uzbekistan](https://worldnewsapi.com/docs/news-sources/uzbekistan-news-api/)
- [NewsAPI.org](https://newsapi.org/)
- [NewsData.io](https://newsdata.io/)

### RSS Feed Directory
- [Top 20 Uzbekistan News RSS Feeds](https://rss.feedspot.com/uzbekistan_news_rss_feeds/)
- [Top 20 Uzbekistan News Websites](https://news.feedspot.com/uzbekistan_news_websites/)

---

*Document Version: 1.0*
*Created: December 4, 2025*
*Author: NeoUZS Development Team*
