import json
import requests
import random
import datetime
import os
import time
from bs4 import BeautifulSoup

OUTPUT_FILE = "public/rates.json"

# List of popular banks to prioritize
POPULAR_BANKS_NAMES = ["Kapitalbank", "Hamkorbank", "Ipak Yuli Bank", "O‘zbekiston Milliy banki", "O‘zsanoatqurilishbank"]

def fetch_cbu_rate(date_str=None):
    """
    Fetches the USD rate from CBU for a specific date (YYYY-MM-DD) or current if None.
    Returns float or None.
    """
    if date_str:
        url = f"https://cbu.uz/en/arkhiv-kursov-valyut/json/all/{date_str}/"
    else:
        url = "https://cbu.uz/common/json/"

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return None

        data = response.json()
        for item in data:
            if item['Ccy'] == 'USD':
                return float(item['Rate'])

    except Exception as e:
        print(f"Error fetching CBU: {e}")
        return None

    return None

def fetch_cbu_history(days=30):
    """
    Fetches USD rates for the last N days.
    """
    history = []
    today = datetime.date.today()

    print(f"Fetching history for last {days} days...")

    for i in range(days):
        date_obj = today - datetime.timedelta(days=i)
        date_str = date_obj.strftime("%Y-%m-%d")

        rate = fetch_cbu_rate(date_str)

        if rate:
            history.append({
                "date": date_str,
                "rate": rate
            })

        # Be polite
        # time.sleep(0.05)

    history.sort(key=lambda x: x['date'])
    return history

def parse_rate(rate_str):
    """Cleans and converts rate string to int/float."""
    try:
        clean = rate_str.lower().replace("so'm", "").replace(" ", "").replace(",", "")
        return int(float(clean))
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
            # Sometimes it's just the last text node if class is missing, but usually green-date
            rate_span = row.find(class_='green-date')
            if rate_span:
                rate_val = parse_rate(rate_span.get_text(strip=True))
                if rate_val:
                    banks[name] = rate_val
        except Exception:
            continue

    return banks

def fetch_bank_uz_rates(cbu_rate):
    """
    Scrapes bank.uz for USD rates.
    Returns list of bank objects.
    """
    url = "https://bank.uz/uz/currency/dollar-ssha"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
    }

    print(f"Scraping {url}...")
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code != 200:
            print(f"Failed to fetch {url}. Status: {response.status_code}")
            return None

        soup = BeautifulSoup(response.content, 'html.parser')

        left_containers = soup.find_all(class_='bc-inner-block-left')
        right_containers = soup.find_all(class_='bc-inner-blocks-right')

        # We need to find the pair that corresponds to USD.
        # Typically the one with rates around the CBU rate.

        target_buy_list = {}
        target_sell_list = {}
        found = False

        # Iterate through pairs to find the one matching USD rate range
        min_len = min(len(left_containers), len(right_containers))

        for i in range(min_len):
            buy_container = left_containers[i]
            sell_container = right_containers[i]

            # Parse first few items to check range
            temp_buy = parse_bank_list(buy_container)
            if not temp_buy:
                continue

            # Check average rate of first 3 items
            rates = list(temp_buy.values())[:3]
            avg = sum(rates) / len(rates)

            # USD Check: Within 20% of CBU rate or absolute range check
            # CBU is ~12800 (as of 2024).
            # If CBU rate is not available/failed, assume range 12000-14000
            ref_rate = cbu_rate if cbu_rate else 12800

            if 0.8 * ref_rate < avg < 1.2 * ref_rate:
                print(f"Found matching USD container at index {i} (Avg Rate: {avg})")
                target_buy_list = temp_buy
                target_sell_list = parse_bank_list(sell_container)
                found = True
                break

        if not found:
            print("Could not identify USD container based on rate range.")
            return None

        # Combine Buy and Sell
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
                    "is_mock": False,
                    "featured": False  # Default to False
                })

        # Filter Logic
        # 1. Select 3 Popular Banks
        # Map known popular names to scraped names (fuzzy match or direct)

        popular_selected = []

        # Helper to find bank in combined_banks
        def find_bank(partial_name):
            for b in combined_banks:
                if partial_name.lower() in b['name'].lower():
                    return b
            return None

        # Try to pick 3 from our POPULAR_BANKS list
        target_popular = ["Kapitalbank", "Hamkorbank", "Ipak Yuli", "Milliy bank", "Sanoatqurilishbank"]

        for p in target_popular:
            match = find_bank(p)
            if match and match not in popular_selected:
                popular_selected.append(match)
                if len(popular_selected) >= 3:
                    break

        # 2. Select 2 with most deviations
        # Deviation = max(|buy - cbu|, |sell - cbu|)
        if not cbu_rate:
            cbu_rate = 12800 # fallback for calc

        def calculate_deviation(bank):
            dev_buy = abs(bank['buy'] - cbu_rate)
            dev_sell = abs(bank['sell'] - cbu_rate)
            return max(dev_buy, dev_sell)

        # Sort all banks by deviation descending
        sorted_by_dev = sorted(combined_banks, key=calculate_deviation, reverse=True)

        deviants_selected = []
        for b in sorted_by_dev:
            # Don't duplicate if already in popular
            if b not in popular_selected:
                deviants_selected.append(b)
                if len(deviants_selected) >= 2:
                    break

        # Mark featured banks
        featured_list = popular_selected + deviants_selected
        for bank in featured_list:
            bank["featured"] = True

        return combined_banks  # Return ALL banks, not just final_list

    except Exception as e:
        print(f"Error scraping bank.uz: {e}")
        return None

def generate_mock_banks(base_rate):
    """Generates mock data for commercial banks based on the official rate."""
    if not base_rate:
        base_rate = 12200.00 # Fallback default

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
        variance_buy = random.randint(20, 80)
        variance_sell = random.randint(20, 80)

        buy_rate = base_rate - variance_buy
        sell_rate = base_rate + variance_sell

        results.append({
            "name": bank["name"],
            "buy": int(buy_rate),
            "sell": int(sell_rate),
            "logo": "",
            "is_mock": True,
            "featured": i < 5 # Mark first 5 as featured
        })

    return results

def main():
    print("Fetching Current CBU Rate...")
    cbu_rate = fetch_cbu_rate()

    if not cbu_rate:
        print("Failed to fetch current CBU rate. Using fallback.")
        cbu_rate = 12800.00

    print(f"CBU Rate: {cbu_rate}")

    print("Fetching History...")
    history_data = fetch_cbu_history(30) # Fetch 30 days

    print("Scraping Banks...")
    scraped_banks = fetch_bank_uz_rates(cbu_rate)

    if scraped_banks and len(scraped_banks) > 0:
        print(f"Successfully scraped {len(scraped_banks)} banks.")
        final_banks = scraped_banks
    else:
        print("Scraping failed or returned no data. Using Mock Data.")
        final_banks = generate_mock_banks(cbu_rate)

    output = {
        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "cbu": cbu_rate,
        "history": history_data,
        "banks": final_banks
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Data saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
