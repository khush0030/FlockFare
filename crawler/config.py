"""Watchlist and threshold config — mirrors src/config/watchlist.ts"""

from datetime import date, timedelta
from dataclasses import dataclass

@dataclass
class Airport:
    code: str
    city: str
    country: str
    region: str = ""

ORIGINS = [
    Airport("BOM", "Mumbai", "India"),
    Airport("DEL", "Delhi", "India"),
    Airport("IDR", "Indore", "India"),
    Airport("BLR", "Bangalore", "India"),
]

DESTINATIONS = [
    # Southeast Asia
    Airport("BKK", "Bangkok", "Thailand", "Southeast Asia"),
    Airport("DPS", "Bali", "Indonesia", "Southeast Asia"),
    Airport("SGN", "Ho Chi Minh City", "Vietnam", "Southeast Asia"),
    Airport("SIN", "Singapore", "Singapore", "Southeast Asia"),
    Airport("KUL", "Kuala Lumpur", "Malaysia", "Southeast Asia"),
    # South Asia
    Airport("CMB", "Colombo", "Sri Lanka", "South Asia"),
    Airport("MLE", "Malé", "Maldives", "South Asia"),
    # Middle East
    Airport("DXB", "Dubai", "UAE", "Middle East"),
    Airport("IST", "Istanbul", "Turkey", "Middle East"),
    # East Asia
    Airport("NRT", "Tokyo", "Japan", "East Asia"),
    Airport("ICN", "Seoul", "South Korea", "East Asia"),
    # Europe
    Airport("LHR", "London", "United Kingdom", "Europe"),
    Airport("CDG", "Paris", "France", "Europe"),
    Airport("FCO", "Rome", "Italy", "Europe"),
    Airport("ZRH", "Zurich", "Switzerland", "Europe"),
    # North America
    Airport("JFK", "New York", "USA", "North America"),
    Airport("SFO", "San Francisco", "USA", "North America"),
    Airport("YYZ", "Toronto", "Canada", "North America"),
    # Oceania
    Airport("SYD", "Sydney", "Australia", "Oceania"),
    Airport("AKL", "Auckland", "New Zealand", "Oceania"),
]

# Thresholds
MIN_PCT_OFF = 40
RARE_PCT_OFF = 60
UNIQUE_PCT_OFF = 70
BASELINE_WINDOW_DAYS = 90
MAX_STOPS = 1
WATCH_MONTHS_AHEAD = 6


def get_watch_months() -> list[str]:
    """Return next N months as YYYY-MM strings."""
    months = []
    today = date.today()
    for i in range(WATCH_MONTHS_AHEAD):
        y = today.year + (today.month + i - 1) // 12
        m = (today.month + i - 1) % 12 + 1
        months.append(f"{y}-{m:02d}")
    return months


def get_sample_dates(travel_month: str) -> list[str]:
    """Return 2 sample departure dates per month for fare search.

    Picks the 10th and 20th of the month to get representative fares.
    Returns dates as YYYY-MM-DD strings.
    """
    year, month = travel_month.split("-")
    return [f"{year}-{month}-10", f"{year}-{month}-20"]
