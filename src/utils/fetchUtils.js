/**
 * Fetch utilities for getting exchange rate data
 */

// Define the live data URL (Raw GitHub Content from rates-data branch)
// We prioritize the environment variable if available, otherwise fallback to the known repo
// This allows users to configure their own repo via VITE_GITHUB_REPO env var
const REPO_NAME = import.meta.env.VITE_GITHUB_REPO || 'brklyn498/Neouzsusd';
const LIVE_RATES_URL = `https://raw.githubusercontent.com/${REPO_NAME}/rates-data/public/rates.json`;

const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

/**
 * Refreshes the exchange rate data by fetching the latest rates.json
 * In dev mode: Local file first (fresher data from scraper), fallback to remote
 * In production: Remote first, fallback to bundled local
 * @returns {Promise<Object|null>} Full data object or null if fetch fails
 */
export async function refreshRates(scope = 'exchange') {
  try {
    // 1. Trigger the scraper via the local backend (dev mode only)
    if (isLocalDev) {
      try {
        const triggerResponse = await fetch('/api/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scope })
        });
        if (triggerResponse.ok) {
          console.log('Backend scraper triggered successfully.');
        }
      } catch (err) {
        // Ignore if backend is missing
      }
    }

    const timestamp = new Date().getTime();

    // DEV MODE: Prioritize local file (updated by scraper)
    if (isLocalDev) {
      try {
        const localResponse = await fetch(`./rates.json?t=${timestamp}`);
        if (localResponse.ok) {
          const data = await localResponse.json();
          console.log('Fetched data from LOCAL file (dev mode).');
          return data;
        }
      } catch (e) {
        console.warn('Failed to fetch local file, trying remote...', e);
      }
    }

    // 2. Fetch data from the LIVE source (production or fallback)
    try {
      const liveResponse = await fetch(`${LIVE_RATES_URL}?t=${timestamp}`);
      if (liveResponse.ok) {
        const data = await liveResponse.json();
        console.log('Fetched fresh data from live branch.');
        return data;
      }
    } catch (e) {
      console.warn('Failed to fetch from live URL, falling back to local.', e);
    }

    // 3. Final fallback to local file (bundled with build)
    const response = await fetch(`./rates.json?t=${timestamp}`);

    if (!response.ok) {
      console.error(`Fetch returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error refreshing rates:', error);
    return null;
  }
}

/**
 * Helper to fetch initial data with the same logic (Live -> Local)
 */
export async function fetchInitialData() {
  return refreshRates();
}
