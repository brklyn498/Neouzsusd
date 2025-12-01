/**
 * Fetch utilities for getting live exchange rate data
 */

/**
 * Fetches the current USD rate from CBU API
 * @returns {Promise<number|null>} The current USD rate or null if fetch fails
 */
export async function fetchCBURate() {
  const url = "https://cbu.uz/common/json/";
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`CBU API returned status ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Find USD in the response
    const usdData = data.find(item => item.Ccy === 'USD');
    
    if (usdData && usdData.Rate) {
      return parseFloat(usdData.Rate);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching CBU rate:', error);
    return null;
  }
}

/**
 * Refreshes the exchange rate data
 * @returns {Promise<{cbu: number, timestamp: string}|null>} Updated rate data or null if fetch fails
 */
export async function refreshRates() {
  try {
    const cbuRate = await fetchCBURate();
    
    if (!cbuRate) {
      throw new Error('Failed to fetch CBU rate');
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
