#!/usr/bin/env python3
"""
Update all images on the Shanghai Tours website with high-quality Unsplash photos.
Each page gets images that match its specific theme.
"""

import os

BASE_DIR = r"C:\Users\admin.DESKTOP-T5A2OCK\Desktop\shanghai-tours-website"

# ============================================================
# HIGH-QUALITY UNSPLASH IMAGE URLS
# ============================================================
IMAGES = {
    "bund_edward": "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403",
    "bund_liyang": "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2",
    "shanghai_tower": "https://images.unsplash.com/photo-1627484986972-e544190b8abb",
    "shanghai_katherine": "https://images.unsplash.com/photo-1574504500022-de9a6309a501",
    "shanghai_minghan": "https://images.unsplash.com/photo-1588215409014-b57e6a905042",
    "huangpu_night_siyuan": "https://images.unsplash.com/photo-1617258153366-4087bc720b3f",
    "yu_garden_romeo": "https://images.unsplash.com/photo-1750002409395-9f7f49796739",
    "water_town_boats": "https://images.unsplash.com/photo-1734443112114-c54382e4b5fb",
    "suzhou_garden": "https://images.unsplash.com/photo-1689825650048-55d2216868f7",
    "street_food_night": "https://images.unsplash.com/photo-1579603911786-3e6fed0f209a",
    "street_food_day": "https://images.unsplash.com/photo-1579603998886-249dfa2d1df3",
    "huangpu_night_alicja": "https://images.unsplash.com/photo-1715905437623-76e104fa32ff",
    "bund_night_terry": "https://images.unsplash.com/photo-1566133268509-751af2207426",
    "suzhou_garden_jing": "https://images.unsplash.com/photo-1744436633697-6b39f2f7049a",
    "suzhou_garden_emma": "https://images.unsplash.com/photo-1775486315462-62ea39e31818",
    "huangpu_night_calvin": "https://images.unsplash.com/photo-1704095268168-451730b51e75",
}

# Old URLs currently used
OLD = {
    "bund1": "https://images.unsplash.com/photo-1541472119797-2e5b4e5f0e0a",
    "shanghai1": "https://images.unsplash.com/photo-1567532900872-f4e906cbf06a",
    "water_town": "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b",
    "food_tour": "https://images.unsplash.com/photo-1559454403-aa9f87e350b0",
    "night_tour": "https://images.unsplash.com/photo-1581491837397-7e0f8e1e44a0",
    "cultural_tour": "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9",
}


def replace_in_file(filepath, replacements):
    """Apply list of (old_string, new_string) replacements to a file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes = 0
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            changes += 1
    
    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    
    return changes


# ============================================================
# PAGE-SPECIFIC REPLACEMENTS
# ============================================================

# --- index.html ---
# Hero: 3 slides using bund1, shanghai1, night_tour
# Tour cards: bund1, food_tour
index_ops = [
    # Hero slides
    (OLD["bund1"] + "?w=1600&q=80", IMAGES["bund_edward"] + "?w=1600&q=80"),
    (OLD["shanghai1"] + "?w=1600&q=80", IMAGES["bund_liyang"] + "?w=1600&q=80"),
    # 3rd hero slide (currently night_tour) - keep as is
    # Tour cards
    (OLD["bund1"] + "?w=600&q=80", IMAGES["bund_edward"] + "?w=600&q=80"),
    (OLD["food_tour"] + "?w=600&q=80", IMAGES["street_food_night"] + "?w=600&q=80"),
]

# --- tours.html ---
tours_ops = [
    # Banner
    (OLD["shanghai1"] + "?w=1600&q=80", IMAGES["bund_liyang"] + "?w=1600&q=80"),
    # 2-Day card
    (OLD["bund1"] + "?w=800&q=80", IMAGES["bund_edward"] + "?w=800&q=80"),
    # 3-Day Classic card
    (OLD["shanghai1"] + "?w=800&q=80", IMAGES["shanghai_tower"] + "?w=800&q=80"),
    # 3-Day Water Town card
    (OLD["water_town"] + "?w=800&q=80", IMAGES["water_town_boats"] + "?w=800&q=80"),
    # 4-Day Suzhou card
    (OLD["cultural_tour"] + "?w=800&q=80", IMAGES["suzhou_garden"] + "?w=800&q=80"),
    # Classic Full-Day card
    (OLD["bund1"] + "?w=800&q=80", IMAGES["bund_edward"] + "?w=800&q=80"),
    # Food Tour card
    (OLD["food_tour"] + "?w=800&q=80", IMAGES["street_food_night"] + "?w=800&q=80"),
    # Water Town Tour card
    (OLD["water_town"] + "?w=800&q=80", IMAGES["water_town_boats"] + "?w=800&q=80"),
    # Night Tour card
    (OLD["night_tour"] + "?w=800&q=80", IMAGES["huangpu_night_siyuan"] + "?w=800&q=80"),
    # Cultural Tour card
    (OLD["cultural_tour"] + "?w=800&q=80", IMAGES["suzhou_garden_jing"] + "?w=800&q=80"),
    # VIP Dinner Opera card
    (OLD["bund1"] + "?w=800&q=80", IMAGES["bund_night_terry"] + "?w=800&q=80"),
    # Offbeat Charms card
    (OLD["food_tour"] + "?w=800&q=80", IMAGES["street_food_day"] + "?w=800&q=80"),
    # Half-Day card
    (OLD["bund1"] + "?w=800&q=80", IMAGES["shanghai_katherine"] + "?w=800&q=80"),
    # Evening Highlights card
    (OLD["night_tour"] + "?w=800&q=80", IMAGES["huangpu_night_calvin"] + "?w=800&q=80"),
    # Layover card
    (OLD["shanghai1"] + "?w=800&q=80", IMAGES["bund_night_terry"] + "?w=800&q=80"),
    # Flexible card
    (OLD["cultural_tour"] + "?w=800&q=80", IMAGES["shanghai_minghan"] + "?w=800&q=80"),
    # Zhujiajiao Craft card
    (OLD["water_town"] + "?w=800&q=80", IMAGES["water_town_boats"] + "?w=800&q=80"),
]

# --- Tour detail pages ---
# Format: (hero_old_url, hero_new_url, similar_tours_replacements)
# similar_tours_replacements is a list of (old, new) tuples

tour_detail = {
    "classic-tour.html": {
        "hero": (OLD["bund1"] + "?w=1600&q=80", IMAGES["bund_edward"] + "?w=1600&q=80"),
        "similar": [
            (OLD["food_tour"] + "?w=600&q=80", IMAGES["street_food_night"] + "?w=600&q=80"),
            (OLD["water_town"] + "?w=600&q=80", IMAGES["water_town_boats"] + "?w=600&q=80"),
            (OLD["night_tour"] + "?w=600&q=80", IMAGES["huangpu_night_siyuan"] + "?w=600&q=80"),
        ]
    },
    "2-day-shanghai-tour.html": {
        "hero": (OLD["bund1"] + "?w=1600&q=80", IMAGES["bund_edward"] + "?w=1600&q=80"),
        "similar": [
            (OLD["bund1"] + "?w=600&q=80", IMAGES["shanghai_tower"] + "?w=600&q=80"),
            (OLD["water_town"] + "?w=600&q=80", IMAGES["water_town_boats"] + "?w=600&q=80"),
            (OLD["shanghai1"] + "?w=600&q=80", IMAGES["bund_liyang"] + "?w=600&q=80"),
        ]
    },
    "3-day-classic-shanghai-tour.html": {
        "hero": (OLD["bund1"] + "?w=1600&q=80", IMAGES["shanghai_tower"] + "?w=1600&q=80"),
        "similar": [
            (OLD["water_town"] + "?w=600&q=80", IMAGES["water_town_boats"] + "?w=600&q=80"),
            (OLD["bund1"] + "?w=600&q=80", IMAGES["bund_edward"] + "?w=600&q=80"),
            (OLD["food_tour"] + "?w=600&q=80", IMAGES["street_food_night"] + "?w=600&q=80"),
        ]
    },
    "3-day-shanghai-water-town-tour.html": {
        "hero": (OLD["water_town"] + "?w=1600&q=80", IMAGES["water_town_boats"] + "?w=1600&q=80"),
        "similar": [
            (OLD["bund1"] + "?w=600&q=80", IMAGES["bund_edward"] + "?w=600&q=80"),
            (OLD["bund1"] + "?w=600&q=80", IMAGES["shanghai_tower"] + "?w=600&q=80"),
            (OLD["water_town"] + "?w=600&q=80", IMAGES["water_town_boats"] + "?w=600&q=80"),
        ]
    },
    "4-day-shanghai-suzhou-tour.html": {
        "hero": (OLD["shanghai1"] + "?w=1600&q=80", IMAGES["suzhou_garden"] + "?w=1600&q=80"),
        "similar": [
            (OLD["bund1"] + "?w=600&q=80", IMAGES["shanghai_tower"] + "?w=600&q=80"),
            (OLD["water_town"] + "?w=600&q=80", IMAGES["water_town_boats"] + "?w=600&q=80"),
            (OLD["cultural_tour"] + "?w=600&q=80", IMAGES["suzhou_garden_jing"] + "?w=600&q=80"),
        ]
    },
    "food-tour.html": {
        "hero": (OLD["food_tour"] + "?w=1600&q=80", IMAGES["street_food_night"] + "?w=1600&q=80"),
        "similar": [
            (OLD["bund1"] + "?w=600&q=80", IMAGES["bund_edward"] + "?w=600&q=80"),
            (OLD["water_town"] + "?w=600&q=80", IMAGES["water_town_boats"] + "?w=600&q=80"),
            (OLD["cultural_tour"] + "?w=600&q=80", IMAGES["suzhou_garden"] + "?w=600&q=80"),
        ]
    },
    "cultural-tour.html": {
        "hero": (OLD["cultural_tour"] + "?w=1600&q=80", IMAGES["suzhou_garden_jing"] + "?w=1600&q=80"),
        "similar": []
    },
    "night-tour.html": {
        "hero": (OLD["night_tour"] + "?w=1600&q=80", IMAGES["huangpu_night_siyuan"] + "?w=1600&q=80"),
        "similar": []
    },
    "water-town-tour.html": {
        "hero": (OLD["water_town"] + "?w=1600&q=80", IMAGES["water_town_boats"] + "?w=1600&q=80"),
        "similar": []
    },
    "vip-dinner-opera-tour.html": {
        "hero": (OLD["bund1"] + "?w=1600&q=80", IMAGES["bund_night_terry"] + "?w=1600&q=80"),
        "similar": [
            (OLD["bund1"] + "?w=600&q=80", IMAGES["bund_edward"] + "?w=600&q=80"),
            (OLD["food_tour"] + "?w=600&q=80", IMAGES["street_food_night"] + "?w=600&q=80"),
            (OLD["water_town"] + "?w=600&q=80", IMAGES["water_town_boats"] + "?w=600&q=80"),
        ]
    },
    "offbeat-charms-tour.html": {
        "hero": (OLD["food_tour"] + "?w=1600&q=80", IMAGES["street_food_day"] + "?w=1600&q=80"),
        "similar": []
    },
    "half-day-shanghai-tour.html": {
        "hero": (OLD["bund1"] + "?w=1600&q=80", IMAGES["shanghai_katherine"] + "?w=1600&q=80"),
        "similar": []
    },
    "evening-highlights-tour.html": {
        "hero": (OLD["night_tour"] + "?w=1600&q=80", IMAGES["huangpu_night_calvin"] + "?w=1600&q=80"),
        "similar": []
    },
    "layover-tour.html": {
        "hero": (OLD["shanghai1"] + "?w=1600&q=80", IMAGES["bund_night_terry"] + "?w=1600&q=80"),
        "similar": []
    },
    "flexible-tour.html": {
        "hero": (OLD["cultural_tour"] + "?w=1600&q=80", IMAGES["shanghai_minghan"] + "?w=1600&q=80"),
        "similar": []
    },
    "zhujiajiao-craft-tour.html": {
        "hero": (OLD["water_town"] + "?w=1600&q=80", IMAGES["water_town_boats"] + "?w=1600&q=80"),
        "similar": []
    },
}


def main():
    tours_dir = os.path.join(BASE_DIR, "tours")
    total = 0
    
    # 1. Update index.html
    c = replace_in_file(os.path.join(BASE_DIR, "index.html"), index_ops)
    print(f"index.html: {c} changes")
    total += c
    
    # 2. Update tours.html
    c = replace_in_file(os.path.join(BASE_DIR, "tours.html"), tours_ops)
    print(f"tours.html: {c} changes")
    total += c
    
    # 3. Update tour detail pages
    for filename, config in tour_detail.items():
        filepath = os.path.join(tours_dir, filename)
        if not os.path.exists(filepath):
            print(f"  SKIP: {filename} not found")
            continue
        
        ops = []
        # Hero image
        ops.append(config["hero"])
        # Similar tours images
        ops.extend(config["similar"])
        
        c = replace_in_file(filepath, ops)
        if c > 0:
            print(f"  {filename}: {c} changes")
        total += c
    
    print(f"\nTotal: {total} image replacements across all pages.")


if __name__ == "__main__":
    main()