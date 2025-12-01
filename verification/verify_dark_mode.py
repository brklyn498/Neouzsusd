from playwright.sync_api import sync_playwright

def verify_dark_mode():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming Vite default port 5173)
        page.goto("http://localhost:5173")

        # Ensure we are in dark mode. The app defaults to light or dark based on system?
        # The prompt says "Refactor the UI of DARK MODE ONLY".
        # We need to toggle dark mode if it's not active.
        # Check for body class 'dark-mode'

        # Wait for content to load
        page.wait_for_selector('h1')

        # Click the dark mode toggle if not in dark mode
        # The toggle button contains ☀️ or 🌑
        # If currently Light (default), button shows 🌑 (Moon) to switch to Dark?
        # Header.jsx: {darkMode ? '☀️' : '🌑'}
        # If darkMode is true (Sun icon shows), body has .dark-mode.
        # If darkMode is false (Moon icon shows), body has no class.

        # Let's check body class first.
        body_class = page.evaluate("document.body.className")
        print(f"Initial Body Class: {body_class}")

        if "dark-mode" not in body_class:
            print("Switching to Dark Mode...")
            page.click("button:has-text('🌑')")
            page.wait_for_timeout(500) # Wait for transition

        # Verify Dark Mode styles
        # 1. Background Color should be #121212
        bg_color = page.evaluate("window.getComputedStyle(document.body).backgroundColor")
        print(f"Dark Mode Background Color: {bg_color}")
        # rgb(18, 18, 18) is #121212

        # 2. Check Mock Data color (should be Coral/Orange-Red #FF5400 -> rgb(255, 84, 0))
        # Find a Mock Data element.
        # We might need to mock the response if no mock data is present, but usually there is some?
        # If not, we can just check the CSS variable values.

        accent_pink = page.evaluate("getComputedStyle(document.body).getPropertyValue('--accent-pink').trim()")
        print(f"--accent-pink (Sell/Mock): {accent_pink}")

        accent_brand = page.evaluate("getComputedStyle(document.body).getPropertyValue('--accent-brand').trim()")
        print(f"--accent-brand: {accent_brand}")

        # Take a screenshot
        page.screenshot(path="verification/dark_mode_neobrutalism.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_dark_mode()
