import requests

candidates = [
    "https://daryo.uz/rss",
    "https://daryo.uz/en/rss",
    "https://daryo.uz/rss.xml",
    "https://daryo.uz/en/rss.xml",
    "https://daryo.uz/feed",
    "https://daryo.uz/en/feed",
]

for url in candidates:
    try:
        resp = requests.head(url, timeout=5)
        print(f"{url}: {resp.status_code} {resp.headers.get('content-type', '')}")
    except Exception as e:
        print(f"{url}: Error {e}")
