#!/usr/bin/env python3
"""Update meta tags (og:image, twitter:image) and remaining hero slide images."""

import os

BASE_DIR = r"C:\Users\admin.DESKTOP-T5A2OCK\Desktop\shanghai-tours-website"

# New images
BUND_EDWARD = "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403"
BUND_NIGHT_TERRY = "https://images.unsplash.com/photo-1566133268509-751af2207426"
WATER_TOWN_BOATS = "https://images.unsplash.com/photo-1734443112114-c54382e4b5fb"
SHANGHAI_TOWER = "https://images.unsplash.com/photo-1627484986972-e544190b8abb"
SHANGHAI_KATHERINE = "https://images.unsplash.com/photo-1574504500022-de9a6309a501"
SHANGHAI_MINGHAN = "https://images.unsplash.com/photo-1588215409014-b57e6a905042"
HUANGPU_NIGHT_SIYUAN = "https://images.unsplash.com/photo-1617258153366-4087bc720b3f"
HUANGPU_NIGHT_CALVIN = "https://images.unsplash.com/photo-1704095268168-451730b51e75"
SUZHOU_GARDEN = "https://images.unsplash.com/photo-1689825650048-55d2216868f7"
STREET_FOOD_NIGHT = "https://images.unsplash.com/photo-1579603911786-3e6fed0f209a"
STREET_FOOD_DAY = "https://images.unsplash.com/photo-1579603998886-249dfa2d1df3"
SUZHOU_GARDEN_JING = "https://images.unsplash.com/photo-1744436633697-6b39f2f7049a"
YU_GARDEN_ROMEO = "https://images.unsplash.com/photo-1750002409395-9f7f49796739"

# Old URLs
OLD_BUND1 = "https://images.unsplash.com/photo-1541472119797-2e5b4e5f0e0a"
OLD_SHANGHAI1 = "https://images.unsplash.com/photo-1567532900872-f4e906cbf06a"
OLD_WATER_TOWN = "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b"
OLD_FOOD_TOUR = "https://images.unsplash.com/photo-1559454403-aa9f87e350b0"
OLD_NIGHT_TOUR = "https://images.unsplash.com/photo-1581491837397-7e0f8e1e44a0"
OLD_CULTURAL_TOUR = "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9"

# Meta tag replacements per file
# Format: (old_url, new_url)
meta_replacements = {
    "index.html": [
        (OLD_BUND1 + "?w=1200&q=80", BUND_EDWARD + "?w=1200&q=80"),
    ],
    "tours.html": [
        (OLD_SHANGHAI1 + "?w=1200&q=80", BUND_NIGHT_TERRY + "?w=1200&q=80"),
    ],
    "faq.html": [
        (OLD_SHANGHAI1 + "?w=1200&q=80", SHANGHAI_KATHERINE + "?w=1200&q=80"),
    ],
    "tours/2-day-shanghai-tour.html": [
        (OLD_BUND1 + "?w=1200&q=80", BUND_EDWARD + "?w=1200&q=80"),
    ],
    "tours/3-day-classic-shanghai-tour.html": [
        (OLD_BUND1 + "?w=1200&q=80", SHANGHAI_TOWER + "?w=1200&q=80"),
    ],
    "tours/3-day-shanghai-water-town-tour.html": [
        (OLD_WATER_TOWN + "?w=1200&q=80", WATER_TOWN_BOATS + "?w=1200&q=80"),
    ],
    "tours/4-day-shanghai-suzhou-tour.html": [
        (OLD_SHANGHAI1 + "?w=1200&q=80", SUZHOU_GARDEN + "?w=1200&q=80"),
    ],
    "tours/classic-tour.html": [
        (OLD_BUND1 + "?w=1200&q=80", BUND_EDWARD + "?w=1200&q=80"),
    ],
    "tours/cultural-tour.html": [
        (OLD_CULTURAL_TOUR + "?w=1200&q=80", SUZHOU_GARDEN_JING + "?w=1200&q=80"),
    ],
    "tours/evening-highlights-tour.html": [
        (OLD_NIGHT_TOUR + "?w=1200&q=80", HUANGPU_NIGHT_CALVIN + "?w=1200&q=80"),
    ],
    "tours/flexible-tour.html": [
        (OLD_CULTURAL_TOUR + "?w=1200&q=80", SHANGHAI_MINGHAN + "?w=1200&q=80"),
    ],
    "tours/food-tour.html": [
        (OLD_FOOD_TOUR + "?w=1200&q=80", STREET_FOOD_NIGHT + "?w=1200&q=80"),
    ],
    "tours/half-day-shanghai-tour.html": [
        (OLD_BUND1 + "?w=1200&q=80", SHANGHAI_KATHERINE + "?w=1200&q=80"),
    ],
    "tours/layover-tour.html": [
        (OLD_SHANGHAI1 + "?w=1200&q=80", BUND_NIGHT_TERRY + "?w=1200&q=80"),
    ],
    "tours/night-tour.html": [
        (OLD_NIGHT_TOUR + "?w=1200&q=80", HUANGPU_NIGHT_SIYUAN + "?w=1200&q=80"),
    ],
    "tours/offbeat-charms-tour.html": [
        (OLD_FOOD_TOUR + "?w=1200&q=80", STREET_FOOD_DAY + "?w=1200&q=80"),
    ],
    "tours/vip-dinner-opera-tour.html": [
        (OLD_BUND1 + "?w=1200&q=80", BUND_NIGHT_TERRY + "?w=1200&q=80"),
    ],
    "tours/water-town-tour.html": [
        (OLD_WATER_TOWN + "?w=1200&q=80", WATER_TOWN_BOATS + "?w=1200&q=80"),
    ],
    "tours/zhujiajiao-craft-tour.html": [
        (OLD_WATER_TOWN + "?w=1200&q=80", WATER_TOWN_BOATS + "?w=1200&q=80"),
    ],
}

# Also update index.html 3rd hero slide
index_hero_3 = [
    # 3rd hero slide - water town -> replace with Yu Garden
    ("background-image: url('https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1600&q=80')",
     "background-image: url('https://images.unsplash.com/photo-1750002409395-9f7f49796739?w=1600&q=80')"),
]


def replace_in_file(filepath, replacements):
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


def main():
    total = 0
    
    # Update index.html 3rd hero slide
    c = replace_in_file(os.path.join(BASE_DIR, "index.html"), index_hero_3)
    print(f"index.html hero slide: {c} changes")
    total += c
    
    # Update meta tags
    for relative_path, replacements in meta_replacements.items():
        filepath = os.path.join(BASE_DIR, relative_path)
        if not os.path.exists(filepath):
            print(f"  SKIP: {relative_path} not found")
            continue
        c = replace_in_file(filepath, replacements)
        if c > 0:
            print(f"  {relative_path}: {c} changes")
        total += c
    
    print(f"\nTotal meta tag updates: {total}")


if __name__ == "__main__":
    main()