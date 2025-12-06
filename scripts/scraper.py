import json
import asyncio
import aiohttp
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
import argparse
import re
from functools import partial

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

SOURCE_RELIABILITY = {
    "CBU": {"tier": "official", "score": 1.0, "label": "OFFICIAL"},
    "IMF": {"tier": "official", "score": 1.0, "label": "OFFICIAL"},
    "World Bank": {"tier": "official", "score": 1.0, "label": "OFFICIAL"},
    "Gazeta.uz": {"tier": "verified", "score": 0.8, "label": "VERIFIED"},
    "Kapital.uz": {"tier": "verified", "score": 0.8, "label": "VERIFIED"},
    "UzDaily": {"tier": "verified", "score": 0.8, "label": "VERIFIED"},
    "Spot.uz": {"tier": "verified", "score": 0.8, "label": "VERIFIED"},
    "WorldNews": {"tier": "aggregator", "score": 0.3, "label": "AGGREGATOR"},
}

def get_reliability(source_name):
    return SOURCE_RELIABILITY.get(source_name, {"tier": "standard", "score": 0.5, "label": None})

def get_uzt_time():
    return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5)))

async def async_fetch_url(session, url, retries=3, delay=2, use_proxy=False):
    """Asynchronously fetches a URL with retries."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9,uz;q=0.8,ru;q=0.7",
        "Referer": "https://www.google.com/"
    }
    for i in range(retries):
        try:
            # Increased timeout to 30s and disabled SSL verification to avoid handshake errors
            async with session.get(url, headers=headers, timeout=30, ssl=False) as response:
                if response.status == 200:
                    return await response.read()
                elif response.status == 403:
                    print(f"403 Forbidden at {url}. Retrying in {delay}s...")
                    await asyncio.sleep(delay)
                else:
                    print(f"Status {response.status} at {url}.")
        except Exception as e:
            print(f"Error fetching {url}: {e}")
        await asyncio.sleep(delay)
    return None

async def async_fetch_cbu_rate(session, currency_code="USD", date_str=None):
    if date_str:
        url = f"https://cbu.uz/en/arkhiv-kursov-valyut/json/all/{date_str}/"
    else:
        url = "https://cbu.uz/common/json/"

    content = await async_fetch_url(session, url)
    if not content:
        return None

    try:
        data = json.loads(content)
        for item in data:
            if item['Ccy'] == currency_code:
                return float(item['Rate'])
    except Exception as e:
        print(f"Error parsing CBU response for {currency_code}: {e}")
        return None
    return None

async def async_fetch_cbu_history_full(session, currency_code="USD", days=30):
    history = []
    today = datetime.date.today()
    print(f"Fetching full {currency_code} history for last {days} days...")
    for i in range(days):
        date_obj = today - datetime.timedelta(days=i)
        date_str = date_obj.strftime("%Y-%m-%d")
        rate = await async_fetch_cbu_rate(session, currency_code, date_str)
        if rate:
            history.append({"date": date_str, "rate": rate})
        await asyncio.sleep(0.1)
    history.sort(key=lambda x: x['date'])
    return history

async def async_update_history(session, existing_history, currency_code, today_rate, today_date_str):
    if not existing_history:
        return await async_fetch_cbu_history_full(session, currency_code)
    history = list(existing_history)
    exists = False
    for item in history:
        if item['date'] == today_date_str:
            item['rate'] = today_rate
            exists = True
            break
    if not exists:
        history.append({"date": today_date_str, "rate": today_rate})
    history.sort(key=lambda x: x['date'])
    if len(history) > 30:
        history = history[-30:]
    return history

def parse_rate(rate_str):
    try:
        if "-" in rate_str:
             matches = re.findall(r"[-+]?\d*\.\d+|\d+", rate_str.replace(",", "."))
             if matches:
                 values = [float(m) for m in matches]
                 return max(values)
        clean = rate_str.lower().replace("so'm", "").replace(" ", "").replace(",", ".").replace("%", "")
        return float(clean)
    except Exception:
        return None

def parse_bank_list(container):
    banks = {}
    if not container:
        return banks
    rows = container.find_all(class_='bc-inner-block-left-texts')
    for row in rows:
        try:
            link = row.find('a')
            if not link:
                continue
            name = link.get_text(strip=True)
            rate_span = row.find(class_='green-date')
            if rate_span:
                rate_val = parse_rate(rate_span.get_text(strip=True))
                if rate_val:
                    banks[name] = rate_val
        except Exception:
            continue
    return banks

def parse_bank_uz_content(content, currency_code, cbu_rate, config):
    try:
        soup = BeautifulSoup(content, 'html.parser')
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
            if not temp_buy: continue

            rates = list(temp_buy.values())[:3]
            if len(rates) == 0: continue
            avg = sum(rates) / len(rates)
            ref_rate = cbu_rate if cbu_rate else config["fallback_rate"]
            tolerance = 0.3 if currency_code == "KZT" else 0.1
            if (1 - tolerance) * ref_rate <= avg <= (1 + tolerance) * ref_rate:
                target_buy_list = temp_buy
                target_sell_list = parse_bank_list(sell_container)
                found = True
                break

        if not found:
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

        popular_selected = []
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
        print(f"Error parsing bank.uz for {currency_code}: {e}")
        return None

async def async_fetch_bank_uz_rates(session, currency_code, cbu_rate):
    config = CURRENCY_CONFIG.get(currency_code)
    if not config: return None
    url = config["bank_uz_url"]
    print(f"Scraping {url} for {currency_code}...")

    content = await async_fetch_url(session, url)
    if not content:
        print(f"Failed to fetch {url}.")
        return None

    # Offload parsing to thread pool
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        None, partial(parse_bank_uz_content, content, currency_code, cbu_rate, config)
    )

def generate_mock_banks(currency_code, base_rate):
    config = CURRENCY_CONFIG.get(currency_code)
    if not base_rate:
        base_rate = config["fallback_rate"]
    variance_min, variance_max = config["mock_variance"]
    banks = [
        {"name": "Kapitalbank"}, {"name": "Hamkorbank"}, {"name": "Ipak Yuli Bank"},
        {"name": "OFB"}, {"name": "SQB"}, {"name": "Asaka Bank"}
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

async def async_process_currency(session, currency_code, existing_data):
    print(f"--- Processing {currency_code} ---")
    current_uzt = get_uzt_time()
    today_str = current_uzt.strftime("%Y-%m-%d")
    current_hour = current_uzt.hour

    cbu_rate = None
    cbu_last_updated = None
    history_data = []

    existing_currency_data = existing_data.get(currency_code.lower()) if existing_data else None
    should_fetch_cbu = True

    if existing_currency_data:
        last_updated = existing_currency_data.get('cbu_last_updated')
        if last_updated == today_str:
            should_fetch_cbu = False
            cbu_rate = existing_currency_data.get('cbu')
            cbu_last_updated = last_updated
            history_data = existing_currency_data.get('history', [])
        elif current_hour < 7:
            should_fetch_cbu = False
            cbu_rate = existing_currency_data.get('cbu')
            cbu_last_updated = last_updated
            history_data = existing_currency_data.get('history', [])

    if should_fetch_cbu:
        fetched_rate = await async_fetch_cbu_rate(session, currency_code)
        if fetched_rate:
            cbu_rate = fetched_rate
            cbu_last_updated = today_str
            existing_history = existing_currency_data.get('history', []) if existing_currency_data else []
            history_data = await async_update_history(session, existing_history, currency_code, cbu_rate, today_str)
        else:
            if existing_currency_data:
                cbu_rate = existing_currency_data.get('cbu')
                cbu_last_updated = existing_currency_data.get('cbu_last_updated')
                history_data = existing_currency_data.get('history', [])
            else:
                cbu_rate = CURRENCY_CONFIG[currency_code]["fallback_rate"]
                cbu_last_updated = today_str
                history_data = []

    print(f"CBU Rate for {currency_code}: {cbu_rate}")

    scraped_banks = await async_fetch_bank_uz_rates(session, currency_code, cbu_rate)
    if scraped_banks and len(scraped_banks) > 0:
        final_banks = scraped_banks
    else:
        final_banks = generate_mock_banks(currency_code, cbu_rate)

    return {
        "cbu": cbu_rate,
        "cbu_last_updated": cbu_last_updated,
        "history": history_data,
        "banks": final_banks
    }

async def async_fetch_iqair_data(session, existing_data):
    print("--- Processing IQAir Weather Data ---")
    api_key = os.environ.get("IQAIR_API_KEY")
    if not api_key:
        try:
            env_path = os.path.join(os.getcwd(), '.env')
            if os.path.exists(env_path):
                with open(env_path, 'r') as f:
                    for line in f:
                        if line.strip().startswith('IQAIR_API_KEY='):
                            api_key = line.split('=', 1)[1].strip().strip('"').strip("'")
                            break
        except Exception:
            pass

    if not api_key:
        return existing_data.get("weather") if existing_data else None

    if existing_data and existing_data.get("weather"):
        last_weather_update = existing_data["weather"].get("last_updated_ts")
        if last_weather_update:
             try:
                last_time = datetime.datetime.fromtimestamp(last_weather_update)
                now = datetime.datetime.now()
                if (now - last_time).total_seconds() < 3600:
                    return existing_data["weather"]
             except Exception:
                pass

    url = f"https://api.airvisual.com/v2/city?city=Tashkent&state=Toshkent%20Shahri&country=Uzbekistan&key={api_key}"
    content = await async_fetch_url(session, url)

    if content:
        try:
            data = json.loads(content)
            if data.get("status") == "success":
                current = data["data"]["current"]
                weather = current["weather"]
                pollution = current["pollution"]
                return {
                    "city": "Tashkent",
                    "aqi": pollution["aqius"],
                    "temp": weather["tp"],
                    "humidity": weather["hu"],
                    "icon": weather["ic"],
                    "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "last_updated_ts": datetime.datetime.now().timestamp()
                }
        except Exception as e:
            print(f"Error parsing IQAir response: {e}")

    return existing_data.get("weather") if existing_data else None

# Bank name translations (same as before)
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
    if bank_name in BANK_NAME_TRANSLATIONS:
        return BANK_NAME_TRANSLATIONS[bank_name]
    for uz_name, en_name in BANK_NAME_TRANSLATIONS.items():
        if uz_name.lower() in bank_name.lower() or bank_name.lower() in uz_name.lower():
            return en_name
    name_lower = bank_name.lower()
    if 'milliy' in name_lower or 'miliy' in name_lower:
        if any(word in name_lower for word in ['zbekiston', 'o\'zbekiston', 'ozbekiston', '\u2018zbekiston']):
            return "Nat'l Bank UZ"
        bank_name = bank_name.replace('Milliy Banki', 'Nat\'l Bank').replace('milliy banki', 'Nat\'l Bank')
    if 'sanoatqurilish' in name_lower or 'sanoatqurili' in name_lower:
        return 'Uzsanoat Bank'
    english_banks = ['avo bank', 'uzum bank', 'turon bank', 'asakabank', 'ipak yuli',
                     'kapitalbank', 'hamkorbank', 'anor bank', 'tenge bank', 'nbu', 'aloqabank']
    for eng_bank in english_banks:
        if eng_bank in name_lower:
            return bank_name
    if len(bank_name) > 16:
        if 'bank' in name_lower:
            parts = bank_name.split()
            for i, part in enumerate(parts):
                if 'bank' in part.lower():
                    core_name = ' '.join(parts[:i+1])
                    if len(core_name) <= 16:
                        return core_name
        return bank_name[:13] + '...'
    return bank_name

def parse_savings_card(card):
    try:
        block1 = card.find(class_='table-card-offers-block1')
        if not block1: return None
        bank_name_span = block1.find(class_='medium-text')
        bank_name_raw = bank_name_span.get_text(strip=True) if bank_name_span else "Unknown Bank"
        bank_name = translate_bank_name(bank_name_raw)
        text_block = block1.find(class_='table-card-offers-block1-text')
        deposit_name = text_block.find('a').get_text(strip=True) if text_block and text_block.find('a') else "Unknown Deposit"

        rate_val = 0.0
        duration_str = ""
        min_amount_str = ""
        is_online = False
        block_all = card.find(class_='table-card-offers-blocks-all')
        if block_all:
            block2 = block_all.find(class_='table-card-offers-block2')
            if block2:
                    rate_val = parse_rate(block2.find(class_='medium-text').get_text(strip=True)) or 0.0
            block3 = block_all.find(class_='table-card-offers-block3')
            if block3:
                duration_str = block3.find(class_='medium-text').get_text(strip=True)
            block4 = block_all.find(class_='table-card-offers-block4')
            if block4:
                min_amount_str = block4.find(class_='medium-text').get_text(strip=True)
            block5 = block_all.find(class_='table-card-offers-block5')
            if block5:
                if block5.find(string="Onlayn") or block5.find(class_='online_btn'):
                    is_online = True

        if rate_val > 0:
            return {
                "bank_name": bank_name,
                "deposit_name": deposit_name,
                "rate": rate_val,
                "duration": duration_str,
                "min_amount": min_amount_str,
                "is_online": is_online,
                "logo": get_bank_logo(bank_name)
            }
    except Exception: pass
    return None

def parse_savings_html(content):
    soup = BeautifulSoup(content, 'html.parser')
    cards = soup.find_all(class_='table-card-offers-bottom')
    results = []
    for card in cards:
        res = parse_savings_card(card)
        if res: results.append(res)
    return results

async def async_fetch_savings_rates(session, existing_data, force=False):
    print("--- Processing Savings Data ---")
    if not force and existing_data and existing_data.get("savings"):
        last_ts = existing_data["savings"].get("last_updated_ts")
        if last_ts:
            last_time = datetime.datetime.fromtimestamp(last_ts)
            now = datetime.datetime.now()
            if (now - last_time).total_seconds() < 86400:
                return existing_data["savings"]

    url = "https://bank.uz/uz/deposits/sumovye-vklady"
    content = await async_fetch_url(session, url)
    if not content:
        # Fallback: if existing data exists, return it.
        # If not, return an empty structure so we don't end up with null in rates.json
        if existing_data and existing_data.get("savings"):
            return existing_data.get("savings")
        return {
            "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "last_updated_ts": datetime.datetime.now().timestamp(),
            "data": []
        }

    loop = asyncio.get_running_loop()
    savings_list = await loop.run_in_executor(None, parse_savings_html, content)
    savings_list.sort(key=lambda x: x['rate'], reverse=True)

    return {
        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "last_updated_ts": datetime.datetime.now().timestamp(),
        "data": savings_list
    }

def parse_usd_savings_html(content):
    soup = BeautifulSoup(content, 'html.parser')
    cards = soup.find_all(class_='table-card-offers-bottom')
    results = []
    for card in cards:
        try:
            block1 = card.find(class_='table-card-offers-block1')
            if not block1: continue
            bank_name = translate_bank_name(block1.find(class_='medium-text').get_text(strip=True))
            deposit_name = block1.find(class_='table-card-offers-block1-text').find('a').get_text(strip=True)

            rate_val = 0.0
            duration_str = ""
            min_amount_str = ""
            is_online = False
            currency = "USD"

            block_all = card.find(class_='table-card-offers-blocks-all')
            if block_all:
                rate_val = parse_rate(block_all.find(class_='table-card-offers-block2').find(class_='medium-text').get_text(strip=True)) or 0.0
                duration_str = block_all.find(class_='table-card-offers-block3').find(class_='medium-text').get_text(strip=True)
                min_amount_str = block_all.find(class_='table-card-offers-block4').find(class_='medium-text').get_text(strip=True)
                if '€' in min_amount_str or 'EUR' in min_amount_str.upper() or 'evro' in min_amount_str.lower(): currency = "EUR"
                if block_all.find(class_='table-card-offers-block5').find(string="Onlayn"): is_online = True

            if 'evro' in deposit_name.lower() or 'eur' in deposit_name.lower(): currency = "EUR"
            elif 'usd' in deposit_name.lower() or 'dollar' in deposit_name.lower(): currency = "USD"

            if rate_val > 0:
                results.append({
                    "bank_name": bank_name,
                    "deposit_name": deposit_name,
                    "rate": rate_val,
                    "duration": duration_str,
                    "min_amount": min_amount_str,
                    "is_online": is_online,
                    "currency": currency,
                    "logo": get_bank_logo(bank_name)
                })
        except Exception: continue
    return results

async def async_fetch_usd_savings_rates(session, existing_data, force=False):
    print("--- Processing USD Savings Data ---")
    if not force and existing_data and existing_data.get("savings_usd"):
        last_ts = existing_data["savings_usd"].get("last_updated_ts")
        if last_ts:
            last_time = datetime.datetime.fromtimestamp(last_ts)
            now = datetime.datetime.now()
            if (now - last_time).total_seconds() < 86400:
                return existing_data["savings_usd"]

    base_url = "https://bank.uz/uz/deposits/valyutnye-vklady"
    tasks = []
    for page_num in range(1, 6):
        url = base_url if page_num == 1 else f"{base_url}?PAGEN_3={page_num}"
        tasks.append(async_fetch_url(session, url))

    responses = await asyncio.gather(*tasks)
    # Check if all responses are None, which means fetch failed entirely
    if all(r is None for r in responses):
         if existing_data and existing_data.get("savings_usd"):
            return existing_data.get("savings_usd")
         # Return empty structure instead of None
         return {
            "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "last_updated_ts": datetime.datetime.now().timestamp(),
            "data": []
        }

    loop = asyncio.get_running_loop()
    savings_list = []
    for content in responses:
        if not content: continue
        page_results = await loop.run_in_executor(None, parse_usd_savings_html, content)
        savings_list.extend(page_results)

    # Deduplicate
    seen = set()
    unique_list = []
    for item in savings_list:
        key = f"{item['bank_name']}-{item['deposit_name']}"
        if key not in seen:
            seen.add(key)
            unique_list.append(item)
    unique_list.sort(key=lambda x: x['rate'], reverse=True)

    return {
        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "last_updated_ts": datetime.datetime.now().timestamp(),
        "data": unique_list
    }

async def async_fetch_news(session, existing_data, force=False):
    print("--- Processing News Feed ---")
    if not force and existing_data and existing_data.get("news"):
        last_ts = existing_data["news"].get("last_updated_ts")
        if last_ts:
            try:
                last_time = datetime.datetime.fromtimestamp(last_ts)
                now = datetime.datetime.now()
                if (now - last_time).total_seconds() < 1800:
                    return existing_data["news"]
            except Exception:
                pass

    sources = [
        {"name": "Gazeta.uz", "rss": "https://www.gazeta.uz/en/rss/", "default_cat": "general", "lang": "EN"},
        {"name": "Kapital.uz", "rss": "https://kapital.uz/feed/", "default_cat": "business", "lang": "RU"},
        {"name": "UzDaily", "rss": "https://uzdaily.uz/en/rss", "default_cat": "business", "lang": "EN"},
        {"name": "Spot.uz", "rss": "https://www.spot.uz/rss", "default_cat": "business", "lang": "RU"},
        {"name": "Spot.uz", "rss": "https://www.spot.uz/oz/rss/", "default_cat": "business", "lang": "UZ"},
    ]

    CATEGORIES = {
        "economy": ["gdp", "inflation", "cpi", "fiscal", "budget", "imf", "world bank", "adb", "growth", "tax", "reform", "debt", "ввп", "инфляция", "бюджет", "мвф", "всемирный банк", "рост", "налог", "реформа", "долг", "экономика"],
        "banking": ["cbu", "central bank", "deposit", "loan", "interest rate", "mortgage", "atm", "visa", "mastercard", "fintech", "цб", "центробанк", "банк", "вклад", "кредит", "ставка", "ипотека", "банкомат", "финтех", "cb"],
        "markets": ["stock", "exchange", "uzse", "ipo", "dividend", "commodity", "gold", "silver", "oil", "gas", "bitcoin", "crypto", "биржа", "акции", "рфб", "ipo", "дивиденд", "сырье", "золото", "серебро", "нефть", "газ", "биткоин", "крипто", "рынок"],
        "business": ["startup", "investment", "profit", "revenue", "merger", "acquisition", "export", "import", "trade", "company", "стартап", "инвестиции", "прибыль", "выручка", "слияние", "поглощение", "экспорт", "импорт", "торговля", "компания", "бизнес"],
        "regulation": ["law", "decree", "president", "parliament", "cabinet", "policy", "rule", "license", "ban", "permit", "закон", "указ", "президент", "парламент", "кабмин", "политика", "правило", "лицензия", "запрет", "разрешение"]
    }

    def determine_category(title, summary, default):
        text = (title + " " + summary).lower()
        for cat, keywords in CATEGORIES.items():
            for keyword in keywords:
                if keyword in text:
                    return cat.capitalize()
        return default.capitalize()

    # Async fetch RSS
    rss_tasks = [async_fetch_url(session, s["rss"]) for s in sources]
    rss_contents = await asyncio.gather(*rss_tasks)

    all_news = []

    for i, content in enumerate(rss_contents):
        if not content: continue
        source = sources[i]
        try:
            feed = feedparser.parse(content)
            for entry in feed.entries[:10]:
                id_str = f"{source['name']}-{entry.link}"
                item_id = hashlib.md5(id_str.encode()).hexdigest()
                published_at = ""
                published_ts = 0
                if hasattr(entry, 'published'):
                    try:
                        dt = date_parser.parse(entry.published)
                        published_at = dt.isoformat()
                        published_ts = dt.timestamp()
                    except: pass

                image_url = None
                if hasattr(entry, 'media_content'):
                     for media in entry.media_content:
                         if 'url' in media:
                             image_url = media['url']
                             break
                if not image_url and hasattr(entry, 'summary'):
                    s = BeautifulSoup(entry.summary, 'html.parser')
                    img = s.find('img')
                    if img and img.get('src'): image_url = img['src']

                full_content = ""
                if hasattr(entry, 'content') and entry.content:
                    full_content = BeautifulSoup(entry.content[0].get('value', ''), 'html.parser').get_text(strip=True)
                elif hasattr(entry, 'summary'):
                    full_content = BeautifulSoup(entry.summary, 'html.parser').get_text(strip=True)
                if len(full_content) > 2000: full_content = full_content[:2000] + "..."
                summary_clean = full_content[:200] + "..." if len(full_content) > 200 else full_content
                category = determine_category(entry.title, summary_clean, source["default_cat"])
                reliability = get_reliability(source["name"])

                all_news.append({
                    "id": item_id, "title": entry.title, "summary": summary_clean, "full_content": full_content,
                    "source": source["name"], "source_url": entry.link, "category": category, "language": source["lang"],
                    "published_at": published_at, "published_ts": published_ts, "image_url": image_url,
                    "is_breaking": False, "reliability_tier": reliability["tier"], "reliability_score": reliability["score"],
                    "reliability_label": reliability["label"]
                })
        except Exception: pass

    # Fetch additional sources concurrently
    extra_tasks = [
        async_fetch_worldnews_api(session),
        async_fetch_cbu_news(session),
        async_fetch_imf_news(session),
        async_fetch_worldbank_news(session)
    ]
    extra_results = await asyncio.gather(*extra_tasks)
    
    for res in extra_results:
        if res:
            # Dedupe
            existing_titles = {item["title"].lower()[:50] for item in all_news}
            for item in res:
                if item["title"].lower()[:50] not in existing_titles:
                    all_news.append(item)
                    existing_titles.add(item["title"].lower()[:50])

    all_news.sort(key=lambda x: x["published_ts"], reverse=True)
    final_news = all_news[:60]

    # Check if we have any news. If not, try to fallback to existing data
    if not final_news and existing_data and existing_data.get("news"):
         return existing_data.get("news")

    return {
        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "last_updated_ts": datetime.datetime.now().timestamp(),
        "items": final_news
    }

async def async_fetch_cbu_news(session):
    print("--- Fetching CBU News ---")
    url = "https://cbu.uz/en/press_center/news/"
    content = await async_fetch_url(session, url)
    if not content: return []
    try:
        soup = BeautifulSoup(content, 'html.parser')
        news_items = []
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            if '/en/press_center/news/' in href and href.count('/') >= 5 and '?PAGEN' not in href and href != '/en/press_center/news/':
                title = link.get_text(strip=True)
                if not title or len(title) < 10: continue
                date_str = ""
                published_ts = 0
                parent = link.parent
                if parent:
                    text = parent.get_text()
                    match = re.search(r'(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})', text)
                    if match:
                        try:
                            dt = date_parser.parse(match.group(0))
                            date_str = dt.isoformat()
                            published_ts = dt.timestamp()
                        except: pass
                full_url = href if href.startswith('http') else f"https://cbu.uz{href}"
                clean_title = re.sub(r'\s*\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*$', '', title).strip()
                reliability = get_reliability("CBU")
                news_items.append({
                    "id": hashlib.md5(f"cbu-{href}".encode()).hexdigest(),
                    "title": clean_title, "summary": clean_title, "full_content": "", "source": "CBU", "source_url": full_url,
                    "category": "Banking", "language": "EN", "published_at": date_str, "published_ts": published_ts, "image_url": None,
                    "is_breaking": False, "is_official": True, "reliability_tier": reliability["tier"], "reliability_score": reliability["score"],
                    "reliability_label": reliability["label"]
                })
        # Dedupe
        seen = set()
        unique = []
        for item in news_items:
            if item["source_url"] not in seen:
                seen.add(item["source_url"])
                unique.append(item)
        unique.sort(key=lambda x: x["published_ts"], reverse=True)
        return unique[:10]
    except Exception: return []

async def async_fetch_imf_news(session):
    print("--- Fetching IMF News ---")
    url = "https://www.imf.org/en/Countries/UZB"
    content = await async_fetch_url(session, url)
    if not content: return []
    try:
        soup = BeautifulSoup(content, 'html.parser')
        news_items = []
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            if any(p in href for p in ['/news/', '/publications/', '/en/News/']) and 'Countries/UZB' not in href and href != url:
                title = link.get_text(strip=True)
                if not title or len(title) < 15 or title.lower() in ['read more', 'view all']: continue
                full_url = href if href.startswith('http') else f"https://www.imf.org{href}"
                date_str = ""
                published_ts = 0
                match = re.search(r'/(\d{4})/(\d{2})/(\d{2})/', href)
                if match:
                    try:
                        dt = datetime.datetime(int(match.group(1)), int(match.group(2)), int(match.group(3)))
                        date_str = dt.isoformat()
                        published_ts = dt.timestamp()
                    except: pass
                if not published_ts:
                    published_ts = datetime.datetime.now().timestamp() - len(news_items) * 86400
                    date_str = datetime.datetime.now().isoformat()
                reliability = get_reliability("IMF")
                news_items.append({
                    "id": hashlib.md5(f"imf-{href}".encode()).hexdigest(),
                    "title": title[:200], "summary": f"IMF report on Uzbekistan: {title[:150]}", "full_content": "",
                    "source": "IMF", "source_url": full_url, "category": "Economy", "language": "EN",
                    "published_at": date_str, "published_ts": published_ts, "image_url": None,
                    "is_breaking": False, "is_official": True, "reliability_tier": reliability["tier"], "reliability_score": reliability["score"],
                    "reliability_label": reliability["label"]
                })
        seen = set()
        unique = []
        for item in news_items:
            if item["source_url"] not in seen:
                seen.add(item["source_url"])
                unique.append(item)
        unique.sort(key=lambda x: x["published_ts"], reverse=True)
        return unique[:5]
    except Exception: return []

async def async_fetch_worldbank_news(session):
    print("--- Fetching World Bank News ---")
    url = "https://www.worldbank.org/en/country/uzbekistan"
    content = await async_fetch_url(session, url)
    if not content: return []
    try:
        soup = BeautifulSoup(content, 'html.parser')
        news_items = []
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            if any(p in href.lower() for p in ['/news/', '/feature/', '/story/']) and link.get_text(strip=True).lower() not in ['read more', 'view all']:
                title = link.get_text(strip=True)
                if not title or len(title) < 15: continue
                full_url = href if href.startswith('http') else f"https://www.worldbank.org{href}"
                date_str = ""
                published_ts = 0
                match = re.search(r'/(\d{4})/(\d{2})/(\d{2})/', href)
                if match:
                    try:
                        dt = datetime.datetime(int(match.group(1)), int(match.group(2)), int(match.group(3)))
                        date_str = dt.isoformat()
                        published_ts = dt.timestamp()
                    except: pass
                if not published_ts:
                    published_ts = datetime.datetime.now().timestamp() - len(news_items) * 86400
                    date_str = datetime.datetime.now().isoformat()
                reliability = get_reliability("World Bank")
                news_items.append({
                    "id": hashlib.md5(f"wb-{href}".encode()).hexdigest(),
                    "title": title[:200], "summary": f"World Bank report on Uzbekistan: {title[:150]}", "full_content": "",
                    "source": "World Bank", "source_url": full_url, "category": "Economy", "language": "EN",
                    "published_at": date_str, "published_ts": published_ts, "image_url": None,
                    "is_breaking": False, "is_official": True, "reliability_tier": reliability["tier"], "reliability_score": reliability["score"],
                    "reliability_label": reliability["label"]
                })
        seen = set()
        unique = []
        for item in news_items:
            if item["source_url"] not in seen:
                seen.add(item["source_url"])
                unique.append(item)
        unique.sort(key=lambda x: x["published_ts"], reverse=True)
        return unique[:5]
    except Exception: return []

async def async_fetch_worldnews_api(session):
    print("--- Fetching WorldNewsAPI ---")
    api_key = os.environ.get("WORLDNEWS_API_KEY")
    if not api_key: return []
    url = f"https://api.worldnewsapi.com/search-news?api-key={api_key}&source-country=uz&language=en&number=15&sort=publish-time&sort-direction=DESC"
    content = await async_fetch_url(session, url)
    if not content: return []
    try:
        data = json.loads(content)
        parsed_news = []
        for item in data.get("news", []):
            published_ts = 0
            if item.get("publish_date"):
                try:
                    dt = date_parser.parse(item.get("publish_date"))
                    published_ts = dt.timestamp()
                except: pass
            full_text = item.get("text", "")[:2000]
            summary = full_text[:200] + "..." if len(full_text) > 200 else full_text
            reliability = get_reliability("WorldNews")
            parsed_news.append({
                "id": hashlib.md5(f"worldnews-{item.get('id', item.get('url', ''))}".encode()).hexdigest(),
                "title": item.get("title", ""), "summary": summary, "full_content": full_text,
                "source": "WorldNews", "source_url": item.get("url", ""), "category": "General", "language": "EN",
                "published_at": item.get("publish_date", ""), "published_ts": published_ts, "image_url": item.get("image"),
                "is_breaking": False, "is_worldnews_api": True, "reliability_tier": reliability["tier"], "reliability_score": reliability["score"],
                "reliability_label": reliability["label"]
            })
        return parsed_news
    except Exception: return []

async def async_fetch_gold_bar_prices(session):
    print("--- Processing Gold Bar Prices ---")
    url = "https://bank.uz/uz/gold-bars"
    content = await async_fetch_url(session, url)
    if not content: return None
    try:
        soup = BeautifulSoup(content, 'html.parser')
        table = soup.find('table', class_='table-table-bordered')
        if not table: return None
        gold_bars = []
        for row in table.find_all('tr')[1:]:
            cells = row.find_all('td')
            if len(cells) < 2: continue
            weight_text = cells[0].get_text(strip=True)
            weight_match = re.search(r'(\d+)\s*грамм', weight_text)
            if not weight_match: continue
            weight = f"{weight_match.group(1)}g"
            price_text = cells[1].get_text(strip=True).replace('сўм', '').replace(' ', '').replace('\xa0', '').replace('-', '').strip()
            try:
                price = int(price_clean) if (price_clean := price_text) else 0
                if price > 0: gold_bars.append({"weight": weight, "price": price})
            except: continue

        def get_weight_val(bar):
            try: return int(bar['weight'].replace('g', ''))
            except: return 0
        gold_bars.sort(key=lambda x: (get_weight_val(x), x['price']))
        return gold_bars
    except Exception: return None

async def async_fetch_polygon_history(session, ticker, key_name, existing_data, force):
    print(f"--- Processing {key_name} ---")
    if not force and existing_data and existing_data.get(key_name):
        last_ts = existing_data[key_name].get("last_updated_ts")
        if last_ts:
            try:
                if (datetime.datetime.now() - datetime.datetime.fromtimestamp(last_ts)).total_seconds() < 1800:
                    return existing_data[key_name]
            except: pass
    
    api_key = os.environ.get("POLYGON_API_KEY")
    if not api_key: return existing_data.get(key_name) if existing_data else None

    today = datetime.date.today()
    end_date_str = today.strftime("%Y-%m-%d")
    start_date_str = (today - datetime.timedelta(days=35)).strftime("%Y-%m-%d")
    url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/day/{start_date_str}/{end_date_str}?adjusted=true&sort=asc&limit=50&apiKey={api_key}"

    content = await async_fetch_url(session, url)
    if not content: return existing_data.get(key_name) if existing_data else None

    try:
        data = json.loads(content)
        results = data.get("results", [])
        if not results: return existing_data.get(key_name) if existing_data else None
        
        history_data = []
        for item in results:
            ts = item.get("t")
            if not ts: continue
            date_str = datetime.datetime.fromtimestamp(ts / 1000, tz=datetime.timezone.utc).strftime("%Y-%m-%d")
            price = float(item.get("c"))
            entry = {"date": date_str}
            if "BTC" in ticker: entry["price_usd"] = price
            else: entry["price_usd_per_oz"] = price
            history_data.append(entry)

        history_data.sort(key=lambda x: x['date'])
        
        # Calculate change percent
        key = "price_usd" if "BTC" in ticker else "price_usd_per_oz"
        for i in range(len(history_data)):
            if i > 0:
                prev = history_data[i-1][key]
                curr = history_data[i][key]
                history_data[i]["change_percent"] = round(((curr - prev) / prev) * 100, 2)
            else:
                history_data[i]["change_percent"] = 0.0

        if len(history_data) > 30: history_data = history_data[-30:]
        
        return {
            "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "last_updated_ts": datetime.datetime.now().timestamp(),
            "data": history_data,
            "source": "Polygon.io",
            "note": "Real market data"
        }
    except Exception as e:
        print(f"Error fetching {key_name}: {e}")
        return existing_data.get(key_name) if existing_data else None

# Bank Reliability
from bank_reliability_mapping import get_all_ranked_banks, SCORING_WEIGHTS, CERR_INDICATORS, get_score_tier, get_bank_type, get_bank_license_year

def calculate_bank_age_score(bank_name):
    current_year = datetime.datetime.now().year
    license_year = get_bank_license_year(bank_name)
    age = current_year - license_year
    if age >= 30: return 100
    elif age >= 20: return 85
    elif age >= 15: return 75
    elif age >= 10: return 65
    elif age >= 5: return 50
    else: return 30

def calculate_bank_type_score(bank_name):
    bank_type = get_bank_type(bank_name)
    if bank_type == "state-owned": return 90
    elif bank_type == "foreign": return 80
    else: return 70

def calculate_cerr_ranking_score(bank_name, ranking_info):
    if not ranking_info: return 50
    rank = ranking_info["rank"]
    category = ranking_info["category"]
    total_banks = 14 if category == "large" else 15
    base_score = 100 if category == "large" else 95
    score = base_score - ((rank - 1) * (base_score - 40) / (total_banks - 1))
    return round(score)

def calculate_trend_score(bank_name, ranking_info):
    if not ranking_info: return 50
    change = ranking_info["change"]
    if change >= 2: return 100
    elif change == 1: return 80
    elif change == 0: return 65
    elif change == -1: return 45
    else: return 25

def calculate_indicator_scores(bank_name, ranking_info):
    base_score = 70
    if ranking_info:
        rank = ranking_info["rank"]
        category = ranking_info["category"]
        if category == "large": base_score = 100 - (rank * 4)
        else: base_score = 95 - (rank * 4)
    indicators = {}
    for ind in CERR_INDICATORS:
        variance = random.randint(-10, 10)
        score = max(20, min(100, base_score + variance))
        indicators[ind["id"]] = score
    return indicators

def calculate_composite_score(bank_name, ranking_info):
    weights = SCORING_WEIGHTS
    age_score = calculate_bank_age_score(bank_name)
    type_score = calculate_bank_type_score(bank_name)
    ranking_score = calculate_cerr_ranking_score(bank_name, ranking_info)
    trend_score = calculate_trend_score(bank_name, ranking_info)
    indicators = calculate_indicator_scores(bank_name, ranking_info)
    indicator_avg = sum(indicators.values()) / len(indicators)
    composite = (ranking_score * weights["cerr_ranking"] + age_score * weights["bank_age"] +
                 indicator_avg * weights["indicators"] + type_score * weights["bank_type"] +
                 trend_score * weights["trend"])
    return round(composite)

def process_bank_reliability(existing_data, force=False):
    print("--- Processing Bank Reliability Data ---")
    if not force and existing_data and existing_data.get("bank_reliability"):
        last_ts = existing_data["bank_reliability"].get("last_updated_ts")
        if last_ts:
             if (datetime.datetime.now() - datetime.datetime.fromtimestamp(last_ts)).total_seconds() < 86400:
                 return existing_data["bank_reliability"]

    all_banks = get_all_ranked_banks()
    reliability_data = []
    for bank_name, ranking_info in all_banks.items():
        try:
            score = calculate_composite_score(bank_name, ranking_info)
            tier_info = get_score_tier(score)
            indicators = calculate_indicator_scores(bank_name, ranking_info)
            reliability_data.append({
                "name": bank_name, "score": score, "tier": tier_info["tier"], "tier_label": tier_info["label"],
                "tier_color": tier_info["color"], "bank_type": get_bank_type(bank_name),
                "license_year": get_bank_license_year(bank_name), "cerr_rank": ranking_info["rank"],
                "cerr_category": ranking_info["category"], "rank_change": ranking_info["change"],
                "indicators": indicators, "logo": get_bank_logo(bank_name)
            })
        except: continue
    reliability_data.sort(key=lambda x: x["score"], reverse=True)
    for i, bank in enumerate(reliability_data): bank["overall_rank"] = i + 1

    return {
        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "last_updated_ts": datetime.datetime.now().timestamp(),
        "data_sources": {"cbu": "https://cbu.uz/en/credit-organizations/banks/head-offices/", "cerr": "https://cerr.uz"},
        "scoring_weights": SCORING_WEIGHTS, "indicators_list": CERR_INDICATORS, "banks": reliability_data
    }

def send_notifications(new_data, old_data):
    """
    Checks for significant rate changes and sends notifications via Firebase.
    """
    print("--- Checking for Rate Changes ---")
    if not os.environ.get("FIREBASE_CREDENTIALS"):
        print("No FIREBASE_CREDENTIALS env var found. Skipping notifications.")
        return

    try:
        if not firebase_admin._apps:
            cred_dict = json.loads(os.environ.get("FIREBASE_CREDENTIALS"))
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        db = firestore.client()

        currencies = ['usd', 'eur', 'rub', 'kzt']
        thresholds = {'usd': 50, 'eur': 50, 'rub': 5, 'kzt': 2}
        alerts = []

        for curr in currencies:
            # Check if key exists in both
            if not old_data or curr not in old_data or not old_data[curr]: continue
            if not new_data or curr not in new_data or not new_data[curr]: continue

            new_banks = new_data[curr].get('banks', [])
            old_banks = old_data[curr].get('banks', [])
            if not new_banks or not old_banks: continue

            new_best_buy = max([b['buy'] for b in new_banks]) if new_banks else 0
            new_best_sell = min([b['sell'] for b in new_banks]) if new_banks else 0
            old_best_buy = max([b['buy'] for b in old_banks]) if old_banks else 0
            old_best_sell = min([b['sell'] for b in old_banks]) if old_banks else 0

            if new_best_buy == 0 or old_best_buy == 0: continue

            threshold = thresholds.get(curr, 50)
            if new_best_buy > old_best_buy + threshold:
                alerts.append(f"{curr.upper()} Buy Rate UP: {old_best_buy} -> {new_best_buy} UZS")
            if new_best_sell < old_best_sell - threshold:
                 alerts.append(f"{curr.upper()} Sell Rate DOWN: {old_best_sell} -> {new_best_sell} UZS")

        if alerts:
            message_body = "\n".join(alerts)
            print(f"Sending notification: {message_body}")
            tokens_ref = db.collection(u'fcm_tokens')
            docs = tokens_ref.stream()
            tokens = [doc.to_dict()['token'] for doc in docs]
            if not tokens: return

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
    except Exception as e:
        print(f"Error sending notifications: {e}")

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--scope", type=str, default="exchange")
    parser.add_argument("--output", type=str, help="Output file path for partial update")
    args = parser.parse_args()

    # Load existing data
    existing_data = {}
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r") as f:
                existing_data = json.load(f)
        except: pass

    output_data = {}
    
    async with aiohttp.ClientSession() as session:
        # SCOPE: EXCHANGE
        if args.scope == "exchange" or args.scope == "all":
            # Weather
            weather_task = async_fetch_iqair_data(session, existing_data)

            # Currencies
            currency_tasks = [async_process_currency(session, c, existing_data) for c in ["USD", "RUB", "EUR", "KZT", "GBP"]]

            # Metals
            gold_bars_task = async_fetch_gold_bar_prices(session)
            gold_hist_task = async_fetch_polygon_history(session, "C:XAUUSD", "gold_history", existing_data, args.force)
            silver_hist_task = async_fetch_polygon_history(session, "C:XAGUSD", "silver_history", existing_data, args.force)
            btc_hist_task = async_fetch_polygon_history(session, "X:BTCUSD", "bitcoin_history", existing_data, args.force)

            results = await asyncio.gather(weather_task, *currency_tasks, gold_bars_task, gold_hist_task, silver_hist_task, btc_hist_task)

            output_data["weather"] = results[0]
            output_data["usd"] = results[1]
            output_data["rub"] = results[2]
            output_data["eur"] = results[3]
            output_data["kzt"] = results[4]
            output_data["gbp"] = results[5]
            output_data["gold_bars"] = results[6]
            output_data["gold_history"] = results[7]
            output_data["silver_history"] = results[8]
            output_data["bitcoin_history"] = results[9]

            # Check for notifications (only for exchange scope)
            # We use output_data as new_data and existing_data as old_data
            if existing_data:
                send_notifications(output_data, existing_data)

        # SCOPE: SAVINGS
        if args.scope == "savings" or args.scope == "all":
            savings_task = async_fetch_savings_rates(session, existing_data, args.force)
            savings_usd_task = async_fetch_usd_savings_rates(session, existing_data, args.force)
            res = await asyncio.gather(savings_task, savings_usd_task)
            output_data["savings"] = res[0]
            output_data["savings_usd"] = res[1]

        # SCOPE: NEWS
        if args.scope == "news" or args.scope == "all":
            output_data["news"] = await async_fetch_news(session, existing_data, args.force)

        # SCOPE: RELIABILITY
        if args.scope == "reliability" or args.scope == "all":
            output_data["bank_reliability"] = process_bank_reliability(existing_data, args.force)

    # OUTPUT HANDLING
    if args.output:
        print(f"Saving partial output to {args.output}")
        with open(args.output, "w") as f:
            json.dump(output_data, f, indent=2)
    else:
        final_output = existing_data.copy()
        final_output.update(output_data)
        final_output["last_updated"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        
        default_keys = ["usd", "rub", "eur", "kzt", "gbp", "weather", "savings", "news",
                       "gold_bars", "gold_history", "silver_history", "bitcoin_history", "bank_reliability"]
        for key in default_keys:
            if key not in final_output: final_output[key] = None

        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        with open(OUTPUT_FILE, "w") as f:
            json.dump(final_output, f, indent=2)
        print(f"Data saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
