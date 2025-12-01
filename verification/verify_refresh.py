from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the preview URL
        page.goto("http://localhost:4173/")

        # Check that the header with CBU RATE is visible
        page.wait_for_selector("text=CBU RATE")

        # Take a screenshot of the initial state
        page.screenshot(path="verification/initial_state.png")
        print("Initial state screenshot taken.")

        # Find the Refresh button and click it
        refresh_btn = page.get_by_text("REFRESH")
        refresh_btn.click()

        # Wait a bit for the refresh action (it's fast since it fetches local file)
        page.wait_for_timeout(1000)

        # Take a screenshot after refresh
        page.screenshot(path="verification/after_refresh.png")
        print("After refresh screenshot taken.")

        # Verify "Last refreshed" text appears or updates
        # Note: The text might be "Last refreshed: ..."
        # We can just verify the text "Last refreshed:" is present
        assert page.is_visible("text=Last refreshed:")
        print("Verification successful: 'Last refreshed' text is visible.")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
