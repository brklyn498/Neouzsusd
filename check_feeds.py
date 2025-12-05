import requests

def check_feed(url):
    try:
        response = requests.get(url, timeout=5)
        print(f"Checking {url}: Status {response.status_code}")
        if response.status_code == 200:
            content = response.content[:500].decode('utf-8', errors='ignore')
            if '<?xml' in content or '<rss' in content or '<feed' in content:
                print(f"  -> Valid RSS/Atom feed found at {url}")
                return True
            else:
                print(f"  -> Not an RSS feed (Content type: {response.headers.get('Content-Type')})")
    except Exception as e:
        print(f"  -> Error: {e}")
    return False

candidates = [
    "https://kapital.uz/feed/",
    "https://kapital.uz/rss/",
    "https://kapital.uz/feed/rss2/",
    "https://kun.uz/en/news/rss",
    "https://kun.uz/ru/news/rss",
    "https://kun.uz/rss",
    "https://kursiv.media/uz/feed/",
    "https://uz.kursiv.media/feed/"
]

for url in candidates:
    check_feed(url)
