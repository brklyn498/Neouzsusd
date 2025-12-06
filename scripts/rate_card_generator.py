#!/usr/bin/env python3
"""
Synthwave Rate Card Generator for NeoUZS Telegram Bot
Generates stylish images for currency exchange rates.
"""

import io
import math
import random
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ==================== CONFIGURATION ====================

# Synthwave color palette
COLORS = {
    "bg_dark": (13, 2, 33),       # Deep dark purple
    "bg_mid": (45, 20, 80),       # Mid purple
    "grid": (138, 43, 226),       # Blue-violet grid
    "sun_top": (255, 100, 150),   # Sunset pink
    "sun_bottom": (255, 50, 100), # Sunset red-pink
    "neon_pink": (255, 20, 147),  # Hot pink
    "neon_cyan": (0, 255, 255),   # Cyan
    "neon_yellow": (255, 255, 0), # Yellow
    "white": (255, 255, 255),
    "black": (0, 0, 0),
}

# Image dimensions (Instagram-friendly square)
WIDTH = 800
HEIGHT = 800

# Fun facts about Uzbekistan and currency
FUN_FACTS = [
    "The UZS (So'm) was introduced in 1994, replacing the Soviet Ruble.",
    "Uzbekistan is the world's 6th largest cotton producer.",
    "The Registan Square in Samarkand is a UNESCO World Heritage Site.",
    "Uzbekistan is one of only 2 double-landlocked countries in the world.",
    "The Tashkent Metro features stunning Soviet-era artwork.",
    "Plov (pilaf) is the national dish, with over 200 variations!",
    "Bukhara's Ark Fortress is over 2,000 years old.",
    "Uzbekistan has 5 UNESCO World Heritage Sites.",
    "The Aral Sea was once the world's 4th largest lake.",
    "Samarkand is older than Rome, founded around 700 BC.",
    "Tashkent has the largest open-air bazaar in Central Asia.",
    "The ancient Silk Road passed through Uzbekistan.",
    "Uzbekistan produces some of the world's finest silk.",
    "Khiva's inner city Itchan Kala is a living museum.",
    "The Uzbek sum has 22 denominations in circulation.",
    "Tashkent's TV Tower is 375m tall, 11th tallest in the world.",
    "Navoi Theater in Tashkent was built by Japanese POWs in 1947.",
    "Mirzo Ulugbek built an observatory in Samarkand in 1428.",
    "Tamerlane's empire was centered in Samarkand.",
    "The CBU sets official rates daily at 5:00 PM Tashkent time.",
]

# Currency information
CURRENCY_INFO = {
    "USD": {"name": "US Dollar", "symbol": "$", "flag": "🇺🇸"},
    "EUR": {"name": "Euro", "symbol": "€", "flag": "🇪🇺"},
    "RUB": {"name": "Russian Ruble", "symbol": "₽", "flag": "🇷🇺"},
    "KZT": {"name": "Kazakh Tenge", "symbol": "₸", "flag": "🇰🇿"},
    "GBP": {"name": "British Pound", "symbol": "£", "flag": "🇬🇧"},
}


# ==================== DRAWING FUNCTIONS ====================

def create_gradient_background(draw, width, height):
    """Create vertical gradient from dark to mid purple."""
    for y in range(height):
        # Gradient from dark top to lighter bottom
        ratio = y / height
        r = int(COLORS["bg_dark"][0] + (COLORS["bg_mid"][0] - COLORS["bg_dark"][0]) * ratio)
        g = int(COLORS["bg_dark"][1] + (COLORS["bg_mid"][1] - COLORS["bg_dark"][1]) * ratio)
        b = int(COLORS["bg_dark"][2] + (COLORS["bg_mid"][2] - COLORS["bg_dark"][2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))


def draw_grid(draw, width, height):
    """Draw synthwave perspective grid."""
    # Horizon line
    horizon_y = height * 0.55
    
    # Horizontal lines (perspective)
    num_lines = 12
    for i in range(num_lines):
        # Exponential spacing for perspective effect
        y = horizon_y + (height - horizon_y) * (i / num_lines) ** 1.5
        alpha = int(255 * (1 - i / num_lines * 0.5))
        draw.line([(0, y), (width, y)], fill=(*COLORS["grid"][:3], alpha), width=2)
    
    # Vertical lines (converging to center)
    center_x = width // 2
    num_v_lines = 20
    for i in range(num_v_lines):
        x_offset = (i - num_v_lines // 2) * (width // num_v_lines)
        # Top point (at horizon) converges more
        top_x = center_x + x_offset * 0.3
        # Bottom point spreads out
        bottom_x = center_x + x_offset * 2
        draw.line([(top_x, horizon_y), (bottom_x, height)], fill=COLORS["grid"], width=1)


def draw_sun(draw, width, height):
    """Draw synthwave sunset."""
    sun_center_x = width // 2
    sun_center_y = int(height * 0.4)
    sun_radius = 100
    
    # Draw sun with horizontal stripe gaps (classic synthwave look)
    for y in range(sun_center_y - sun_radius, sun_center_y + sun_radius):
        # Calculate x extent at this y
        dy = abs(y - sun_center_y)
        if dy > sun_radius:
            continue
        dx = int(math.sqrt(sun_radius ** 2 - dy ** 2))
        
        # Skip some lines for stripe effect
        stripe_gap = 8
        if (y - (sun_center_y - sun_radius)) % stripe_gap > stripe_gap - 3:
            continue
        
        # Gradient from pink (top) to red (bottom)
        ratio = (y - (sun_center_y - sun_radius)) / (2 * sun_radius)
        r = int(COLORS["sun_top"][0] + (COLORS["sun_bottom"][0] - COLORS["sun_top"][0]) * ratio)
        g = int(COLORS["sun_top"][1] + (COLORS["sun_bottom"][1] - COLORS["sun_top"][1]) * ratio)
        b = int(COLORS["sun_top"][2] + (COLORS["sun_bottom"][2] - COLORS["sun_top"][2]) * ratio)
        
        draw.line([(sun_center_x - dx, y), (sun_center_x + dx, y)], fill=(r, g, b))


def draw_glow_text(img, draw, text, position, font, color, glow_color=None, glow_radius=5):
    """Draw text with neon glow effect."""
    if glow_color is None:
        glow_color = color
    
    x, y = position
    
    # Create glow layer
    glow_layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    
    # Draw multiple offset texts for glow
    for offset in range(glow_radius, 0, -1):
        alpha = int(100 / offset)
        glow_col = (*glow_color[:3], alpha)
        for dx in range(-offset, offset + 1):
            for dy in range(-offset, offset + 1):
                if dx * dx + dy * dy <= offset * offset:
                    glow_draw.text((x + dx, y + dy), text, font=font, fill=glow_col)
    
    # Apply blur to glow
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=glow_radius))
    
    # Composite glow onto image
    img.paste(glow_layer, (0, 0), glow_layer)
    
    # Draw main text
    draw.text(position, text, font=font, fill=color)


def get_font(size, bold=False):
    """Get font, fallback to default if custom font not available."""
    # Try to use a good system font
    font_names = [
        "C:/Windows/Fonts/impact.ttf",      # Impact (bold, condensed)
        "C:/Windows/Fonts/arialbd.ttf",     # Arial Bold
        "C:/Windows/Fonts/arial.ttf",       # Arial Regular
    ]
    
    for font_name in font_names:
        try:
            return ImageFont.truetype(font_name, size)
        except (IOError, OSError):
            continue
    
    # Fallback to default
    return ImageFont.load_default()


# ==================== MAIN GENERATOR ====================

def generate_rate_card(currency: str, rate: float, change: float = 0, best_buy: float = 0, best_sell: float = 0) -> bytes:
    """
    Generate a synthwave-styled rate card image.
    
    Args:
        currency: Currency code (USD, EUR, RUB, etc.)
        rate: Current CBU rate
        change: Rate change from yesterday
        best_buy: Best bank buy rate
        best_sell: Best bank sell rate
    
    Returns:
        PNG image as bytes
    """
    # Create image
    img = Image.new('RGBA', (WIDTH, HEIGHT), COLORS["bg_dark"])
    draw = ImageDraw.Draw(img)
    
    # Draw background elements
    create_gradient_background(draw, WIDTH, HEIGHT)
    draw_sun(draw, WIDTH, HEIGHT)
    draw_grid(draw, WIDTH, HEIGHT)
    
    # Get fonts
    font_title = get_font(60, bold=True)
    font_rate = get_font(120, bold=True)
    font_label = get_font(28)
    font_fact = get_font(22)
    font_small = get_font(18)
    
    # Currency info
    curr_info = CURRENCY_INFO.get(currency, {"name": currency, "symbol": "", "flag": "💱"})
    
    # Draw title: "USD / UZS"
    title = f"{currency} / UZS"
    title_bbox = draw.textbbox((0, 0), title, font=font_title)
    title_x = (WIDTH - (title_bbox[2] - title_bbox[0])) // 2
    draw_glow_text(img, draw, title, (title_x, 30), font_title, COLORS["neon_cyan"], glow_radius=8)
    
    # Draw main rate (big number)
    rate_text = f"{rate:,.2f}"
    rate_bbox = draw.textbbox((0, 0), rate_text, font=font_rate)
    rate_x = (WIDTH - (rate_bbox[2] - rate_bbox[0])) // 2
    draw_glow_text(img, draw, rate_text, (rate_x, 120), font_rate, COLORS["white"], COLORS["neon_pink"], glow_radius=10)
    
    # Draw "CBU Official Rate" label
    label = "CBU OFFICIAL RATE"
    label_bbox = draw.textbbox((0, 0), label, font=font_label)
    label_x = (WIDTH - (label_bbox[2] - label_bbox[0])) // 2
    draw.text((label_x, 260), label, font=font_label, fill=COLORS["neon_cyan"])
    
    # Draw change indicator
    if change != 0:
        arrow = "▲" if change > 0 else "▼"
        change_color = (0, 255, 100) if change > 0 else (255, 80, 80)
        change_text = f"{arrow} {abs(change):.2f}"
        change_bbox = draw.textbbox((0, 0), change_text, font=font_label)
        change_x = (WIDTH - (change_bbox[2] - change_bbox[0])) // 2
        draw.text((change_x, 300), change_text, font=font_label, fill=change_color)
    
    # Draw bank rates box
    if best_buy > 0 and best_sell > 0:
        box_y = 350
        box_height = 80
        box_margin = 50
        
        # Semi-transparent box
        box_overlay = Image.new('RGBA', (WIDTH - box_margin * 2, box_height), (*COLORS["bg_dark"], 180))
        img.paste(box_overlay, (box_margin, box_y), box_overlay)
        
        # Box border (neon)
        draw.rectangle([(box_margin, box_y), (WIDTH - box_margin, box_y + box_height)], 
                      outline=COLORS["neon_pink"], width=2)
        
        # Bank rates text
        draw.text((box_margin + 20, box_y + 10), "BEST BUY", font=font_small, fill=COLORS["neon_cyan"])
        draw.text((box_margin + 20, box_y + 35), f"{best_buy:,.0f}", font=font_label, fill=(0, 255, 100))
        
        draw.text((WIDTH - box_margin - 150, box_y + 10), "BEST SELL", font=font_small, fill=COLORS["neon_cyan"])
        draw.text((WIDTH - box_margin - 150, box_y + 35), f"{best_sell:,.0f}", font=font_label, fill=(255, 100, 100))
    
    # Fun fact box
    fact_y = 460
    fact = random.choice(FUN_FACTS)
    
    # Wrap fact text
    max_chars = 50
    if len(fact) > max_chars:
        words = fact.split()
        lines = []
        current_line = ""
        for word in words:
            if len(current_line) + len(word) + 1 <= max_chars:
                current_line += (" " if current_line else "") + word
            else:
                lines.append(current_line)
                current_line = word
        if current_line:
            lines.append(current_line)
    else:
        lines = [fact]
    
    # Draw fact box
    fact_box_height = 30 + len(lines) * 28
    draw.rectangle([(30, fact_y), (WIDTH - 30, fact_y + fact_box_height)], 
                  fill=(*COLORS["bg_dark"], 200), outline=COLORS["neon_yellow"], width=2)
    
    draw.text((50, fact_y + 8), "💡 DID YOU KNOW?", font=font_small, fill=COLORS["neon_yellow"])
    for i, line in enumerate(lines):
        draw.text((50, fact_y + 35 + i * 26), line, font=font_fact, fill=COLORS["white"])
    
    # Timestamp and branding
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M GMT+5")
    draw.text((30, HEIGHT - 50), f"Updated: {timestamp}", font=font_small, fill=(*COLORS["white"], 180))
    
    # NeoUZS branding
    brand_text = "NeoUZS"
    brand_bbox = draw.textbbox((0, 0), brand_text, font=font_label)
    draw.text((WIDTH - 30 - (brand_bbox[2] - brand_bbox[0]), HEIGHT - 50), 
              brand_text, font=font_label, fill=COLORS["neon_pink"])
    
    # Website
    draw.text((30, HEIGHT - 30), "brklyn498.github.io/Neouzsusd", font=font_small, fill=(*COLORS["neon_cyan"], 150))
    
    # Convert to bytes
    output = io.BytesIO()
    img.convert('RGB').save(output, format='PNG', quality=95)
    output.seek(0)
    
    return output.getvalue()


# ==================== TEST ====================

if __name__ == "__main__":
    # Test generation
    img_bytes = generate_rate_card(
        currency="USD",
        rate=12780.50,
        change=+15.30,
        best_buy=12800,
        best_sell=12850
    )
    
    # Save test image
    with open("test_rate_card.png", "wb") as f:
        f.write(img_bytes)
    
    print(f"Generated test image: test_rate_card.png ({len(img_bytes)} bytes)")
