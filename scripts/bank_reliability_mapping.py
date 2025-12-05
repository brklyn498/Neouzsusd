# Bank Reliability Mapping Data
# Maps bank names, types, and defines scoring tiers

# CERR Q3 2025 Large Banks Ranking (14 banks)
# Source: https://cerr.uz/show-news/bankovskiy-sektor-uzbekistana-v-reytinge-ceir
CERR_LARGE_BANKS_Q3_2025 = {
    "Kapitalbank": {"rank": 1, "change": 0, "category": "large"},
    "Trust Bank": {"rank": 2, "change": 0, "category": "large"},
    "Hamkorbank": {"rank": 3, "change": 0, "category": "large"},
    "Asia Alliance Bank": {"rank": 4, "change": 0, "category": "large"},
    "Ipak Yuli Bank": {"rank": 5, "change": 2, "category": "large"},  # Improved, entered top 5
    "Infinbank": {"rank": 6, "change": 1, "category": "large"},
    "Davr Bank": {"rank": 7, "change": 1, "category": "large"},
    "Orient Finance Bank": {"rank": 8, "change": 1, "category": "large"},
    "Ipoteka Bank": {"rank": 9, "change": 1, "category": "large"},
    "Asaka Bank": {"rank": 10, "change": 1, "category": "large"},
    "National Bank of Uzbekistan": {"rank": 11, "change": 2, "category": "large"},  # Biggest improvement
    "Xalq Bank": {"rank": 12, "change": -3, "category": "large"},  # Biggest decline
    "Tenge Bank": {"rank": 13, "change": -2, "category": "large"},
    "BRB Bank": {"rank": 14, "change": 0, "category": "large"},
}

# CERR Q3 2025 Small Banks Ranking (15 banks)
CERR_SMALL_BANKS_Q3_2025 = {
    "Universal Bank": {"rank": 1, "change": 0, "category": "small"},
    "TBC Bank": {"rank": 2, "change": 1, "category": "small"},
    "Ziraat Bank": {"rank": 3, "change": 0, "category": "small"},
    "KDB Bank": {"rank": 4, "change": 0, "category": "small"},
    "Ravnaq Bank": {"rank": 5, "change": 0, "category": "small"},
    "Iran Saderat Bank": {"rank": 6, "change": 2, "category": "small"},  # Improved
    "AVO Bank": {"rank": 7, "change": 2, "category": "small"},  # Improved
    "Turkiston Bank": {"rank": 8, "change": 0, "category": "small"},
    "Agrobank": {"rank": 9, "change": 0, "category": "small"},
    "Microcreditbank": {"rank": 10, "change": 0, "category": "small"},
    "Uzpromstroybank": {"rank": 11, "change": 0, "category": "small"},
    "Aloqa Bank": {"rank": 12, "change": -1, "category": "small"},
    "Turon Bank": {"rank": 13, "change": -1, "category": "small"},
    "Madat Invest Bank": {"rank": 14, "change": -2, "category": "small"},  # Biggest decline
    "Invest Finance Bank": {"rank": 15, "change": -1, "category": "small"},
}

# Bank name normalization (Uzbek variants -> English standard)
BANK_NAME_MAPPING = {
    # Large Banks
    "Капиталбанк": "Kapitalbank",
    "Kapitalbank": "Kapitalbank",
    "Траст банк": "Trust Bank",
    "Trust Bank": "Trust Bank",
    "Ҳамкор банк": "Hamkorbank",
    "Hamkorbank": "Hamkorbank",
    "Hamkor bank": "Hamkorbank",
    "Азия Алянс банк": "Asia Alliance Bank",
    "Asia Alliance Bank": "Asia Alliance Bank",
    "Ипак йўли": "Ipak Yuli Bank",
    "Ipak Yuli Bank": "Ipak Yuli Bank",
    "Ipak Yuli": "Ipak Yuli Bank",
    "Инфинбанк": "Infinbank",
    "Infinbank": "Infinbank",
    "Даврбанк": "Davr Bank",
    "Davr Bank": "Davr Bank",
    "Ориент финанс банк": "Orient Finance Bank",
    "Orient Finans Bank": "Orient Finance Bank",
    "Orient Finance Bank": "Orient Finance Bank",
    "Ипотека банк": "Ipoteka Bank",
    "Ipoteka Bank": "Ipoteka Bank",
    "Асака банк": "Asaka Bank",
    "Asakabank": "Asaka Bank",
    "Asaka Bank": "Asaka Bank",
    "Ўзбекистон Миллий банки": "National Bank of Uzbekistan",
    "O'zbekiston Milliy banki": "National Bank of Uzbekistan",
    "National Bank of Uzbekistan": "National Bank of Uzbekistan",
    "NBU": "National Bank of Uzbekistan",
    "Халқ банки": "Xalq Bank",
    "Xalq Bank": "Xalq Bank",
    "Xalq Banki": "Xalq Bank",
    "Тенге банк": "Tenge Bank",
    "Tenge Bank": "Tenge Bank",
    "БРБ банк": "BRB Bank",
    "BRB Bank": "BRB Bank",
    
    # Small Banks
    "Универсал банк": "Universal Bank",
    "Universal Bank": "Universal Bank",
    "ТВС банк": "TBC Bank",
    "TBC Bank": "TBC Bank",
    "Зироат банк": "Ziraat Bank",
    "Ziraat Bank": "Ziraat Bank",
    "КДБ банк": "KDB Bank",
    "KDB Bank": "KDB Bank",
    "Равнақ банк": "Ravnaq Bank",
    "Ravnaq Bank": "Ravnaq Bank",
    "Эрон Содерот банк": "Iran Saderat Bank",
    "Iran Saderat Bank": "Iran Saderat Bank",
    "Saderat Bank": "Iran Saderat Bank",
    "АВО банк": "AVO Bank",
    "AVO Bank": "AVO Bank",
    "Туркистон банк": "Turkiston Bank",
    "Turkiston Bank": "Turkiston Bank",
    "Агробанк": "Agrobank",
    "Agrobank": "Agrobank",
    "Микрокредитбанк": "Microcreditbank",
    "Microcreditbank": "Microcreditbank",
    "Ўзсаноатқурилишбанк": "Uzpromstroybank",
    "Uzpromstroybank": "Uzpromstroybank",
    "SQB": "Uzpromstroybank",
    "Алоқа банк": "Aloqa Bank",
    "Aloqabank": "Aloqa Bank",
    "Aloqa Bank": "Aloqa Bank",
    "Турон банк": "Turon Bank",
    "Turon Bank": "Turon Bank",
    "Мадат инвест банк": "Madat Invest Bank",
    "Madat Invest Bank": "Madat Invest Bank",
    "Инвест финанс банк": "Invest Finance Bank",
    "Invest Finance Bank": "Invest Finance Bank",
    
    # Additional banks from bank.uz
    "Anor Bank": "Anor Bank",
    "Анор банк": "Anor Bank",
    "Uzum Bank": "Uzum Bank",
    "OFB": "Orient Finance Bank",
}

# Bank type classification based on CBU data
BANK_TYPES = {
    "state-owned": [
        "National Bank of Uzbekistan",
        "Xalq Bank",
        "Asaka Bank",
        "Uzpromstroybank",
        "Agrobank",
        "Microcreditbank",
        "Aloqa Bank",
        "Turon Bank",
        "Poytaxt Bank",
    ],
    "private": [
        "Kapitalbank",
        "Hamkorbank",
        "Ipak Yuli Bank",
        "Trust Bank",
        "Asia Alliance Bank",
        "Infinbank",
        "Davr Bank",
        "Orient Finance Bank",
        "Anor Bank",
        "Universal Bank",
        "Ravnaq Bank",
        "BRB Bank",
        "Madat Invest Bank",
        "Invest Finance Bank",
        "Uzum Bank",
    ],
    "foreign": [
        "Ipoteka Bank",  # Majority owned by OTP Group
        "Tenge Bank",  # Kazakhstan
        "TBC Bank",  # Georgia
        "Ziraat Bank",  # Turkey
        "KDB Bank",  # Korea
        "Iran Saderat Bank",  # Iran
        "AVO Bank",  # Foreign capital
        "Turkiston Bank",  # Foreign capital
    ],
}

# CBU License dates (year licensed - for age scoring)
# Source: https://cbu.uz/en/credit-organizations/banks/head-offices/
BANK_LICENSE_YEARS = {
    "National Bank of Uzbekistan": 1991,
    "Xalq Bank": 1995,
    "Uzpromstroybank": 1922,
    "Asaka Bank": 1995,
    "Agrobank": 2009,
    "Ipoteka Bank": 2005,
    "Microcreditbank": 2006,
    "Kapitalbank": 2001,
    "Hamkorbank": 1991,
    "Ipak Yuli Bank": 1990,
    "Trust Bank": 1994,
    "Asia Alliance Bank": 2009,
    "Infinbank": 2007,
    "Davr Bank": 2001,
    "Orient Finance Bank": 2010,
    "Anor Bank": 2020,
    "Universal Bank": 2010,
    "Ravnaq Bank": 2010,
    "Aloqa Bank": 1994,
    "Turon Bank": 1990,
    "BRB Bank": 2008,
    "Madat Invest Bank": 2019,
    "Invest Finance Bank": 2011,
    "Tenge Bank": 2019,
    "TBC Bank": 2020,
    "Ziraat Bank": 1993,
    "KDB Bank": 1997,
    "Iran Saderat Bank": 2009,
    "AVO Bank": 2020,
    "Turkiston Bank": 2009,
    "Uzum Bank": 2022,
    "Poytaxt Bank": 2018,
}

# Score tier definitions
SCORE_TIERS = {
    "A+": {"min": 90, "max": 100, "label": "Exceptional", "color": "#10B981"},  # Emerald
    "A": {"min": 80, "max": 89, "label": "Excellent", "color": "#22C55E"},  # Green
    "B+": {"min": 70, "max": 79, "label": "Very Good", "color": "#84CC16"},  # Lime
    "B": {"min": 60, "max": 69, "label": "Good", "color": "#EAB308"},  # Yellow
    "C": {"min": 0, "max": 59, "label": "Fair", "color": "#F97316"},  # Orange
}

# Scoring weights (displayed on frontend with notice)
SCORING_WEIGHTS = {
    "cerr_ranking": 0.35,  # 35% - CERR quarterly ranking position
    "bank_age": 0.20,  # 20% - Years since licensed
    "indicators": 0.20,  # 20% - Average of 6 CERR indicators
    "bank_type": 0.15,  # 15% - State-owned gets bonus for stability
    "trend": 0.10,  # 10% - Position change trend
}

# CERR Indicator categories (for radar chart)
CERR_INDICATORS = [
    {"id": "financial_intermediation", "name": "Financial Intermediation", "name_uz": "Молиявий воситачилик"},
    {"id": "financial_accessibility", "name": "Financial Accessibility", "name_uz": "Молиявий оммабоплик"},
    {"id": "asset_quality", "name": "Asset Quality", "name_uz": "Активлар сифати"},
    {"id": "profitability", "name": "Profitability", "name_uz": "Даромаддорлик"},
    {"id": "management_efficiency", "name": "Management Efficiency", "name_uz": "Бошқарув самарадорлиги"},
    {"id": "liquidity", "name": "Liquidity", "name_uz": "Ликвидлик"},
]


def normalize_bank_name(name):
    """Normalize bank name to standard English form."""
    if name in BANK_NAME_MAPPING:
        return BANK_NAME_MAPPING[name]
    
    # Try case-insensitive match
    for key, value in BANK_NAME_MAPPING.items():
        if key.lower() == name.lower():
            return value
    
    # Try partial match
    name_lower = name.lower()
    for key, value in BANK_NAME_MAPPING.items():
        if key.lower() in name_lower or name_lower in key.lower():
            return value
    
    return name  # Return original if no match


def get_bank_type(bank_name):
    """Get the type classification of a bank."""
    normalized = normalize_bank_name(bank_name)
    
    for bank_type, banks in BANK_TYPES.items():
        if normalized in banks:
            return bank_type
    
    return "private"  # Default to private


def get_bank_license_year(bank_name):
    """Get the license year of a bank."""
    normalized = normalize_bank_name(bank_name)
    return BANK_LICENSE_YEARS.get(normalized, 2010)  # Default to 2010


def get_cerr_ranking(bank_name):
    """Get CERR ranking data for a bank."""
    normalized = normalize_bank_name(bank_name)
    
    # Check large banks first
    if normalized in CERR_LARGE_BANKS_Q3_2025:
        return CERR_LARGE_BANKS_Q3_2025[normalized]
    
    # Check small banks
    if normalized in CERR_SMALL_BANKS_Q3_2025:
        return CERR_SMALL_BANKS_Q3_2025[normalized]
    
    return None


def get_score_tier(score):
    """Get the tier label for a given score."""
    for tier, config in SCORE_TIERS.items():
        if config["min"] <= score <= config["max"]:
            return {
                "tier": tier,
                "label": config["label"],
                "color": config["color"]
            }
    return {"tier": "C", "label": "Fair", "color": "#F97316"}


def get_all_ranked_banks():
    """Get all banks with CERR rankings."""
    all_banks = {}
    all_banks.update(CERR_LARGE_BANKS_Q3_2025)
    all_banks.update(CERR_SMALL_BANKS_Q3_2025)
    return all_banks
