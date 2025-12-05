import requests
import feedparser

sources = [
    {"name": "Gazeta.uz", "rss": "https://www.gazeta.uz/en/feeds/news.xml"},
    {"name": "Daryo.uz", "rss": "https://daryo.uz/en/feed/"},
]

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
}

for source in sources:
    print(f"Testing {source['name']} ({source['rss']})...")
    try:
        response = requests.get(source["rss"], headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            feed = feedparser.parse(response.content)
            print(f"Entries found: {len(feed.entries)}")
            if len(feed.entries) > 0:
                print(f"First entry title: {feed.entries[0].title}")
            else:
                print("No entries found in feed.")
                # print first 500 chars of content to see if it's html error page
                print(f"Content preview: {response.text[:500]}")
        else:
            print("Failed to fetch.")

    except Exception as e:
        print(f"Error: {e}")
    print("-" * 30)
