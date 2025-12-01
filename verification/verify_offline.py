from playwright.sync_api import sync_playwright

def verify_offline_mode():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile view to test PWA layout if needed, but standard is fine
        context = browser.new_context(viewport={'width': 414, 'height': 896})
        page = context.new_page()

        # 1. Navigate to the app (ensure Vite is running on 5173)
        page.goto("http://localhost:5173/")
        page.wait_for_timeout(2000) # Wait for initial load

        # 2. Simulate Offline Mode
        print("Simulating Offline Mode...")
        context.set_offline(True)

        # Trigger an offline event if the browser doesn't do it automatically immediately
        # React's 'offline' event listener should pick this up.
        # Sometimes set_offline(True) is enough for navigator.onLine to change.
        page.wait_for_timeout(1000)

        # 3. Check for the Offline Banner
        # The banner has text "OFFLINE - DATA MAY BE OLD"
        banner = page.get_by_text("OFFLINE - DATA MAY BE OLD")

        # Take a screenshot
        page.screenshot(path="verification/offline_verification.png")

        if banner.is_visible():
            print("SUCCESS: Offline banner is visible.")
        else:
            print("FAILURE: Offline banner is NOT visible.")

        browser.close()

if __name__ == "__main__":
    verify_offline_mode()
