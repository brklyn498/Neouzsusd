/**
 * Fetch utilities for getting live exchange rate data
 */

/**
 * Fetches the current rate for a specific currency from CBU API
 * @param {string} currencyCode - The currency code (e.g., 'USD', 'RUB')
 * @returns {Promise<number|null>} The current rate or null if fetch fails
 */
export async function fetchCBURate(currencyCode = 'USD') {
  const url = "https://cbu.uz/common/json/";
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`CBU API returned status ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Find the currency in the response
    const itemData = data.find(item => item.Ccy === currencyCode);
    
    if (itemData && itemData.Rate) {
      return parseFloat(itemData.Rate);
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching CBU rate for ${currencyCode}:`, error);
    return null;
  }
}

/**
 * Refreshes the exchange rate data for a specific currency
 * @param {string} currencyCode - The currency code (e.g., 'USD', 'RUB')
 * @returns {Promise<{cbu: number, timestamp: string}|null>} Updated rate data or null if fetch fails
 */
export async function refreshRates(currencyCode = 'USD') {
  try {
    const cbuRate = await fetchCBURate(currencyCode);
    
    if (!cbuRate) {
      throw new Error(`Failed to fetch CBU rate for ${currencyCode}`);
    }
    
    const now = new Date();
    const timestamp = now.toLocaleString('en-GB', { 
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
    
    return {
      cbu: cbuRate,
      timestamp: timestamp
    };
  } catch (error) {
    console.error('Error refreshing rates:', error);
    return null;
  }
}
