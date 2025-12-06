#!/usr/bin/env python3
"""
NeoUZS Telegram Bot
Currency exchange rate alerts and notifications for Uzbekistan.

Commands:
    /start - Welcome message
    /rates - Show all CBU exchange rates
    /usd, /eur, /rub, /kzt, /gbp - Quick rate for specific currency
    /banks [currency] - Top 5 best buy/sell rates
    /help - Show all commands
"""

import io
import os
import sys
import json
import asyncio
import logging
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Rate card image generator
from rate_card_generator import generate_rate_card

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    ContextTypes,
)

# Setup logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Load environment variables
try:
    load_dotenv()
except Exception as e:
    logger.warning(f"Could not load .env: {e}")

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

# Fallback for testing (remove in production)
if not BOT_TOKEN:
    BOT_TOKEN = "8555922094:AAGksYqQ4pHkn9_ysvTscaa2LyqF26PY53A"

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
RATES_FILE = PROJECT_ROOT / "public" / "rates.json"
SUBSCRIBERS_FILE = PROJECT_ROOT / "data" / "subscribers.json"

# Currency emojis
CURRENCY_EMOJI = {
    "USD": "🇺🇸",
    "EUR": "🇪🇺",
    "RUB": "🇷🇺",
    "KZT": "🇰🇿",
    "GBP": "🇬🇧",
}


def load_rates():
    """Load current exchange rates from rates.json."""
    try:
        with open(RATES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load rates: {e}")
        return None


def load_subscribers():
    """Load subscriber data."""
    try:
        with open(SUBSCRIBERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load subscribers: {e}")
        return {"users": {}}


def save_subscribers(data):
    """Save subscriber data."""
    try:
        with open(SUBSCRIBERS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save subscribers: {e}")


def format_rate(value):
    """Format rate value with thousand separators."""
    if value is None:
        return "N/A"
    return f"{value:,.2f}".replace(",", " ")


# ==================== COMMAND HANDLERS ====================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command."""
    user = update.effective_user
    
    welcome_text = f"""
👋 Salom, {user.first_name}!

🏦 **NeoUZS Bot** - Your Uzbekistan Currency Tracker

I can help you with:
• 📊 Live CBU exchange rates
• 🏦 Best bank rates (buy/sell)
• 🔔 Rate alerts (coming soon)

**Quick Commands:**
/rates - All currencies
/usd /eur /rub - Quick rates
/banks - Best bank rates
/help - All commands

🌐 Web App: brklyn498.github.io/Neouzsusd
"""
    
    keyboard = [
        [
            InlineKeyboardButton("🇺🇸 USD", callback_data="rate_usd"),
            InlineKeyboardButton("🇪🇺 EUR", callback_data="rate_eur"),
            InlineKeyboardButton("🇷🇺 RUB", callback_data="rate_rub"),
        ],
        [
            InlineKeyboardButton("📊 All Rates", callback_data="rates_all"),
            InlineKeyboardButton("🏦 Banks", callback_data="banks_usd"),
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        welcome_text,
        parse_mode="Markdown",
        reply_markup=reply_markup
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /help command."""
    help_text = """
📚 **NeoUZS Bot Commands**

**Rate Commands:**
/rates - All CBU exchange rates
/usd - USD/UZS rate
/eur - EUR/UZS rate
/rub - RUB/UZS rate
/kzt - KZT/UZS rate
/gbp - GBP/UZS rate

**Bank Commands:**
/banks - Best USD rates from banks
/banks EUR - Best EUR rates

**Alerts & Notifications:**
/subscribe - Daily rate summary (8 AM)
/unsubscribe - Stop daily updates
/alert USD > 12800 - Set price alert
/myalerts - View your alerts
/deletealert 1 - Delete alert by number

**Other:**
/help - This message

🌐 Full data: brklyn498.github.io/Neouzsusd
"""
    await update.message.reply_text(help_text, parse_mode="Markdown")


async def subscribe_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /subscribe command - subscribe to daily updates."""
    user_id = str(update.effective_user.id)
    
    subscribers = load_subscribers()
    
    if user_id not in subscribers["users"]:
        subscribers["users"][user_id] = {"subscribed": False, "alerts": []}
    
    if subscribers["users"][user_id].get("subscribed"):
        await update.message.reply_text("✅ You're already subscribed to daily updates!")
        return
    
    subscribers["users"][user_id]["subscribed"] = True
    subscribers["users"][user_id]["username"] = update.effective_user.username
    subscribers["users"][user_id]["first_name"] = update.effective_user.first_name
    save_subscribers(subscribers)
    
    await update.message.reply_text(
        "✅ **Subscribed!**\n\n"
        "You'll receive daily rate summaries at 8:00 AM (Tashkent time).\n\n"
        "Use /unsubscribe to stop.",
        parse_mode="Markdown"
    )
    logger.info(f"User {user_id} subscribed to daily updates")


async def unsubscribe_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /unsubscribe command."""
    user_id = str(update.effective_user.id)
    
    subscribers = load_subscribers()
    
    if user_id not in subscribers["users"] or not subscribers["users"][user_id].get("subscribed"):
        await update.message.reply_text("ℹ️ You're not subscribed to daily updates.")
        return
    
    subscribers["users"][user_id]["subscribed"] = False
    save_subscribers(subscribers)
    
    await update.message.reply_text(
        "🔕 **Unsubscribed**\n\n"
        "You won't receive daily updates anymore.\n"
        "Use /subscribe to re-enable.",
        parse_mode="Markdown"
    )
    logger.info(f"User {user_id} unsubscribed from daily updates")


async def alert_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /alert command - set price alert.
    
    Usage: /alert USD > 12800
           /alert EUR < 13500
    """
    user_id = str(update.effective_user.id)
    args = context.args
    
    if len(args) < 3:
        await update.message.reply_text(
            "❌ **Invalid format**\n\n"
            "Usage: `/alert USD > 12800`\n"
            "       `/alert EUR < 13500`\n\n"
            "Operators: `>` (above), `<` (below)",
            parse_mode="Markdown"
        )
        return
    
    currency = args[0].upper()
    operator = args[1]
    
    try:
        value = float(args[2].replace(",", ""))
    except ValueError:
        await update.message.reply_text("❌ Invalid value. Use a number like `12800`.", parse_mode="Markdown")
        return
    
    if currency not in CURRENCY_EMOJI:
        await update.message.reply_text(f"❌ Unknown currency: {currency}. Use: USD, EUR, RUB, KZT, GBP")
        return
    
    if operator not in [">", "<", ">=", "<="]:
        await update.message.reply_text("❌ Invalid operator. Use `>` or `<`.", parse_mode="Markdown")
        return
    
    subscribers = load_subscribers()
    
    if user_id not in subscribers["users"]:
        subscribers["users"][user_id] = {"subscribed": False, "alerts": []}
    
    # Limit alerts per user
    if len(subscribers["users"][user_id].get("alerts", [])) >= 10:
        await update.message.reply_text("❌ Maximum 10 alerts per user. Use /deletealert to remove old ones.")
        return
    
    alert = {
        "currency": currency,
        "operator": operator,
        "value": value,
        "created": datetime.now().strftime("%Y-%m-%d %H:%M")
    }
    
    if "alerts" not in subscribers["users"][user_id]:
        subscribers["users"][user_id]["alerts"] = []
    
    subscribers["users"][user_id]["alerts"].append(alert)
    save_subscribers(subscribers)
    
    emoji = CURRENCY_EMOJI.get(currency, "💱")
    op_text = "rises above" if operator in [">", ">="] else "falls below"
    
    await update.message.reply_text(
        f"🔔 **Alert Set!**\n\n"
        f"{emoji} {currency}/UZS {op_text} **{format_rate(value)}**\n\n"
        f"I'll notify you when this happens.\n"
        f"Use /myalerts to see all alerts.",
        parse_mode="Markdown"
    )
    logger.info(f"User {user_id} set alert: {currency} {operator} {value}")


async def myalerts_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /myalerts command - list user's alerts."""
    user_id = str(update.effective_user.id)
    
    subscribers = load_subscribers()
    user_data = subscribers.get("users", {}).get(user_id, {})
    alerts = user_data.get("alerts", [])
    subscribed = user_data.get("subscribed", False)
    
    if not alerts and not subscribed:
        await update.message.reply_text(
            "📭 **No alerts set**\n\n"
            "Use `/alert USD > 12800` to create one.\n"
            "Use `/subscribe` for daily updates.",
            parse_mode="Markdown"
        )
        return
    
    lines = ["🔔 **Your Alerts**", ""]
    
    if subscribed:
        lines.append("✅ Daily summary: **Subscribed**")
        lines.append("")
    
    if alerts:
        lines.append("**Price Alerts:**")
        for i, alert in enumerate(alerts, 1):
            emoji = CURRENCY_EMOJI.get(alert["currency"], "💱")
            op_text = ">" if alert["operator"] in [">", ">="] else "<"
            lines.append(f"{i}. {emoji} {alert['currency']} {op_text} {format_rate(alert['value'])}")
        lines.append("")
        lines.append("Use `/deletealert N` to remove.")
    
    await update.message.reply_text("\n".join(lines), parse_mode="Markdown")


async def deletealert_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /deletealert command - remove an alert by index."""
    user_id = str(update.effective_user.id)
    args = context.args
    
    if not args:
        await update.message.reply_text("❌ Usage: `/deletealert 1`", parse_mode="Markdown")
        return
    
    try:
        index = int(args[0]) - 1
    except ValueError:
        await update.message.reply_text("❌ Invalid number.", parse_mode="Markdown")
        return
    
    subscribers = load_subscribers()
    user_data = subscribers.get("users", {}).get(user_id, {})
    alerts = user_data.get("alerts", [])
    
    if index < 0 or index >= len(alerts):
        await update.message.reply_text(f"❌ Alert #{index + 1} not found. Use /myalerts to see your alerts.")
        return
    
    removed = alerts.pop(index)
    save_subscribers(subscribers)
    
    await update.message.reply_text(
        f"🗑️ **Alert Deleted**\n\n"
        f"Removed: {removed['currency']} {removed['operator']} {format_rate(removed['value'])}",
        parse_mode="Markdown"
    )
    logger.info(f"User {user_id} deleted alert #{index + 1}")


async def rates_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /rates command - show all CBU rates."""
    rates_data = load_rates()
    
    if not rates_data:
        await update.message.reply_text("❌ Failed to load rates. Please try again later.")
        return
    
    last_updated = rates_data.get("last_updated", "Unknown")
    
    lines = [f"📊 **CBU Official Rates**", f"🕐 {last_updated}", ""]
    
    for currency in ["USD", "EUR", "RUB", "KZT", "GBP"]:
        currency_data = rates_data.get(currency.lower(), {})
        cbu_rate = currency_data.get("cbu")
        emoji = CURRENCY_EMOJI.get(currency, "💱")
        
        if cbu_rate:
            lines.append(f"{emoji} **{currency}**: {format_rate(cbu_rate)} UZS")
        else:
            lines.append(f"{emoji} **{currency}**: N/A")
    
    lines.append("")
    lines.append("🔗 brklyn498.github.io/Neouzsusd")
    
    await update.message.reply_text("\n".join(lines), parse_mode="Markdown")


async def currency_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle individual currency commands (/usd, /eur, etc.) - sends synthwave image."""
    command = update.message.text.split()[0].replace("/", "").upper()
    
    rates_data = load_rates()
    if not rates_data:
        await update.message.reply_text("❌ Failed to load rates.")
        return
    
    currency_data = rates_data.get(command.lower(), {})
    cbu_rate = currency_data.get("cbu")
    banks = currency_data.get("banks", [])
    history = currency_data.get("history", [])
    
    if not cbu_rate:
        await update.message.reply_text(f"❌ No data for {command}.")
        return
    
    # Find best rates
    best_buy = max([b["buy"] for b in banks], default=0) if banks else 0
    best_sell = min([b["sell"] for b in banks], default=0) if banks else 0
    
    # Calculate change from yesterday
    change = 0
    if len(history) >= 2:
        today = history[-1]["rate"] if history else cbu_rate
        yesterday = history[-2]["rate"] if len(history) > 1 else today
        change = today - yesterday
    
    # Send "generating..." message
    generating_msg = await update.message.reply_text("🎨 Generating synthwave rate card...")
    
    try:
        # Generate synthwave image
        img_bytes = generate_rate_card(
            currency=command,
            rate=cbu_rate,
            change=change,
            best_buy=best_buy,
            best_sell=best_sell
        )
        
        # Send image
        await update.message.reply_photo(
            photo=io.BytesIO(img_bytes),
            caption=f"🌆 {command}/UZS Rate Card | brklyn498.github.io/Neouzsusd",
        )
        
        # Delete "generating" message
        await generating_msg.delete()
        
    except Exception as e:
        logger.error(f"Failed to generate rate card: {e}")
        await generating_msg.edit_text(f"❌ Failed to generate image. Showing text instead...")
        
        # Fallback to text
        emoji = CURRENCY_EMOJI.get(command, "💱")
        text = f"{emoji} **{command}/UZS**: {format_rate(cbu_rate)} UZS"
        if change != 0:
            arrow = "📈" if change > 0 else "📉"
            text += f"\n{arrow} Change: {'+' if change > 0 else ''}{change:.2f}"
        await update.message.reply_text(text, parse_mode="Markdown")


async def banks_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /banks command - show best bank rates."""
    # Get currency from args, default to USD
    args = context.args
    currency = args[0].upper() if args else "USD"
    
    if currency not in CURRENCY_EMOJI:
        await update.message.reply_text(f"❌ Unknown currency: {currency}. Use: USD, EUR, RUB, KZT, GBP")
        return
    
    await send_banks_message(update.message, currency)


async def send_banks_message(message, currency):
    """Send bank rates message (used by command and callback)."""
    rates_data = load_rates()
    if not rates_data:
        await message.reply_text("❌ Failed to load rates.")
        return
    
    currency_data = rates_data.get(currency.lower(), {})
    banks = currency_data.get("banks", [])
    
    if not banks:
        await message.reply_text(f"❌ No bank data for {currency}.")
        return
    
    emoji = CURRENCY_EMOJI.get(currency, "💱")
    
    # Sort for best buy (highest) and best sell (lowest)
    best_buy = sorted(banks, key=lambda x: x.get("buy", 0), reverse=True)[:5]
    best_sell = sorted(banks, key=lambda x: x.get("sell", float('inf')))[:5]
    
    lines = [f"{emoji} **{currency} Bank Rates**", ""]
    
    lines.append("📈 **BEST BUY** (You get more UZS):")
    for i, bank in enumerate(best_buy, 1):
        name = bank.get("name", "Unknown")[:15]
        buy = format_rate(bank.get("buy"))
        lines.append(f"   {i}. {name}: **{buy}**")
    
    lines.append("")
    lines.append("📉 **BEST SELL** (You pay less UZS):")
    for i, bank in enumerate(best_sell, 1):
        name = bank.get("name", "Unknown")[:15]
        sell = format_rate(bank.get("sell"))
        lines.append(f"   {i}. {name}: **{sell}**")
    
    lines.append("")
    lines.append(f"🕐 {rates_data.get('last_updated', '')}")
    lines.append("🔗 brklyn498.github.io/Neouzsusd")
    
    keyboard = [[
        InlineKeyboardButton("🇺🇸 USD", callback_data="banks_usd"),
        InlineKeyboardButton("🇪🇺 EUR", callback_data="banks_eur"),
        InlineKeyboardButton("🇷🇺 RUB", callback_data="banks_rub"),
    ]]
    
    await message.reply_text(
        "\n".join(lines),
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


# ==================== CALLBACK HANDLERS ====================

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle inline button presses."""
    query = update.callback_query
    await query.answer()
    
    data = query.data
    
    if data == "rates_all":
        # Re-send rates
        rates_data = load_rates()
        if rates_data:
            lines = ["📊 **CBU Official Rates**", ""]
            for currency in ["USD", "EUR", "RUB", "KZT", "GBP"]:
                currency_data = rates_data.get(currency.lower(), {})
                cbu_rate = currency_data.get("cbu")
                emoji = CURRENCY_EMOJI.get(currency, "💱")
                lines.append(f"{emoji} **{currency}**: {format_rate(cbu_rate)} UZS")
            lines.append(f"\n🕐 {rates_data.get('last_updated', '')}")
            await query.edit_message_text("\n".join(lines), parse_mode="Markdown")
    
    elif data.startswith("rate_"):
        currency = data.split("_")[1].upper()
        rates_data = load_rates()
        if rates_data:
            currency_data = rates_data.get(currency.lower(), {})
            cbu_rate = currency_data.get("cbu")
            banks = currency_data.get("banks", [])
            best_buy = max([b["buy"] for b in banks], default=0) if banks else 0
            best_sell = min([b["sell"] for b in banks], default=0) if banks else 0
            emoji = CURRENCY_EMOJI.get(currency, "💱")
            
            text = f"{emoji} **{currency}/UZS**\n\n📊 CBU: {format_rate(cbu_rate)}\n📈 Best Buy: {format_rate(best_buy)}\n📉 Best Sell: {format_rate(best_sell)}"
            await query.edit_message_text(text, parse_mode="Markdown")
    
    elif data.startswith("banks_"):
        currency = data.split("_")[1].upper()
        rates_data = load_rates()
        if rates_data:
            currency_data = rates_data.get(currency.lower(), {})
            banks = currency_data.get("banks", [])
            emoji = CURRENCY_EMOJI.get(currency, "💱")
            
            best_buy = sorted(banks, key=lambda x: x.get("buy", 0), reverse=True)[:3]
            best_sell = sorted(banks, key=lambda x: x.get("sell", float('inf')))[:3]
            
            lines = [f"{emoji} **{currency} Top Banks**", ""]
            lines.append("📈 **Buy**:")
            for b in best_buy:
                lines.append(f"  • {b['name'][:12]}: {format_rate(b['buy'])}")
            lines.append("📉 **Sell**:")
            for b in best_sell:
                lines.append(f"  • {b['name'][:12]}: {format_rate(b['sell'])}")
            
            keyboard = [[
                InlineKeyboardButton("🇺🇸 USD", callback_data="banks_usd"),
                InlineKeyboardButton("🇪🇺 EUR", callback_data="banks_eur"),
                InlineKeyboardButton("🇷🇺 RUB", callback_data="banks_rub"),
            ]]
            
            await query.edit_message_text(
                "\n".join(lines),
                parse_mode="Markdown",
                reply_markup=InlineKeyboardMarkup(keyboard)
            )


# ==================== MAIN ====================

def main():
    """Start the bot."""
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not found in environment variables!")
        sys.exit(1)
    
    logger.info("Starting NeoUZS Telegram Bot...")
    
    # Create application
    app = Application.builder().token(BOT_TOKEN).build()
    
    # Add handlers
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("rates", rates_command))
    app.add_handler(CommandHandler("banks", banks_command))
    
    # Subscription and alert commands
    app.add_handler(CommandHandler("subscribe", subscribe_command))
    app.add_handler(CommandHandler("unsubscribe", unsubscribe_command))
    app.add_handler(CommandHandler("alert", alert_command))
    app.add_handler(CommandHandler("myalerts", myalerts_command))
    app.add_handler(CommandHandler("deletealert", deletealert_command))
    
    # Currency-specific commands
    for currency in ["usd", "eur", "rub", "kzt", "gbp"]:
        app.add_handler(CommandHandler(currency, currency_command))
    
    # Callback handler for inline buttons
    app.add_handler(CallbackQueryHandler(button_callback))
    
    # Set bot command menu (appears next to emoji button)
    async def post_init(application: Application) -> None:
        """Set bot commands after initialization."""
        commands = [
            ("rates", "📊 All CBU exchange rates"),
            ("usd", "🇺🇸 USD/UZS rate"),
            ("eur", "🇪🇺 EUR/UZS rate"),
            ("rub", "🇷🇺 RUB/UZS rate"),
            ("banks", "🏦 Best bank rates"),
            ("subscribe", "🔔 Daily rate updates"),
            ("myalerts", "📋 View your alerts"),
            ("help", "❓ Show all commands"),
        ]
        await application.bot.set_my_commands(commands)
        logger.info("Bot command menu set successfully!")
    
    app.post_init = post_init
    
    # Start polling
    logger.info("Bot is running! Press Ctrl+C to stop.")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
