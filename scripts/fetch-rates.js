import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow overriding the URL via environment variable for flexibility
const RATES_URL = process.env.RATES_URL || 'https://raw.githubusercontent.com/brklyn498/Neouzsusd/rates-data/public/rates.json';
const TARGET_PATH = path.join(__dirname, '../public/rates.json');
const FETCH_TIMEOUT = 5000; // 5 seconds timeout

const fetchRates = () => {
  console.log(`Fetching rates from ${RATES_URL}...`);

  const req = https.get(RATES_URL, (res) => {
    if (res.statusCode === 200) {
      const file = fs.createWriteStream(TARGET_PATH);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Successfully fetched rates.json');
      });
    } else {
      console.warn(`Failed to fetch rates (Status: ${res.statusCode}).`);
      res.resume(); // Consume response to free memory
      handleFailure();
    }
  });

  req.on('error', (err) => {
    console.error('Error fetching rates:', err.message);
    handleFailure();
  });

  req.on('timeout', () => {
    req.destroy();
    console.warn('Fetch timed out.');
    handleFailure();
  });

  req.setTimeout(FETCH_TIMEOUT);
};

const handleFailure = () => {
  if (fs.existsSync(TARGET_PATH)) {
    console.log('Using existing local rates.json.');
  } else {
    console.warn('No local rates.json found. Creating a minimal fallback file to prevent crashes.');
    createFallback();
  }
};

const createFallback = () => {
  const fallbackData = {
    last_updated: new Date().toISOString().slice(0, 16).replace('T', ' '),
    usd: { cbu: 0, cbu_last_updated: "N/A", history: [], banks: [] },
    rub: { cbu: 0, cbu_last_updated: "N/A", history: [], banks: [] },
    eur: { cbu: 0, cbu_last_updated: "N/A", history: [], banks: [] },
    gbp: { cbu: 0, cbu_last_updated: "N/A", history: [], banks: [] },
    kzt: { cbu: 0, cbu_last_updated: "N/A", history: [], banks: [] },
    weather: { city: "Tashkent", aqi: 0, temp: 0, humidity: 0, icon: "50d", last_updated: "N/A" },
    savings: { last_updated: "N/A", data: [] },
    news: { last_updated: "N/A", items: [] },
    gold_bars: [],
    gold_history: { last_updated: "N/A", data: [] },
    silver_history: { last_updated: "N/A", data: [] },
    bitcoin_history: { last_updated: "N/A", data: [] }
  };

  try {
    fs.writeFileSync(TARGET_PATH, JSON.stringify(fallbackData, null, 2));
    console.log('Created minimal fallback rates.json');
  } catch (err) {
    console.error('Failed to create fallback file:', err);
  }
};

fetchRates();
