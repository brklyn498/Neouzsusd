from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        print("Navigating to app...")
        page.goto("http://localhost:5173")

        # Wait for data to load
        print("Waiting for data to load...")
        try:
            page.wait_for_selector('text=MARKET RATES', timeout=10000)
        except Exception as e:
            print("Timeout waiting for market rates. Taking error screenshot.")
            page.screenshot(path="verification/error_loading.png")
            raise e

        # 1. Take Screenshot of Light Mode (Initial)
        print("Taking Light Mode screenshot...")
        page.screenshot(path="verification/1_light_mode.png")

        # 2. Toggle Dark Mode
        print("Toggling Dark Mode...")
        # Finding the toggle button - it has the moon icon '🌑' initially
        toggle_btn = page.get_by_text("🌑")
        toggle_btn.click()

        # Verify Dark Mode Class on Body
        # We can't easily check body class with Playwright locators directly without eval,
        # but we can check visual styles or just trust the screenshot.
        # Let's take a screenshot.
        print("Taking Dark Mode screenshot...")
        page.screenshot(path="verification/2_dark_mode.png")

        # 3. Test Reverse Calculator
        print("Testing Reverse Calculator...")

        # Default: Foreign -> UZS (Input label should be USD)
        # Check if label says USD
        # calculator_card = page.locator('.brutal-card', has_text='CALCULATOR')
        # Actually title is "CALCULATOR"

        # Enter value in default mode
        input_field = page.locator('.brutal-input').first
        input_field.fill("100")

        # Wait a bit for React effect
        page.wait_for_timeout(500)

        print("Taking Calculator Default Mode screenshot...")
        page.screenshot(path="verification/3_calc_default.png")

        # Switch Mode
        print("Switching Calculator Mode...")
        switch_btn = page.get_by_role("button", name="⬇️") # Assuming default is down arrow
        switch_btn.click()

        # Check if button changed to Up Arrow
        page.get_by_role("button", name="⬆️").wait_for()

        # Enter UZS amount
        input_field.fill("1280000") # 100 USD approx

        # Wait a bit
        page.wait_for_timeout(500)

        print("Taking Calculator Reverse Mode screenshot...")
        page.screenshot(path="verification/4_calc_reverse.png")

        browser.close()
        print("Verification complete.")

if __name__ == "__main__":
    verify_changes()
