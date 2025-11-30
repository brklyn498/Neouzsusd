import json
import requests
import random
import datetime
import os
import time

OUTPUT_FILE = "public/rates.json"

def fetch_cbu_rate(date_str=None):
    """
    Fetches the USD rate from CBU for a specific date (YYYY-MM-DD) or current if None.
    Returns float or None.
    """
    if date_str:
        # History endpoint: https://cbu.uz/en/arkhiv-kursov-valyut/json/all/YYYY-MM-DD/
        url = f"https://cbu.uz/en/arkhiv-kursov-valyut/json/all/{date_str}/"
    else:
        # Current endpoint
        url = "https://cbu.uz/common/json/"

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)

        # If 404 or other error, return None
        if response.status_code != 200:
            print(f"Warning: Failed to fetch {url} - Status {response.status_code}")
            return None

        data = response.json()

        # CBU returns a list of currencies
        for item in data:
            if item['Ccy'] == 'USD':
                return float(item['Rate'])

    except Exception as e:
        print(f"Error fetching CBU ({date_str if date_str else 'current'}): {e}")
        return None

    return None

def fetch_cbu_history(days=30):
    """
    Fetches USD rates for the last N days.
    Returns a list of dicts: [{"date": "YYYY-MM-DD", "rate": 12200.0}, ...]
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
        else:
            # If we fail to fetch a specific day, we might want to fill gaps
            # For now, just skip or use previous day's rate if available?
            # Let's just log it.
            print(f"Missing data for {date_str}")

        # Be polite to the API
        time.sleep(0.1)

    # Sort by date ascending
    history.sort(key=lambda x: x['date'])
    return history

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
    for bank in banks:
        # Buy is usually slightly lower than CBU, Sell is slightly higher
        # Random variance
        variance_buy = random.randint(20, 80)
        variance_sell = random.randint(20, 80)

        buy_rate = base_rate - variance_buy
        sell_rate = base_rate + variance_sell

        results.append({
            "name": bank["name"],
            "buy": int(buy_rate),
            "sell": int(sell_rate),
            "logo": "" # Placeholder
        })

    return results

def main():
    print("Fetching Current CBU Rate...")
    cbu_rate = fetch_cbu_rate()

    if not cbu_rate:
        print("Failed to fetch current CBU rate. Using fallback.")
        cbu_rate = 12200.00

    print(f"CBU Rate: {cbu_rate}")

    print("Fetching History...")
    history_data = fetch_cbu_history(30)
    print(f"Fetched {len(history_data)} days of history.")

    print("Generating Mock Bank Data...")
    banks_data = generate_mock_banks(cbu_rate)

    output = {
        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "cbu": cbu_rate,
        "history": history_data,
        "banks": banks_data
    }

    # Ensure public dir exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Data saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
