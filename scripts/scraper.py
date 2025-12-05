import json
import requests
import random
import datetime
import os
import time
from bs4 import BeautifulSoup
from bank_mapping import get_bank_logo
import firebase_admin
from firebase_admin import credentials, messaging, firestore
import feedparser
from dateutil import parser as date_parser
import hashlib

OUTPUT_FILE = "public/rates.json"

# List of popular banks to prioritize
POPULAR_BANKS_NAMES = ["Kapitalbank", "Hamkorbank", "Ipak Yuli Bank", "O‘zbekiston Milliy banki", "O‘zsanoatqurilishbank"]

CURRENCY_CONFIG = {
    "USD": {
        "cbu_code": "USD",
        "bank_uz_url": "https://bank.uz/uz/currency/dollar-ssha",
        "fallback_rate": 12800.00,
        "mock_variance": (20, 80)
    },
    "RUB": {
        "cbu_code": "RUB",
        "bank_uz_url": "https://bank.uz/uz/currency/rossiyskiy-rubl",
        "fallback_rate": 150.00,
        "mock_variance": (2, 10)
    },
    "EUR": {
        "cbu_code": "EUR",
        "bank_uz_url": "https://bank.uz/uz/currency/evro",
        "fallback_rate": 13800.00,
        "mock_variance": (20, 80)
    },
    "KZT": {
        "cbu_code": "KZT",
        "bank_uz_url": "https://bank.uz/uz/currency/kzt",
        "fallback_rate": 23.00,
        "mock_variance": (1, 3)
    },
    "GBP": {
        "cbu_code": "GBP",
        "bank_uz_url": "https://bank.uz/uz/currency/funt-sterlingov",
        "fallback_rate": 16500.00,
        "mock_variance": (50, 200)
    }
}

def get_uzt_time():
    """Returns the current time in Uzbekistan (GMT+5)."""
    return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5)))

def fetch_url(url, retries=3, delay=2):
    """Fetches a URL with retries and a proper User-Agent."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
    }

    for i in range(retries):
        try:
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code == 200:
                return response
            elif response.status_code == 403:
                print(f"403 Forbidden at {url}. Retrying in {delay}s...")
                time.sleep(delay)
            else:
                print(f"Status {response.status_code} at {url}.")
        except requests.RequestException as e:
            print(f"Error fetching {url}: {e}")
        except Exception as e:
            print(f"Unexpected error fetching {url}: {e}")

        time.sleep(delay)

    return None

def fetch_cbu_rate(currency_code="USD", date_str=None):
    """
    Fetches the rate from CBU for a specific currency and date (YYYY-MM-DD) or current if None.
    Returns float or None.
    """
    if date_str:
        url = f"https://cbu.uz/en/arkhiv-kursov-valyut/json/all/{date_str}/"
    else:
        url = "https://cbu.uz/common/json/"

    response = fetch_url(url)
    if not response:
        return None

    try:
        data = response.json()
        for item in data:
            if item['Ccy'] == currency_code:
                return float(item['Rate'])
    except Exception as e:
        print(f"Error parsing CBU response for {currency_code}: {e}")
        return None

    return None

def fetch_cbu_history_full(currency_code="USD", days=30):
    """
    Fetches rates for the last N days.
    Only used if no history exists, to populate initial data.
    """
    history = []
    today = datetime.date.today()

    print(f"Fetching full {currency_code} history for last {days} days...")

    for i in range(days):
        date_obj = today - datetime.timedelta(days=i)
        date_str = date_obj.strftime("%Y-%m-%d")

        rate = fetch_cbu_rate(currency_code, date_str)

        if rate:
            history.append({
                "date": date_str,
                "rate": rate
            })

        # Add delay to avoid hitting rate limits (403)
        time.sleep(1)

    history.sort(key=lambda x: x['date'])
    return history

def update_history(existing_history, currency_code, today_rate, today_date_str):
    """
    Updates the history list with today's rate.
    Maintains max 30 days.
    """
    if not existing_history:
        return fetch_cbu_history_full(currency_code)

    # Copy to avoid mutation issues
    history = list(existing_history)

    # Check if today exists
    exists = False
    for item in history:
        if item['date'] == today_date_str:
            item['rate'] = today_rate # Update just in case
            exists = True
            break

    if not exists:
        history.append({
            "date": today_date_str,
            "rate": today_rate
        })

    # Sort and trim
    history.sort(key=lambda x: x['date'])
    # Keep last 30
    if len(history) > 30:
        history = history[-30:]

    return history

import re

def parse_rate(rate_str):
    """Cleans and converts rate string to int/float."""
    try:
        # Check for range format like "20dan - 21 %" or "22.52dan - 25 %"
        if "-" in rate_str:
             # We want the max value.
             matches = re.findall(r"[-+]?\d*\.\d+|\d+", rate_str.replace(",", "."))
             if matches:
                 values = [float(m) for m in matches]
                 return max(values)

        # Standard number (e.g. "12 800" or "24 %")
        # Replace comma with dot for decimals (e.g. "25,5" -> "25.5")
        # But handle thousands separators if any?
        # Usually bank.uz uses spaces for thousands.
        clean = rate_str.lower().replace("so'm", "").replace(" ", "").replace(",", ".").replace("%", "")
        return float(clean)
    except Exception:
        return None

def parse_bank_list(container):
    """
    Parses a container (Buy or Sell list) and returns a dict {bank_name: rate}.
    """
    banks = {}
    if not container:
        return banks

    rows = container.find_all(class_='bc-inner-block-left-texts')
    for row in rows:
        try:
            # Bank Name is in an <a> tag
            link = row.find('a')
            if not link:
                continue

            name = link.get_text(strip=True)

            # Rate is in a <span class="green-date"> or similar
            rate_span = row.find(class_='green-date')
            if rate_span:
                rate_val = parse_rate(rate_span.get_text(strip=True))
                if rate_val:
                    banks[name] = rate_val
        except Exception:
            continue

    return banks

def fetch_bank_uz_rates(currency_code, cbu_rate):
    """
    Scrapes bank.uz for specific currency rates.
    Returns list of bank objects.
    """
    config = CURRENCY_CONFIG.get(currency_code)
    if not config:
        return None

    url = config["bank_uz_url"]

    print(f"Scraping {url} for {currency_code}...")
    response = fetch_url(url)

    if not response:
        print(f"Failed to fetch {url}.")
        return None

    try:
        soup = BeautifulSoup(response.content, 'html.parser')

        left_containers = soup.find_all(class_='bc-inner-block-left')
        right_containers = soup.find_all(class_='bc-inner-blocks-right')

        target_buy_list = {}
        target_sell_list = {}
        found = False

        min_len = min(len(left_containers), len(right_containers))

        for i in range(min_len):
            buy_container = left_containers[i]
            sell_container = right_containers[i]

            temp_buy = parse_bank_list(buy_container)
            if not temp_buy:
                continue

            # Check average rate of first 3 items
            rates = list(temp_buy.values())[:3]
            if len(rates) == 0:
                continue
            avg = sum(rates) / len(rates)

            # Ref rate check
            ref_rate = cbu_rate if cbu_rate else config["fallback_rate"]

            # Tightened tolerance to 10% to prevent cross-currency scraping (e.g. USD table on EUR page)
            # Use wider tolerance for KZT due to lower absolute values and higher spread variance
            tolerance = 0.3 if currency_code == "KZT" else 0.1
            if (1 - tolerance) * ref_rate <= avg <= (1 + tolerance) * ref_rate:
                target_buy_list = temp_buy
                target_sell_list = parse_bank_list(sell_container)
                found = True
                break

        if not found:
            print(f"Could not identify {currency_code} container based on rate range.")
            return None

        all_bank_names = set(target_buy_list.keys()) | set(target_sell_list.keys())
        combined_banks = []

        for name in all_bank_names:
            buy = target_buy_list.get(name)
            sell = target_sell_list.get(name)

            if buy and sell:
                combined_banks.append({
                    "name": name,
                    "buy": buy,
                    "sell": sell,
                    "logo": get_bank_logo(name),
                    "is_mock": False,
                    "featured": False
                })

        # Filter Logic (Featured)
        popular_selected = []

        # Helper to find bank in combined_banks
        def find_bank(partial_name):
            for b in combined_banks:
                if partial_name.lower() in b['name'].lower():
                    return b
            return None

        target_popular = ["Kapitalbank", "Hamkorbank", "Ipak Yuli", "Milliy bank", "Sanoatqurilishbank"]

        for p in target_popular:
            match = find_bank(p)
            if match and match not in popular_selected:
                popular_selected.append(match)
                if len(popular_selected) >= 3:
                    break

        if not cbu_rate:
            cbu_rate = config["fallback_rate"]

        def calculate_deviation(bank):
            dev_buy = abs(bank['buy'] - cbu_rate)
            dev_sell = abs(bank['sell'] - cbu_rate)
            return max(dev_buy, dev_sell)

        sorted_by_dev = sorted(combined_banks, key=calculate_deviation, reverse=True)

        deviants_selected = []
        for b in sorted_by_dev:
            if b not in popular_selected:
                deviants_selected.append(b)
                if len(deviants_selected) >= 3:
                    break

        featured_list = popular_selected + deviants_selected
        for bank in featured_list:
            bank["featured"] = True

        return combined_banks

    except Exception as e:
        print(f"Error scraping bank.uz for {currency_code}: {e}")
        return None

def generate_mock_banks(currency_code, base_rate):
    """Generates mock data for commercial banks."""
    config = CURRENCY_CONFIG.get(currency_code)
    if not base_rate:
        base_rate = config["fallback_rate"]

    variance_min, variance_max = config["mock_variance"]

    banks = [
        {"name": "Kapitalbank"},
        {"name": "Hamkorbank"},
        {"name": "Ipak Yuli Bank"},
        {"name": "OFB"},
        {"name": "SQB"},
        {"name": "Asaka Bank"}
    ]

    results = []
    for i, bank in enumerate(banks):
        variance_buy = random.randint(variance_min, variance_max)
        variance_sell = random.randint(variance_min, variance_max)

        buy_rate = base_rate - variance_buy
        sell_rate = base_rate + variance_sell

        results.append({
            "name": bank["name"],
            "buy": int(buy_rate),
            "sell": int(sell_rate),
            "logo": get_bank_logo(bank["name"]),
            "is_mock": True,
            "featured": i < 5
        })

    return results

def process_currency(currency_code, existing_data):
    """Orchestrates scraping for a single currency."""
    print(f"--- Processing {currency_code} ---")

    current_uzt = get_uzt_time()
    today_str = current_uzt.strftime("%Y-%m-%d")
    current_hour = current_uzt.hour

    # 1. Determine CBU Rate Strategy
    cbu_rate = None
    cbu_last_updated = None
    history_data = []

    existing_currency_data = existing_data.get(currency_code.lower()) if existing_data else None

    should_fetch_cbu = True

    if existing_currency_data:
        last_updated = existing_currency_data.get('cbu_last_updated')
        # Check if already updated today
        if last_updated == today_str:
            print(f"CBU {currency_code} already updated today ({today_str}). Using cached rate.")
            should_fetch_cbu = False
            cbu_rate = existing_currency_data.get('cbu')
            cbu_last_updated = last_updated
            history_data = existing_currency_data.get('history', [])

        # Check 7 AM rule: If it's before 7 AM UZT, don't update yet (keep yesterday's)
        elif current_hour < 7:
            print(f"It is {current_hour}:00 UZT (before 7 AM). Keeping previous CBU rate.")
            should_fetch_cbu = False
            cbu_rate = existing_currency_data.get('cbu')
            cbu_last_updated = last_updated # Keep old date
            history_data = existing_currency_data.get('history', [])

    if should_fetch_cbu:
        print(f"Fetching fresh CBU rate for {currency_code}...")
        fetched_rate = fetch_cbu_rate(currency_code)

        if fetched_rate:
            cbu_rate = fetched_rate
            cbu_last_updated = today_str
            # Update history
            existing_history = existing_currency_data.get('history', []) if existing_currency_data else []
            history_data = update_history(existing_history, currency_code, cbu_rate, today_str)
        else:
            print(f"Failed to fetch CBU {currency_code}. Falling back to existing.")
            if existing_currency_data:
                cbu_rate = existing_currency_data.get('cbu')
                cbu_last_updated = existing_currency_data.get('cbu_last_updated')
                history_data = existing_currency_data.get('history', [])
            else:
                print("No existing data. Using hardcoded fallback.")
                cbu_rate = CURRENCY_CONFIG[currency_code]["fallback_rate"]
                cbu_last_updated = today_str
                history_data = [] # Or attempt full fetch? better to leave empty than spam errors

    print(f"CBU Rate for {currency_code}: {cbu_rate}")

    # 2. Always Scrape Bank.uz (Hourly)
    scraped_banks = fetch_bank_uz_rates(currency_code, cbu_rate)

    if scraped_banks and len(scraped_banks) > 0:
        print(f"Successfully scraped {len(scraped_banks)} banks for {currency_code}.")
        final_banks = scraped_banks
    else:
        print(f"Scraping failed for {currency_code}. Using Mock Data.")
        final_banks = generate_mock_banks(currency_code, cbu_rate)

    return {
        "cbu": cbu_rate,
        "cbu_last_updated": cbu_last_updated,
        "history": history_data,
        "banks": final_banks
    }

def fetch_iqair_data(existing_data):
    """
    Fetches air quality data from IQAir API for Tashkent.
    Uses rate limiting to avoid exceeding 500 calls/day.
    """
    print("--- Processing IQAir Weather Data ---")

    api_key = os.environ.get("IQAIR_API_KEY")
    
    # If not in env, try reading from .env file manually (for local dev)
    if not api_key:
        try:
            env_path = os.path.join(os.getcwd(), '.env')
            if os.path.exists(env_path):
                with open(env_path, 'r') as f:
                    for line in f:
                        if line.strip().startswith('IQAIR_API_KEY='):
                            api_key = line.split('=', 1)[1].strip().strip('"').strip("'")
                            print("Loaded IQAIR_API_KEY from .env file")
                            break
        except Exception as e:
            print(f"Error reading .env file: {e}")

    if not api_key:
        print("IQAIR_API_KEY not found in environment variables or .env file. Skipping.")
        # Return existing data if available
        return existing_data.get("weather") if existing_data else None

    # Check if we should fetch (limit: once per hour to be safe)
    if existing_data and existing_data.get("weather"):
        last_weather_update = existing_data["weather"].get("last_updated_ts")
        if last_weather_update:
            try:
                last_time = datetime.datetime.fromtimestamp(last_weather_update)
                now = datetime.datetime.now()
                # If less than 1 hour passed, use cached
                if (now - last_time).total_seconds() < 3600:
                    print("IQAir data is fresh (< 1 hour). Using cached.")
                    return existing_data["weather"]
            except Exception as e:
                print(f"Error parsing timestamp: {e}")

    # Tashkent endpoint: City=Tashkent, State=Toshkent Shahri, Country=Uzbekistan
    url = f"https://api.airvisual.com/v2/city?city=Tashkent&state=Toshkent%20Shahri&country=Uzbekistan&key={api_key}"

    print("Fetching fresh IQAir data...")
    response = fetch_url(url)

    if response and response.status_code == 200:
        try:
            data = response.json()
            if data.get("status") == "success":
                current = data["data"]["current"]
                weather = current["weather"]
                pollution = current["pollution"]

                result = {
                    "city": "Tashkent",
                    "aqi": pollution["aqius"],
                    "temp": weather["tp"],
                    "humidity": weather["hu"],
                    "icon": weather["ic"],
                    "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "last_updated_ts": datetime.datetime.now().timestamp()
                }
                print(f"IQAir Success: AQI {result['aqi']}")
                return result
            else:
                print(f"IQAir returned failure status: {data}")
        except Exception as e:
            print(f"Error parsing IQAir response: {e}")
    else:
        print("Failed to fetch IQAir data.")

    # Fallback to existing if fetch failed
    return existing_data.get("weather") if existing_data else None

# Bank name translations and standardizations
BANK_NAME_TRANSLATIONS = {
    "O'zsanoatqurilishbank": "Uzsanoat Bank",
    "Ozsanoatqurilishbank": "Uzsanoat Bank",
    "O'zbekiston Milliy Banki": "Nat'l Bank UZ",
    "Ozbekiston Milliy Banki": "Nat'l Bank UZ",
    "Xalq Banki": "Xalq Bank",
    "Orient Finans Bank": "Orient Finans",
    "Noshashuvchan": "Sustainable",
    "Konstruktor": "Constructor",
    "AVO omonati": "AVO Deposit",
    "Nostashuvchan omonati: kunlik foizlar": "Sustainable Deposit",
}

def translate_bank_name(bank_name):
    """
    Translates Uzbek bank names to English and shortens long names.
    Only translates bank names, not deposit product names.
    """
    # Direct translation mapping
    if bank_name in BANK_NAME_TRANSLATIONS:
        return BANK_NAME_TRANSLATIONS[bank_name]

    # Check for partial matches in translation dict
    for uz_name, en_name in BANK_NAME_TRANSLATIONS.items():
        if uz_name.lower() in bank_name.lower() or bank_name.lower() in uz_name.lower():
            return en_name

    # Pattern-based translations (case insensitive)
    name_lower = bank_name.lower()

    # Translate common Uzbek words
    # Handle various encodings of O'zbekiston
    if 'milliy' in name_lower or 'miliy' in name_lower:
        if any(word in name_lower for word in ['zbekiston', 'o\'zbekiston', 'ozbekiston', '\u2018zbekiston']):
            return "Nat'l Bank UZ"
        bank_name = bank_name.replace('Milliy Banki', 'Nat\'l Bank').replace('milliy banki', 'Nat\'l Bank')

    if 'sanoatqurilish' in name_lower or 'sanoatqurili' in name_lower:
        return 'Uzsanoat Bank'

    # If it's already a known English bank name, keep it
    english_banks = ['avo bank', 'uzum bank', 'turon bank', 'asakabank', 'ipak yuli',
                     'kapitalbank', 'hamkorbank', 'anor bank', 'tenge bank', 'nbu', 'aloqabank']

    for eng_bank in english_banks:
        if eng_bank in name_lower:
            return bank_name  # Keep original if already English

    # Shorten very long names (>16 chars)
    if len(bank_name) > 16:
        # Try to extract the core bank name
        if 'bank' in name_lower:
            # Take up to 'bank' + 'bank'
            parts = bank_name.split()
            for i, part in enumerate(parts):
                if 'bank' in part.lower():
                    core_name = ' '.join(parts[:i+1])
                    if len(core_name) <= 16:
                        return core_name
        # Fallback: truncate with ellipsis
        return bank_name[:13] + '...'

    return bank_name

def fetch_savings_rates(existing_data, force=False):
    """
    Scrapes savings deposits from bank.uz/uz/deposits/sumovye-vklady.
    Updates once a day (or if force=True).
    """
    print("--- Processing Savings Data ---")

    # Check 24h Cache
    if not force and existing_data and existing_data.get("savings"):
        last_ts = existing_data["savings"].get("last_updated_ts")
        if last_ts:
            last_time = datetime.datetime.fromtimestamp(last_ts)
            now = datetime.datetime.now()
            if (now - last_time).total_seconds() < 86400: # 24 hours
                print("Savings data is fresh (< 24 hours). Using cached.")
                return existing_data["savings"]

    url = "https://bank.uz/uz/deposits/sumovye-vklady"
    print(f"Scraping Savings from {url}...")

    response = fetch_url(url)
    if not response:
        print("Failed to fetch savings page.")
        return existing_data.get("savings") if existing_data else None

    try:
        soup = BeautifulSoup(response.content, 'html.parser')

        # We look for all containers that match the card structure
        # Using the class we found: 'table-card-offers-bottom'
        cards = soup.find_all(class_='table-card-offers-bottom')

        savings_list = []

        for card in cards:
            try:
                # 1. Bank Name and Deposit Name (Block 1)
                block1 = card.find(class_='table-card-offers-block1')
                if not block1:
                    continue

                bank_name_span = block1.find(class_='medium-text')
                bank_name_raw = bank_name_span.get_text(strip=True) if bank_name_span else "Unknown Bank"
                bank_name = translate_bank_name(bank_name_raw)  # Translate/shorten bank name

                # Find the text block first to avoid grabbing the image link
                text_block = block1.find(class_='table-card-offers-block1-text')
                if text_block:
                    deposit_link = text_block.find('a')
                    deposit_name = deposit_link.get_text(strip=True) if deposit_link else "Unknown Deposit"
                else:
                    deposit_name = "Unknown Deposit"

                # 2. Rate, Duration, Min Amount (Block All -> Blocks 2, 3, 4)
                # Sometimes the structure is slightly different, so be careful.
                # The inspection showed 'table-card-offers-blocks-all' contains blocks 2,3,4,5

                rate_val = 0.0
                duration_str = ""
                min_amount_str = ""
                is_online = False

                block_all = card.find(class_='table-card-offers-blocks-all')
                if block_all:
                    # Rate (Block 2)
                    block2 = block_all.find(class_='table-card-offers-block2')
                    if block2:
                         rate_text = block2.find(class_='medium-text').get_text(strip=True)
                         rate_val = parse_rate(rate_text) or 0.0

                    # Duration (Block 3)
                    block3 = block_all.find(class_='table-card-offers-block3')
                    if block3:
                        duration_str = block3.find(class_='medium-text').get_text(strip=True)

                    # Min Amount (Block 4)
                    block4 = block_all.find(class_='table-card-offers-block4')
                    if block4:
                        min_amount_str = block4.find(class_='medium-text').get_text(strip=True)

                    # Online Badge (Block 5)
                    block5 = block_all.find(class_='table-card-offers-block5')
                    if block5:
                        # Check for "Onlayn" text or icon class
                        if block5.find(string="Onlayn") or block5.find(class_='online_btn'):
                            is_online = True

                # If rate is 0, it might be a parsing error or missing data, skip or keep?
                # Let's keep valid looking entries
                if rate_val > 0:
                    savings_list.append({
                        "bank_name": bank_name,
                        "deposit_name": deposit_name,
                        "rate": rate_val,
                        "duration": duration_str,
                        "min_amount": min_amount_str,
                        "is_online": is_online,
                        "logo": get_bank_logo(bank_name)
                    })

            except Exception as inner_e:
                print(f"Error parsing a savings card: {inner_e}")
                continue

        # Sort by rate descending initially
        savings_list.sort(key=lambda x: x['rate'], reverse=True)

        print(f"Successfully scraped {len(savings_list)} savings offers.")

        return {
            "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "last_updated_ts": datetime.datetime.now().timestamp(),
            "data": savings_list
        }

    except Exception as e:
        print(f"Error scraping savings: {e}")
        return existing_data.get("savings") if existing_data else None

def fetch_news(existing_data, force=False):
    """
    Fetches financial news from RSS feeds.
    Updates every 30 minutes unless force=True.
    """
    print("--- Processing News Feed ---")

    # Check 30m Cache
    if not force and existing_data and existing_data.get("news"):
        last_ts = existing_data["news"].get("last_updated_ts")
        if last_ts:
            try:
                last_time = datetime.datetime.fromtimestamp(last_ts)
                now = datetime.datetime.now()
                if (now - last_time).total_seconds() < 1800: # 30 minutes
                    print("News data is fresh (< 30 minutes). Using cached.")
                    return existing_data["news"]
            except Exception as e:
                print(f"Error parsing timestamp: {e}")

    sources = [
        {"name": "Gazeta.uz", "rss": "https://www.gazeta.uz/en/feeds/news.xml", "default_cat": "general", "lang": "EN"},
        {"name": "Daryo.uz", "rss": "https://daryo.uz/en/feed/", "default_cat": "general", "lang": "EN"},
        {"name": "UzDaily", "rss": "https://uzdaily.uz/en/rss", "default_cat": "business", "lang": "EN"},
        {"name": "Spot.uz", "rss": "https://www.spot.uz/rss", "default_cat": "business", "lang": "RU"},
        {"name": "Spot.uz", "rss": "https://www.spot.uz/oz/rss/", "default_cat": "business", "lang": "UZ"},
    ]

    # Keyword mapping for categorization
    CATEGORIES = {
        "economy": ["gdp", "inflation", "cpi", "fiscal", "budget", "imf", "world bank", "adb", "growth", "tax", "reform", "debt"],
        "banking": ["cbu", "central bank", "deposit", "loan", "interest rate", "mortgage", "atm", "visa", "mastercard", "fintech"],
        "markets": ["stock", "exchange", "uzse", "ipo", "dividend", "commodity", "gold", "silver", "oil", "gas", "bitcoin", "crypto"],
        "business": ["startup", "investment", "profit", "revenue", "merger", "acquisition", "export", "import", "trade", "company"],
        "regulation": ["law", "decree", "president", "parliament", "cabinet", "policy", "rule", "license", "ban", "permit"]
    }

    def determine_category(title, summary, default):
        text = (title + " " + summary).lower()

        # Check against keywords
        for cat, keywords in CATEGORIES.items():
            for keyword in keywords:
                if keyword in text:
                    return cat.capitalize() # Return Capitalized version (e.g. "Economy")

        # If no match, return default (Capitalized)
        return default.capitalize()

    all_news = []

    for source in sources:
        try:
            print(f"Fetching RSS: {source['name']}")
            feed = feedparser.parse(source["rss"])

            for entry in feed.entries[:10]: # Limit per source
                # Generate stable ID
                id_str = f"{source['name']}-{entry.link}"
                item_id = hashlib.md5(id_str.encode()).hexdigest()

                # Parse date
                published_at = ""
                published_ts = 0
                if hasattr(entry, 'published'):
                    try:
                        dt = date_parser.parse(entry.published)
                        published_at = dt.isoformat()
                        published_ts = dt.timestamp()
                    except:
                        pass

                # Image extraction
                image_url = None
                if hasattr(entry, 'media_content'):
                     # Often media_content is a list of dicts
                     for media in entry.media_content:
                         if 'url' in media:
                             image_url = media['url']
                             break

                # Fallback for image in summary/content (Gazeta often puts it there)
                if not image_url and hasattr(entry, 'summary'):
                    soup = BeautifulSoup(entry.summary, 'html.parser')
                    img_tag = soup.find('img')
                    if img_tag and img_tag.get('src'):
                        image_url = img_tag['src']

                # Get full content from RSS (some feeds have content:encoded or full summary)
                full_content = ""
                if hasattr(entry, 'content') and entry.content:
                    # content:encoded field (often has full article)
                    full_content = BeautifulSoup(entry.content[0].get('value', ''), 'html.parser').get_text(strip=True)
                elif hasattr(entry, 'summary'):
                    full_content = BeautifulSoup(entry.summary, 'html.parser').get_text(strip=True)
                
                # Limit full content to reasonable size (2000 chars)
                if len(full_content) > 2000:
                    full_content = full_content[:2000] + "..."
                
                # Short summary for card preview (200 chars)
                summary_clean = full_content[:200] + "..." if len(full_content) > 200 else full_content

                # Determine category
                category = determine_category(entry.title, summary_clean, source["default_cat"])

                all_news.append({
                    "id": item_id,
                    "title": entry.title,
                    "summary": summary_clean,
                    "full_content": full_content,  # Full article text for modal view
                    "source": source["name"],
                    "source_url": entry.link,
                    "category": category,
                    "language": source["lang"],  # Language code: EN, RU, or UZ
                    "published_at": published_at,
                    "published_ts": published_ts,
                    "image_url": image_url,
                    "is_breaking": False
                })
        except Exception as e:
            print(f"Error fetching RSS for {source['name']}: {e}")

    # Fetch from WorldNewsAPI (Phase 3 source expansion)
    worldnews_items = fetch_worldnews_api()
    
    # Merge with deduplication (avoid duplicate titles)
    existing_titles = {item["title"].lower()[:50] for item in all_news}
    for wn_item in worldnews_items:
        title_key = wn_item["title"].lower()[:50]
        if title_key not in existing_titles:
            all_news.append(wn_item)
            existing_titles.add(title_key)

    # Sort by date descending
    all_news.sort(key=lambda x: x["published_ts"], reverse=True)

    # Keep top 40 (increased from 30 to accommodate WorldNews)
    final_news = all_news[:40]

    print(f"Successfully fetched {len(final_news)} news items (including WorldNewsAPI).")

    return {
        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "last_updated_ts": datetime.datetime.now().timestamp(),
        "items": final_news
    }

def load_env_var(var_name):
    """
    Loads an environment variable, falling back to .env file for local dev.
    """
    value = os.environ.get(var_name)
    
    if not value:
        try:
            env_path = os.path.join(os.getcwd(), '.env')
            if os.path.exists(env_path):
                with open(env_path, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith(f'{var_name}='):
                            value = line.split('=', 1)[1].strip().strip('"').strip("'")
                            print(f"Loaded {var_name} from .env file")
                            break
        except Exception as e:
            print(f"Error reading .env file for {var_name}: {e}")
    
    return value

def fetch_worldnews_api():
    """
    Fetches news from WorldNewsAPI for broader Uzbekistan coverage.
    Returns list of news items or empty list if API unavailable.
    Docs: https://worldnewsapi.com/docs/
    """
    print("--- Fetching WorldNewsAPI ---")
    
    api_key = load_env_var("WORLDNEWS_API_KEY")
    
    if not api_key:
        print("WORLDNEWS_API_KEY not found. Skipping WorldNewsAPI.")
        return []
    
    try:
        url = "https://api.worldnewsapi.com/search-news"
        params = {
            "api-key": api_key,
            "source-country": "uz",
            "language": "en",
            "number": 15,
            "sort": "publish-time",
            "sort-direction": "DESC"
        }
        
        response = requests.get(url, params=params, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            news_items = data.get("news", [])
            
            parsed_news = []
            for item in news_items:
                # Generate stable ID
                id_str = f"worldnews-{item.get('id', item.get('url', ''))}"
                item_id = hashlib.md5(id_str.encode()).hexdigest()
                
                # Parse date
                published_at = item.get("publish_date", "")
                published_ts = 0
                if published_at:
                    try:
                        dt = date_parser.parse(published_at)
                        published_ts = dt.timestamp()
                    except:
                        pass
                
                # Get summary (WorldNews provides 'text' as full content)
                full_text = item.get("text", "")[:2000]
                summary = full_text[:200] + "..." if len(full_text) > 200 else full_text
                
                # Determine category using existing logic
                CATEGORIES = {
                    "economy": ["gdp", "inflation", "cpi", "fiscal", "budget", "imf", "world bank", "adb", "growth", "tax", "reform", "debt"],
                    "banking": ["cbu", "central bank", "deposit", "loan", "interest rate", "mortgage", "fintech"],
                    "markets": ["stock", "exchange", "uzse", "ipo", "dividend", "commodity", "gold", "silver", "bitcoin"],
                    "business": ["startup", "investment", "profit", "revenue", "merger", "acquisition", "export", "import"],
                    "regulation": ["law", "decree", "president", "parliament", "cabinet", "policy", "license"]
                }
                
                text = (item.get("title", "") + " " + summary).lower()
                category = "General"
                for cat, keywords in CATEGORIES.items():
                    for keyword in keywords:
                        if keyword in text:
                            category = cat.capitalize()
                            break
                    if category != "General":
                        break
                
                parsed_news.append({
                    "id": item_id,
                    "title": item.get("title", ""),
                    "summary": summary,
                    "full_content": full_text,
                    "source": item.get("source_country", "WorldNews"),
                    "source_url": item.get("url", ""),
                    "category": category,
                    "language": "EN",  # WorldNewsAPI returns English content
                    "published_at": published_at,
                    "published_ts": published_ts,
                    "image_url": item.get("image"),
                    "is_breaking": False,
                    "is_worldnews_api": True  # Flag to identify API source
                })
            
            print(f"WorldNewsAPI: Fetched {len(parsed_news)} items")
            return parsed_news
        
        elif response.status_code == 401:
            print("WorldNewsAPI: Invalid API key (401)")
        elif response.status_code == 402:
            print("WorldNewsAPI: API limit exceeded (402)")
        else:
            print(f"WorldNewsAPI: Error {response.status_code}")
            
    except Exception as e:
        print(f"WorldNewsAPI Error: {e}")
    
    return []

import argparse

def fetch_gold_bar_prices():
    """
    Scrapes gold bar prices from bank.uz/uz/gold-bars.
    Returns list of gold bar objects with weight and price.
    """
    print("--- Processing Gold Bar Prices ---")
    
    url = "https://bank.uz/uz/gold-bars"
    print(f"Scraping gold bars from {url}...")
    
    response = fetch_url(url)
    if not response:
        print("Failed to fetch gold bars page.")
        return None
    
    try:
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the table with class 'table-table-bordered'
        table = soup.find('table', class_='table-table-bordered')
        if not table:
            print("Could not find gold bars table.")
            return None
        
        gold_bars = []
        rows = table.find_all('tr')
        
        # Skip header row (first row)
        for row in rows[1:]:
            try:
                cells = row.find_all('td')
                if len(cells) < 2:
                    continue
                
                # Extract weight (first column)
                weight_text = cells[0].get_text(strip=True)
                # Clean weight text (e.g., "5 грамм" -> "5g")
                weight_match = re.search(r'(\d+)\s*грамм', weight_text)
                if not weight_match:
                    continue
                weight = f"{weight_match.group(1)}g"
                
                # Extract price (second column)
                price_text = cells[1].get_text(strip=True)
                # Clean price (remove spaces, "сўм", handle negatives)
                price_clean = price_text.replace('сўм', '').replace(' ', '').replace('\xa0', '').replace('-', '').strip()
                
                try:
                    price = int(price_clean)
                    # Only add positive prices
                    if price > 0:
                        gold_bars.append({
                            "weight": weight,
                            "price": price
                        })
                except ValueError:
                    continue
                    
            except Exception as inner_e:
                print(f"Error parsing gold bar row: {inner_e}")
                continue
        
        # Sort gold bars by weight (asc) and then price (asc)
        # Parse weight to int: "5g" -> 5
        def get_weight_val(bar):
            w_str = bar['weight'].lower().replace('g', '')
            try:
                return int(w_str)
            except ValueError:
                return 0

        gold_bars.sort(key=lambda x: (get_weight_val(x), x['price']))

        print(f"Successfully scraped {len(gold_bars)} gold bar prices.")
        return gold_bars
        
    except Exception as e:
        print(f"Error scraping gold bars: {e}")
        return None

def fetch_gold_history(existing_data, force=False):
    """
    Fetches 30-day historical gold price data (USD per troy ounce).
    Uses Massive.com (Polygon.io) API.
    Updates once per day unless force=True.
    """
    print("--- Processing Gold Price History ---")
    
    # Check cache (update once per day)
    if not force and existing_data and existing_data.get("gold_history"):
        last_ts = existing_data["gold_history"].get("last_updated_ts")
        if last_ts:
            try:
                last_time = datetime.datetime.fromtimestamp(last_ts)
                now = datetime.datetime.now()
                # Check if same day, or if < 24h.
                # Since gold market closes on weekends, 24h cache is reasonable.
                if (now - last_time).total_seconds() < 86400:  # 24 hours
                    print("Gold history is fresh (< 24 hours). Using cached.")
                    return existing_data["gold_history"]
            except Exception as e:
                print(f"Error parsing timestamp: {e}")
    
    api_key = os.environ.get("POLYGON_API_KEY")

    # If not in env, try reading from .env file manually (for local dev)
    if not api_key:
        try:
            env_path = os.path.join(os.getcwd(), '.env')
            if os.path.exists(env_path):
                with open(env_path, 'r') as f:
                    for line in f:
                        if line.strip().startswith('POLYGON_API_KEY='):
                            api_key = line.split('=', 1)[1].strip().strip('"').strip("'")
                            print("Loaded POLYGON_API_KEY from .env file")
                            break
        except Exception as e:
            print(f"Error reading .env file: {e}")

    if not api_key:
        print("POLYGON_API_KEY not found. Using cached or skipping.")
        return existing_data.get("gold_history") if existing_data else None

    try:
        print("Fetching gold history from Massive.com (Polygon.io)...")
        
        # Calculate dates
        today = datetime.date.today()
        end_date_str = today.strftime("%Y-%m-%d")
        start_date = today - datetime.timedelta(days=35) # Fetch a few extra days to handle weekends/holidays and ensure we get 30 datapoints
        start_date_str = start_date.strftime("%Y-%m-%d")
        
        # URL for Aggregates (Bars)
        # C:XAUUSD is the ticker for Gold Spot US Dollar
        url = f"https://api.polygon.io/v2/aggs/ticker/C:XAUUSD/range/1/day/{start_date_str}/{end_date_str}?adjusted=true&sort=asc&limit=50"
        
        headers = {"Authorization": f"Bearer {api_key}"}
        response = requests.get(url, headers=headers, timeout=15)

        if response.status_code == 200:
            data = response.json()
            if data.get("status") != "OK" and data.get("status") != "DELAYED": # DELAYED is also fine usually
                # Sometimes status is OK even if empty results
                 pass

            results = data.get("results", [])
            if not results:
                 print("No results found in Polygon response.")
                 return existing_data.get("gold_history") if existing_data else None

            history_data = []
            
            for item in results:
                # 't' is timestamp in ms
                ts = item.get("t")
                if not ts:
                    continue

                date_str = datetime.datetime.fromtimestamp(ts / 1000, tz=datetime.timezone.utc).strftime("%Y-%m-%d")
                price = item.get("c") # Close price

                history_data.append({
                    "date": date_str,
                    "price_usd_per_oz": float(price),
                    # change_percent will be calculated below
                })
            
            # Sort by date just in case
            history_data.sort(key=lambda x: x['date'])
            
            # Calculate change percent
            for i in range(len(history_data)):
                if i > 0:
                    prev_price = history_data[i-1]["price_usd_per_oz"]
                    curr_price = history_data[i]["price_usd_per_oz"]
                    change_percent = ((curr_price - prev_price) / prev_price) * 100
                    history_data[i]["change_percent"] = round(change_percent, 2)
                else:
                    history_data[i]["change_percent"] = 0.0
            
            # Keep last 30 entries
            if len(history_data) > 30:
                history_data = history_data[-30:]
            
            print(f"Successfully fetched {len(history_data)} days of gold prices.")
            if history_data:
                print(f"Latest price: ${history_data[-1]['price_usd_per_oz']}/oz ({history_data[-1]['date']})")

            return {
                "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                "last_updated_ts": datetime.datetime.now().timestamp(),
                "data": history_data,
                "source": "Massive.com (Polygon.io)",
                "note": "Real market data"
            }

        else:
            print(f"Polygon API Error: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"Error fetching gold prices: {e}")
    
    # Fallback to cached data if everything fails
    print("Falling back to cached data...")
    return existing_data.get("gold_history") if existing_data else None

def fetch_silver_history(existing_data, force=False):
    """
    Fetches 30-day historical silver price data (USD per troy ounce).
    Uses Massive.com (Polygon.io) API.
    Updates once per day unless force=True.
    """
    print("--- Processing Silver Price History ---")

    # Check cache (update once per day)
    if not force and existing_data and existing_data.get("silver_history"):
        last_ts = existing_data["silver_history"].get("last_updated_ts")
        if last_ts:
            try:
                last_time = datetime.datetime.fromtimestamp(last_ts)
                now = datetime.datetime.now()
                # Check if same day, or if < 24h.
                if (now - last_time).total_seconds() < 86400:  # 24 hours
                    print("Silver history is fresh (< 24 hours). Using cached.")
                    return existing_data["silver_history"]
            except Exception as e:
                print(f"Error parsing timestamp: {e}")

    api_key = os.environ.get("POLYGON_API_KEY")

    # If not in env, try reading from .env file manually (for local dev)
    if not api_key:
        try:
            env_path = os.path.join(os.getcwd(), '.env')
            if os.path.exists(env_path):
                with open(env_path, 'r') as f:
                    for line in f:
                        if line.strip().startswith('POLYGON_API_KEY='):
                            api_key = line.split('=', 1)[1].strip().strip('"').strip("'")
                            # print("Loaded POLYGON_API_KEY from .env file (Silver)")
                            break
        except Exception as e:
            print(f"Error reading .env file: {e}")

    if not api_key:
        print("POLYGON_API_KEY not found. Using cached or skipping.")
        return existing_data.get("silver_history") if existing_data else None

    try:
        print("Fetching silver history from Massive.com (Polygon.io)...")

        # Calculate dates
        today = datetime.date.today()
        end_date_str = today.strftime("%Y-%m-%d")
        start_date = today - datetime.timedelta(days=35) # Fetch a few extra days to handle weekends/holidays and ensure we get 30 datapoints
        start_date_str = start_date.strftime("%Y-%m-%d")

        # URL for Aggregates (Bars)
        # C:XAGUSD is the ticker for Silver Spot US Dollar
        url = f"https://api.polygon.io/v2/aggs/ticker/C:XAGUSD/range/1/day/{start_date_str}/{end_date_str}?adjusted=true&sort=asc&limit=50"

        headers = {"Authorization": f"Bearer {api_key}"}
        response = requests.get(url, headers=headers, timeout=15)

        if response.status_code == 200:
            data = response.json()
            if data.get("status") != "OK" and data.get("status") != "DELAYED":
                 pass

            results = data.get("results", [])
            if not results:
                 print("No results found in Polygon response for Silver.")
                 return existing_data.get("silver_history") if existing_data else None

            history_data = []

            for item in results:
                # 't' is timestamp in ms
                ts = item.get("t")
                if not ts:
                    continue

                date_str = datetime.datetime.fromtimestamp(ts / 1000, tz=datetime.timezone.utc).strftime("%Y-%m-%d")
                price = item.get("c") # Close price

                history_data.append({
                    "date": date_str,
                    "price_usd_per_oz": float(price),
                    # change_percent will be calculated below
                })

            # Sort by date just in case
            history_data.sort(key=lambda x: x['date'])

            # Calculate change percent
            for i in range(len(history_data)):
                if i > 0:
                    prev_price = history_data[i-1]["price_usd_per_oz"]
                    curr_price = history_data[i]["price_usd_per_oz"]
                    change_percent = ((curr_price - prev_price) / prev_price) * 100
                    history_data[i]["change_percent"] = round(change_percent, 2)
                else:
                    history_data[i]["change_percent"] = 0.0

            # Keep last 30 entries
            if len(history_data) > 30:
                history_data = history_data[-30:]

            print(f"Successfully fetched {len(history_data)} days of silver prices.")
            if history_data:
                print(f"Latest price: ${history_data[-1]['price_usd_per_oz']}/oz ({history_data[-1]['date']})")

            return {
                "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                "last_updated_ts": datetime.datetime.now().timestamp(),
                "data": history_data,
                "source": "Massive.com (Polygon.io)",
                "note": "Real market data"
            }

        else:
            print(f"Polygon API Error for Silver: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"Error fetching silver prices: {e}")

    # Fallback to cached data if everything fails
    print("Falling back to cached silver data...")
    return existing_data.get("silver_history") if existing_data else None

def fetch_bitcoin_history(existing_data, force=False):
    """
    Fetches 30-day historical bitcoin price data (USD).
    Uses Massive.com (Polygon.io) API.
    Updates once per day unless force=True.
    """
    print("--- Processing Bitcoin Price History ---")

    # Check cache (update once per day)
    if not force and existing_data and existing_data.get("bitcoin_history"):
        last_ts = existing_data["bitcoin_history"].get("last_updated_ts")
        if last_ts:
            try:
                last_time = datetime.datetime.fromtimestamp(last_ts)
                now = datetime.datetime.now()
                # Check if same day, or if < 24h.
                if (now - last_time).total_seconds() < 86400:  # 24 hours
                    print("Bitcoin history is fresh (< 24 hours). Using cached.")
                    return existing_data["bitcoin_history"]
            except Exception as e:
                print(f"Error parsing timestamp: {e}")

    api_key = os.environ.get("POLYGON_API_KEY")

    # If not in env, try reading from .env file manually (for local dev)
    if not api_key:
        try:
            env_path = os.path.join(os.getcwd(), '.env')
            if os.path.exists(env_path):
                with open(env_path, 'r') as f:
                    for line in f:
                        if line.strip().startswith('POLYGON_API_KEY='):
                            api_key = line.split('=', 1)[1].strip().strip('"').strip("'")
                            # print("Loaded POLYGON_API_KEY from .env file (Bitcoin)")
                            break
        except Exception as e:
            print(f"Error reading .env file: {e}")

    if not api_key:
        print("POLYGON_API_KEY not found. Using cached or skipping.")
        return existing_data.get("bitcoin_history") if existing_data else None

    try:
        print("Fetching bitcoin history from Massive.com (Polygon.io)...")

        # Calculate dates
        today = datetime.date.today()
        end_date_str = today.strftime("%Y-%m-%d")
        start_date = today - datetime.timedelta(days=35) # Fetch a few extra days to handle weekends/holidays and ensure we get 30 datapoints
        start_date_str = start_date.strftime("%Y-%m-%d")

        # URL for Aggregates (Bars)
        # X:BTCUSD is the ticker for Bitcoin/USD
        url = f"https://api.polygon.io/v2/aggs/ticker/X:BTCUSD/range/1/day/{start_date_str}/{end_date_str}?adjusted=true&sort=asc&limit=50"

        headers = {"Authorization": f"Bearer {api_key}"}
        response = requests.get(url, headers=headers, timeout=15)

        if response.status_code == 200:
            data = response.json()
            if data.get("status") != "OK" and data.get("status") != "DELAYED":
                 pass

            results = data.get("results", [])
            if not results:
                 print("No results found in Polygon response for Bitcoin.")
                 return existing_data.get("bitcoin_history") if existing_data else None

            history_data = []

            for item in results:
                # 't' is timestamp in ms
                ts = item.get("t")
                if not ts:
                    continue

                date_str = datetime.datetime.fromtimestamp(ts / 1000, tz=datetime.timezone.utc).strftime("%Y-%m-%d")
                price = item.get("c") # Close price

                history_data.append({
                    "date": date_str,
                    "price_usd": float(price),
                    # change_percent will be calculated below
                })

            # Sort by date just in case
            history_data.sort(key=lambda x: x['date'])

            # Calculate change percent
            for i in range(len(history_data)):
                if i > 0:
                    prev_price = history_data[i-1]["price_usd"]
                    curr_price = history_data[i]["price_usd"]
                    change_percent = ((curr_price - prev_price) / prev_price) * 100
                    history_data[i]["change_percent"] = round(change_percent, 2)
                else:
                    history_data[i]["change_percent"] = 0.0

            # Keep last 30 entries
            if len(history_data) > 30:
                history_data = history_data[-30:]

            print(f"Successfully fetched {len(history_data)} days of bitcoin prices.")
            if history_data:
                print(f"Latest price: ${history_data[-1]['price_usd']} ({history_data[-1]['date']})")

            return {
                "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                "last_updated_ts": datetime.datetime.now().timestamp(),
                "data": history_data,
                "source": "Massive.com (Polygon.io)",
                "note": "Real market data"
            }

        else:
            print(f"Polygon API Error for Bitcoin: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"Error fetching bitcoin prices: {e}")

    # Fallback to cached data if everything fails
    print("Falling back to cached bitcoin data...")
    return existing_data.get("bitcoin_history") if existing_data else None

def send_notifications(new_data, old_data):
    """
    Checks for significant rate changes and sends notifications via Firebase.
    """
    print("--- Checking for Rate Changes ---")

    # Check if Firebase credentials are provided
    if not os.environ.get("FIREBASE_CREDENTIALS"):
        print("No FIREBASE_CREDENTIALS env var found. Skipping notifications.")
        return

    try:
        # Initialize Firebase App
        if not firebase_admin._apps:
            cred_dict = json.loads(os.environ.get("FIREBASE_CREDENTIALS"))
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)

        db = firestore.client()

        # Compare rates
        currencies = ['usd', 'eur', 'rub', 'kzt']
        thresholds = {'usd': 50, 'eur': 50, 'rub': 5, 'kzt': 2}

        alerts = []

        for curr in currencies:
            if not old_data or curr not in old_data or curr not in new_data:
                continue

            new_banks = new_data[curr].get('banks', [])
            old_banks = old_data[curr].get('banks', [])

            if not new_banks or not old_banks:
                continue

            # Calculate best rates
            new_best_buy = max([b['buy'] for b in new_banks])
            new_best_sell = min([b['sell'] for b in new_banks])

            old_best_buy = max([b['buy'] for b in old_banks])
            old_best_sell = min([b['sell'] for b in old_banks])

            threshold = thresholds.get(curr, 50)

            # Check Buy Rate Increase (Good for sellers)
            if new_best_buy > old_best_buy + threshold:
                alerts.append(f"{curr.upper()} Buy Rate UP: {old_best_buy} -> {new_best_buy} UZS")

            # Check Sell Rate Decrease (Good for buyers)
            if new_best_sell < old_best_sell - threshold:
                 alerts.append(f"{curr.upper()} Sell Rate DOWN: {old_best_sell} -> {new_best_sell} UZS")

        if alerts:
            message_body = "\n".join(alerts)
            print(f"Sending notification: {message_body}")

            # Fetch tokens from Firestore
            tokens_ref = db.collection(u'fcm_tokens')
            docs = tokens_ref.stream()

            tokens = [doc.to_dict()['token'] for doc in docs]

            if not tokens:
                print("No users subscribed to notifications.")
                return

            # Send multicast message (Batching in chunks of 500)
            batch_size = 500
            for i in range(0, len(tokens), batch_size):
                batch_tokens = tokens[i:i + batch_size]

                message = messaging.MulticastMessage(
                    notification=messaging.Notification(
                        title='NeoUZS Rate Alert 🚀',
                        body=message_body,
                    ),
                    tokens=batch_tokens,
                )

                response = messaging.send_multicast(message)
                print(f'Batch {i//batch_size + 1}: {response.success_count} messages sent successfully')

                # Cleanup invalid tokens
                if response.failure_count > 0:
                    responses = response.responses
                    for idx, resp in enumerate(responses):
                        if not resp.success:
                            # The order of responses corresponds to the order of the registration tokens.
                            # failed_token = batch_tokens[idx]
                            # print(f"Failure reason: {resp.exception}")
                            pass

                    # Optionally delete invalid tokens from Firestore here
                    # (Skipping for now to keep it simple, but recommended for production)

    except Exception as e:
        print(f"Error sending notifications: {e}")

def main():
    parser = argparse.ArgumentParser(description="Scrape exchange rates and weather data.")
    parser.add_argument("--force", action="store_true", help="Force update even if cached data exists.")
    args = parser.parse_args()

    # Load existing data to check timestamps
    existing_data = None
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r") as f:
                existing_data = json.load(f)
        except Exception as e:
            print(f"Error loading existing data: {e}")

    # If force is True, we can clear the relevant timestamps in existing_data 
    # OR just pass a flag to the fetch functions. 
    # For simplicity, let's modify fetch_iqair_data to accept the force flag.
    
    # We need to pass 'force' down to fetch_iqair_data. 
    # Since I cannot easily change the signature of fetch_iqair_data in this single block without 
    # replacing the whole file or multiple chunks, I will handle it by modifying the existing_data 
    # passed to it. If force is on, we pretend there is no weather data.
    
    weather_data_to_pass = existing_data
    if args.force and existing_data:
        print("Force flag detected. Ignoring cache.")
        # Create a copy to not mutate the original for other parts if needed
        weather_data_to_pass = existing_data.copy()
        if "weather" in weather_data_to_pass:
            del weather_data_to_pass["weather"]

    # Fetch Savings Data
    savings_data = fetch_savings_rates(existing_data, force=args.force)
    
    # Fetch News Data
    news_data = fetch_news(existing_data, force=args.force)

    # Fetch Gold Data
    gold_bars = fetch_gold_bar_prices()
    gold_history = fetch_gold_history(existing_data, force=args.force)
    silver_history = fetch_silver_history(existing_data, force=args.force)
    bitcoin_history = fetch_bitcoin_history(existing_data, force=args.force)

    output = {
        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "usd": process_currency("USD", existing_data),
        "rub": process_currency("RUB", existing_data),
        "eur": process_currency("EUR", existing_data),
        "kzt": process_currency("KZT", existing_data),
        "gbp": process_currency("GBP", existing_data),
        "weather": fetch_iqair_data(weather_data_to_pass),
        "savings": savings_data,
        "news": news_data,
        "gold_bars": gold_bars,
        "gold_history": gold_history,
        "silver_history": silver_history,
        "bitcoin_history": bitcoin_history
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Data saved to {OUTPUT_FILE}")

    # Send Notifications if changes found
    if existing_data:
        send_notifications(output, existing_data)

if __name__ == "__main__":
    main()
