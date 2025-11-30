import json
import requests
import random
import datetime
import os

OUTPUT_FILE = "public/rates.json"

def fetch_cbu():
    """Fetches the official rate from CBU."""
    # Based on my investigation, /common/json/ returns the data correctly
    url = "https://cbu.uz/common/json/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        # Find USD
        for item in data:
            if item['Ccy'] == 'USD':
                return float(item['Rate'])
    except Exception as e:
        print(f"Error fetching CBU: {e}")
        return 12200.00 # Fallback

def generate_mock_banks(base_rate):
    """Generates mock data for commercial banks based on the official rate."""
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
    print("Fetching CBU Rate...")
    cbu_rate = fetch_cbu()
    print(f"CBU Rate: {cbu_rate}")

    print("Generating Mock Bank Data...")
    banks_data = generate_mock_banks(cbu_rate)

    output = {
        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "cbu": cbu_rate,
        "banks": banks_data
    }

    # Ensure public dir exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Data saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
