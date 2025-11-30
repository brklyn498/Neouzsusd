# UZS/USD Exchange Rate App (Neubrutalism)

A Neubrutalistic styled application to track UZS/USD exchange rates, built with React and Python.

## Architecture

This project uses a "Flat Data" approach:
1.  **Backend:** A Python script (`scripts/scraper.py`) fetches rates from the Central Bank of Uzbekistan (CBU) and generates mock data for commercial banks.
2.  **Automation:** A GitHub Action (`.github/workflows/update_rates.yml`) runs this script hourly and updates `public/rates.json`.
3.  **Frontend:** A React application (Vite) fetches the static `rates.json` file to display the data.

## Features

- **Neubrutalism Design:** High contrast, bold borders, hard shadows.
- **Real-time Data:** Fetches latest CBU rates.
- **Comparison:** View Buy/Sell rates for major banks.
- **Calculator:** Instant USD to UZS conversion.

## Deployment on GitHub Pages

This project is configured to deploy automatically using GitHub Actions.

### Steps to Enable:

1.  Push this code to a GitHub repository.
2.  Go to the repository **Settings**.
3.  Navigate to **Pages** (in the left sidebar).
4.  Under **Build and deployment** > **Source**, select **Deploy from a branch**.
5.  Under **Branch**, select `gh-pages` and folder `/ (root)`. (Note: The `gh-pages` branch will be created automatically after the first successful run of the "Deploy to GitHub Pages" action).
6.  Click **Save**.

Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

**Note:** The site updates automatically every hour when the scraper runs.

## Development

### Prerequisites
- Node.js
- Python 3

### Setup

1.  Install dependencies:
    ```bash
    npm install
    pip install requests
    ```

2.  Run the scraper (to seed data):
    ```bash
    python3 scripts/scraper.py
    ```

3.  Run the frontend:
    ```bash
    npm run dev
    ```

## License
MIT
