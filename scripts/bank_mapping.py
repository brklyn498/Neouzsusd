
# Best quality SVG or transparent PNGs found
BANK_LOGOS = {
    "Universal bank": "https://universalbank.uz/_nuxt/img/logo.af9d595.svg",
    "BRB": "https://brb.uz/assets/logo/korotkii-logotip-brb.svg",
    "Octobank": "https://octobank.uz/assets/all_images/ab-logo.svg",
    "Anorbank": "https://anorbank.uz/images/logo.svg",
    "Hamkorbank": "https://hamkorbank.uz/assets/images/static/logo.svg",
    "Ipak Yuli Bank": "https://ipakyulibank.uz/images/iyb_logo_v2.svg",
    "Infinbank": "https://infinbank.com/upload/icons/full-logo.svg",
    "Asia Alliance Bank": "https://aab.uz/bitrix/templates/main_2022/ab/images/header-logo.svg",
    "O‘zbekiston Milliy banki": "https://nbu.uz/assets/theme/nbu-logo.svg", # SVG
    "KDB Bank Uzbekiston": "https://kdb.uz/img/navbar/KDB-logo.svg",
    "Orient Finans Bank": "https://ofb.uz/upload/images/logo.svg",
    "Asakabank": "https://asakabank.uz/images/logo_animate.svg",
    "Trastbank": "https://trastbank.uz/bitrix/templates/main_2020/tb/img/footer__logo.svg",
    "O‘zsanoatqurilishbank": "https://sqb.uz/local/templates/sqb/img/SQB-Logo-main.svg",
    "APEXBANK": "https://apexbank.uz/local/templates/main/assets/images/logo.svg",
    "Xalq Banki": "https://xb.uz/_next/static/media/logo.9f2ead73.svg",

    # Aliases
    "OFB": "https://ofb.uz/upload/images/logo.svg",
    "SQB": "https://sqb.uz/local/templates/sqb/img/SQB-Logo-main.svg",
    "Asaka Bank": "https://asakabank.uz/images/logo_animate.svg",
    "NBU": "https://nbu.uz/assets/theme/nbu-logo.svg",
    "Ipak Yuli": "https://ipakyulibank.uz/images/iyb_logo_v2.svg",
    "Milliy bank": "https://nbu.uz/assets/theme/nbu-logo.svg",
    "Sanoatqurilishbank": "https://sqb.uz/local/templates/sqb/img/SQB-Logo-main.svg"
}

# Domains for fallback (Clearbit)
BANK_DOMAINS = {
    "Hayot Bank": "hayotbank.uz",
    "Garant bank": "garantbank.uz",
    "Turon bank": "turonbank.uz",
    "Poytaxt bank": "poytaxtbank.uz",
    "Ipoteka bank": "ipotekabank.uz",
    "Saderat Bank": "saderatbank.uz",
    "Ziraat Bank": "ziraatbank.uz",
    "MKBank": "mikrokreditbank.uz",
    "Aloqabank": "aloqabank.uz",
    "Tenge Bank": "tengebank.uz",
    "Agrobank": "agrobank.uz",
    "Kapitalbank": "kapitalbank.uz",
}

def get_bank_logo(bank_name):
    """
    Returns the logo URL for a given bank name.
    Prioritizes explicit SVG mapping, then Clearbit domain fallback.
    """
    if not bank_name:
        return ""

    # 1. Exact match in LOGOS
    if bank_name in BANK_LOGOS:
        return BANK_LOGOS[bank_name]

    # 2. Domain fallback
    if bank_name in BANK_DOMAINS:
        return f"https://logo.clearbit.com/{BANK_DOMAINS[bank_name]}"

    # 3. Fuzzy match in LOGOS (if simple name is contained)
    for key, url in BANK_LOGOS.items():
        if key.lower() in bank_name.lower() or bank_name.lower() in key.lower():
            # Avoid short matches like "OFB" matching "Bank of..." incorrectly
            if len(key) > 3 and len(bank_name) > 3:
                return url

    # 4. Fuzzy match in DOMAINS
    for key, domain in BANK_DOMAINS.items():
        if key.lower() in bank_name.lower() or bank_name.lower() in key.lower():
             if len(key) > 3 and len(bank_name) > 3:
                return f"https://logo.clearbit.com/{domain}"

    return ""
