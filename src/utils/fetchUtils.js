/**
 * Fetch utilities for getting exchange rate data
 */

/**
 * Refreshes the exchange rate data by fetching the latest rates.json
 * @returns {Promise<Object|null>} Full data object or null if fetch fails
 */
export async function refreshRates() {
  try {
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
