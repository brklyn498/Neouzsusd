# Vulnerability & Best Practice Report

## Executive Summary
This report outlines security vulnerabilities, code quality issues, and best practice violations found in the `neouzsusd` codebase. The most critical finding is a hardcoded API key in the scraping script, followed by the use of unencrypted HTTP for API calls. Several dependency management and infrastructure issues were also identified.

## 1. Critical Vulnerabilities

### 1.1 Hardcoded IQAir API Key
*   **Location:** `scripts/scraper.py` (Line 344)
*   **Issue:** The script contains a fallback API key string directly in the source code: `api_key = os.environ.get("IQAIR_API_KEY") or "REDACTED"`.
*   **Risk:** This key is exposed to anyone with access to the repository (or if the repo becomes public). An attacker could use this key to consume your API quota or perform other malicious actions authorized by the key.
*   **Recommendation:** Remove the hardcoded string immediately. The script should fail gracefully or log an error if the environment variable is missing.

### 1.2 Unpinned Dependencies (Python)
*   **Location:** `requirements.txt`
*   **Issue:** `requests` and `beautifulsoup4` are listed without version numbers.
*   **Risk:** `pip install` will always fetch the latest version. A future update to these libraries could introduce breaking changes or vulnerabilities, causing the scraper to fail unexpectedly.
*   **Recommendation:** Pin versions (e.g., `requests==2.31.0`) to ensure deterministic builds.

## 2. Medium Vulnerabilities & Issues

### 2.1 Insecure HTTP API Call
*   **Location:** `scripts/scraper.py` (Line 368)
*   **Issue:** The script makes a request to `http://api.airvisual.com`.
*   **Risk:** The API key is sent in cleartext over the network. A man-in-the-middle attacker could intercept the key.
*   **Recommendation:** Change `http://` to `https://`.

### 2.2 Vulnerable JavaScript Dependencies
*   **Location:** `package.json` / `node_modules`
*   **Issue:** `npm audit` reports moderate severity vulnerabilities in `esbuild` and `vite`.
*   **Risk:** While these are build-time tools, vulnerabilities here can sometimes be exploited to inject malicious code during the build process.
*   **Recommendation:** Update `vite` to the latest major version (requires handling breaking changes) or run `npm audit fix` if a patch is available.

### 2.3 Broad Exception Handling
*   **Location:** `scripts/scraper.py` (Multiple locations)
*   **Issue:** The script frequently uses `except Exception as e:` to catch all errors.
*   **Risk:** This can mask syntax errors or unexpected bugs, making debugging difficult. It may also lead to the script "succeeding" (exit code 0) even when it failed to scrape data.
*   **Recommendation:** Catch specific exceptions (e.g., `requests.RequestException`, `json.JSONDecodeError`) where possible.

### 2.4 Bloated Git History (Infrastructure)
*   **Location:** `.github/workflows/update_rates.yml`
*   **Issue:** The workflow commits `public/rates.json` to the `main` branch every hour.
*   **Risk:** This will rapidly increase the size of the `.git` folder, making the repository slow to clone and difficult to manage over time.
*   **Recommendation:** Consider pushing the JSON artifact to a separate "data" branch (orphaned) or using an external storage solution (S3, Gist, or release artifacts) instead of polluting the main branch history.

## 3. Low Severity / Best Practice Violations

### 3.1 Hardcoded User-Agent
*   **Location:** `scripts/scraper.py`
*   **Issue:** Uses a static User-Agent string.
*   **Risk:** Easy for target sites to block this specific string if they detect scraping.
*   **Recommendation:** Rotate User-Agents or use a library like `fake-useragent`.

### 3.2 `playwright` in `dependencies`
*   **Location:** `package.json`
*   **Issue:** `playwright` is listed in `dependencies` (production) rather than `devDependencies`.
*   **Risk:** Increases `node_modules` size unnecessary for the production build if it's only used for testing.
*   **Recommendation:** Move to `devDependencies`.

### 3.3 Outdated Major Version (Vite)
*   **Location:** `package.json`
*   **Issue:** Using Vite v4 while v6 is available.
*   **Recommendation:** Upgrade to the latest stable version to benefit from performance improvements and security patches.

## Summary of Recommendations

1.  **IMMEDIATE:** Remove the hardcoded IQAir API key from `scripts/scraper.py`.
2.  **IMMEDIATE:** Change the IQAir API URL to `https://`.
3.  **HIGH:** Pin Python dependencies in `requirements.txt`.
4.  **HIGH:** Address `npm audit` findings.
5.  **MEDIUM:** Move `playwright` to `devDependencies`.
