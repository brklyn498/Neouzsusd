# Roadmap: UZS/USD Exchange Rate App (Neubrutalism)

## Phase 1: Design System (Neubrutalism)

**Style Rules:**
- **Background:** Off-white (#F0F0F0).
- **Borders/Text:** Pure Black (#000000).
- **Accents:** Acid Green (#CCFF00), Hot Pink (#FF00FF), Cyan (#00FFFF), Safety Orange (#FF5200).
- **Typography:** Monospaced (JetBrains Mono, Space Mono) or Grotesque Sans-Serif.
- **UI Components:**
    - Borders: Thick stroke (2px - 4px). No rounded corners.
    - Shadows: Hard shadows (no blur), Offset(4, 4) in solid black.
    - Buttons: Rectangular, hard edges.

## Phase 2: Data Acquisition (The Backend)

**Stack:** Python + GitHub Actions.

1.  **Script (`scraper.py`):**
    - **CBU (Central Bank):** Fetch official rates from `https://cbu.uz/uz/arkhiv-kurs-valyut/json/`.
    - **Commercial Banks:** Mock data (due to scraping restrictions) or scrape where possible.
        - Kapitalbank
        - Hamkorbank
        - Ipak Yuli Bank
        - OFB
    - **Output:** Save to `rates.json`.

2.  **Automation:**
    - GitHub Action workflow to run `scraper.py` hourly.
    - Commits `rates.json` back to the repo.

## Phase 3: App Development (React)

**Stack:** React + Vite.

1.  **UI Construction:**
    - Custom "Brutalist Card" component.
    - `border: 3px solid black; box-shadow: 4px 4px 0px 0px black;`

2.  **Screen Architecture:**
    - **Header:** "UZS / USD" + CBU Rate (highlighted).
    - **List:** Cards for each bank showing Buy/Sell rates.
    - **Sorting:** Button to sort by Best Buy / Best Sell.

3.  **Features:**
    - **Dashboard:** List of banks + CBU.
    - **Calculator:** Input field to calculate UZS value instantly.
    - **Error Handling:** "NO INTERNET. DATA OLD." message.
