/**
 * Share and Export Utilities for NeoUZS
 */

/**
 * Share current rates to Telegram
 * Opens Telegram's share dialog with formatted rate message
 */
export function shareToTelegram(currency, cbuRate, bestBuy, bestSell, lastUpdated) {
    const currencyEmoji = {
        'USD': '🇺🇸',
        'EUR': '🇪🇺',
        'RUB': '🇷🇺',
        'KZT': '🇰🇿',
        'GBP': '🇬🇧'
    };

    const emoji = currencyEmoji[currency] || '💱';

    const message = `${emoji} ${currency}/UZS Exchange Rates

📊 CBU Official: ${cbuRate?.toLocaleString() || 'N/A'} UZS

🏦 Best Rates Today:
• Best BUY: ${bestBuy?.toLocaleString() || 'N/A'} UZS
• Best SELL: ${bestSell?.toLocaleString() || 'N/A'} UZS
• Spread: ${bestBuy && bestSell ? (bestSell - bestBuy).toLocaleString() : 'N/A'} UZS

⏰ Updated: ${lastUpdated || new Date().toLocaleString('en-GB')}

📱 Track live rates: brklyn498.github.io/Neouzsusd`;

    // URL encode the message
    const encodedMessage = encodeURIComponent(message);

    // Open Telegram share URL
    window.open(`https://t.me/share/url?url=https://brklyn498.github.io/Neouzsusd&text=${encodedMessage}`, '_blank');
}

/**
 * Export rate history to CSV file
 * Downloads a formatted CSV with date and rate columns
 */
export function exportHistoryToCSV(history, currency) {
    if (!history || history.length === 0) {
        alert('No history data available to export.');
        return;
    }

    // Create CSV content
    const headers = ['Date', `${currency}/UZS Rate`];
    const rows = history.map(item => [item.date, item.rate]);

    // Add statistics row
    const rates = history.map(h => h.rate);
    const maxRate = Math.max(...rates);
    const minRate = Math.min(...rates);
    const avgRate = (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(2);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
        '', // Empty row
        '# Statistics',
        `Max Rate,${maxRate}`,
        `Min Rate,${minRate}`,
        `Average,${avgRate}`,
        `Period,"${history[0]?.date} to ${history[history.length - 1]?.date}"`,
        `Generated,"${new Date().toISOString()}"`
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `neouzs_${currency}_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Copy rate summary to clipboard
 */
export async function copyRatesToClipboard(currency, cbuRate, bestBuy, bestSell) {
    const text = `${currency}/UZS: CBU ${cbuRate?.toLocaleString()} | Buy ${bestBuy?.toLocaleString()} | Sell ${bestSell?.toLocaleString()}`;

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}
