import os

base = "C:\\Users\\admin.DESKTOP-T5A2OCK\\Desktop\\shanghai-tours-website"

# Files in tours/ dir that use direct file links (not anchor links)
tours_files = [
    "tours/classic-tour.html", "tours/cultural-tour.html", "tours/food-tour.html",
    "tours/night-tour.html", "tours/water-town-tour.html", "tours/2-day-shanghai-tour.html",
    "tours/3-day-classic-shanghai-tour.html", "tours/3-day-shanghai-water-town-tour.html",
    "tours/4-day-shanghai-suzhou-tour.html"
]

# The old 9-link block (direct file links, used in tours/ pages)
old_tours_direct = """                        <li><a href="2-day-shanghai-tour.html">2-Day City Highlights</a></li>
                        <li><a href="3-day-classic-shanghai-tour.html">3-Day Classic Shanghai</a></li>
                        <li><a href="3-day-shanghai-water-town-tour.html">3-Day Shanghai &amp; Water Town</a></li>
                        <li><a href="4-day-shanghai-suzhou-tour.html">4-Day Shanghai &amp; Suzhou</a></li>
                        <li><a href="classic-tour.html">Classic Full-Day Tour</a></li>
                        <li><a href="food-tour.html">Food &amp; Nightlife</a></li>
                        <li><a href="water-town-tour.html">Water Town Day Trips</a></li>
                        <li><a href="cultural-tour.html">Cultural Experiences</a></li>
                        <li><a href="night-tour.html">Night Tours</a></li>"""

# New 16-link block (direct file links, for tours/ pages)
new_tours_direct = """                        <li><a href="2-day-shanghai-tour.html">2-Day City Highlights</a></li>
                        <li><a href="3-day-classic-shanghai-tour.html">3-Day Classic Shanghai</a></li>
                        <li><a href="3-day-shanghai-water-town-tour.html">3-Day Shanghai &amp; Water Town</a></li>
                        <li><a href="4-day-shanghai-suzhou-tour.html">4-Day Shanghai &amp; Suzhou</a></li>
                        <li><a href="vip-dinner-opera-tour.html">VIP Dinner Opera Tour</a></li>
                        <li><a href="offbeat-charms-tour.html">Offbeat Charms &amp; Qibao</a></li>
                        <li><a href="half-day-shanghai-tour.html">Half-Day Highlights</a></li>
                        <li><a href="evening-highlights-tour.html">Evening Highlights</a></li>
                        <li><a href="layover-tour.html">Layover Tours</a></li>
                        <li><a href="flexible-tour.html">Ultimate Flexible Tour</a></li>
                        <li><a href="zhujiajiao-craft-tour.html">Zhujiajiao + Craft</a></li>
                        <li><a href="classic-tour.html">Classic Full-Day Tour</a></li>
                        <li><a href="food-tour.html">Food &amp; Nightlife</a></li>
                        <li><a href="water-town-tour.html">Water Town Day Trips</a></li>
                        <li><a href="cultural-tour.html">Cultural Experiences</a></li>
                        <li><a href="night-tour.html">Night Tours</a></li>"""

# Process tours/ files
count_updated = 0
for fname in tours_files:
    fpath = os.path.join(base, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_tours_direct in content:
        content = content.replace(old_tours_direct, new_tours_direct)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"UPDATED: {fname}")
        count_updated += 1
    else:
        print(f"SKIP (not found): {fname}")

print(f"\nDone! Updated {count_updated} files.")