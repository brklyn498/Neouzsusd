/**
 * Fetch utilities for getting exchange rate data
 */

/**
 * Refreshes the exchange rate data by fetching the latest rates.json
 * @returns {Promise<Object|null>} Full data object or null if fetch fails
 */
export async function refreshRates() {
  try {
    // 1. Trigger the scraper via the local backend
    try {
      const triggerResponse = await fetch('/api/refresh', {
        method: 'POST',
      });

      if (!triggerResponse.ok) {
        console.warn(`Backend trigger failed: ${triggerResponse.status}. Proceeding to fetch existing file.`);
      } else {
        console.log('Backend scraper triggered successfully.');
      }
    } catch (err) {
      console.warn('Could not reach backend server. Is "node server.js" running?', err);
    }

    // 2. Fetch the (hopefully updated) rates.json
    // Add timestamp to prevent caching
    const response = await fetch(`./rates.json?t=${new Date().getTime()}`);

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
