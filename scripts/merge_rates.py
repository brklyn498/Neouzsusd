import json
import os
import argparse
import datetime

OUTPUT_FILE = "public/rates.json"

def main():
    parser = argparse.ArgumentParser(description="Merge partial rates JSON files into the master rates.json")
    parser.add_argument("--base", type=str, default=OUTPUT_FILE, help="Path to base rates.json")
    parser.add_argument("--inputs", nargs='+', required=True, help="List of partial JSON files to merge")
    args = parser.parse_args()

    # 1. Load Base Data
    base_data = {}
    if os.path.exists(args.base):
        try:
            with open(args.base, "r") as f:
                base_data = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load base file {args.base}: {e}")
            # Ensure base structure exists if file missing
            base_data = {
                "usd": None, "rub": None, "eur": None, "kzt": None, "gbp": None,
                "weather": None, "savings": None, "news": None,
                "gold_bars": None, "gold_history": None, "silver_history": None, "bitcoin_history": None,
                "bank_reliability": None
            }

    # 2. Merge Inputs
    for input_file in args.inputs:
        if not os.path.exists(input_file):
            print(f"Warning: Input file {input_file} not found. Skipping.")
            continue

        try:
            with open(input_file, "r") as f:
                partial_data = json.load(f)

            print(f"Merging {input_file}...")
            # Update keys
            for key, value in partial_data.items():
                if value is not None:
                    base_data[key] = value

        except Exception as e:
            print(f"Error reading {input_file}: {e}")

    # 3. Update Timestamp
    base_data["last_updated"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")

    # 4. Save
    if os.path.dirname(args.base):
        os.makedirs(os.path.dirname(args.base), exist_ok=True)
    with open(args.base, "w") as f:
        json.dump(base_data, f, indent=2)

    print(f"Successfully merged {len(args.inputs)} files into {args.base}")

if __name__ == "__main__":
    main()
