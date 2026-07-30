import os

base = "C:\\Users\\admin.DESKTOP-T5A2OCK\\Desktop\\shanghai-tours-website"

# Files in root dir (use tours.html prefix)
root_files = ["about.html", "contact.html", "faq.html"]

# Files in tours/ dir (use ../tours.html prefix)
tours_files = [
    "tours/classic-tour.html", "tours/cultural-tour.html", "tours/food-tour.html",
    "tours/night-tour.html", "tours/water-town-tour.html", "tours/2-day-shanghai-tour.html",
    "tours/3-day-classic-shanghai-tour.html", "tours/3-day-shanghai-water-town-tour.html",
    "tours/4-day-shanghai-suzhou-tour.html"
]

# The old 9-link block (for root pages)
old_root = """                        <li><a href="tours.html#2day">2-Day City Highlights</a></li>
                        <li><a href="tours.html#3dayclassic">3-Day Classic Shanghai</a></li>
                        <li><a href="tours.html#3daywater">3-Day Shanghai &amp; Water Town</a></li>
                        <li><a href="tours.html#4daysuzhou">4-Day Shanghai &amp; Suzhou</a></li>
                        <li><a href="tours.html#classic">Classic Full-Day Tour</a></li>
                        <li><a href="tours.html#food">Food &amp; Nightlife</a></li>
                        <li><a href="tours.html#watertown">Water Town Day Trips</a></li>
                        <li><a href="tours.html#cultural">Cultural Experiences</a></li>
                        <li><a href="tours.html#night">Night Tours</a></li>"""

# The old 9-link block (for tours/ pages)
old_tours = """                        <li><a href="../tours.html#2day">2-Day City Highlights</a></li>
                        <li><a href="../tours.html#3dayclassic">3-Day Classic Shanghai</a></li>
                        <li><a href="../tours.html#3daywater">3-Day Shanghai &amp; Water Town</a></li>
                        <li><a href="../tours.html#4daysuzhou">4-Day Shanghai &amp; Suzhou</a></li>
                        <li><a href="../tours.html#classic">Classic Full-Day Tour</a></li>
                        <li><a href="../tours.html#food">Food &amp; Nightlife</a></li>
                        <li><a href="../tours.html#watertown">Water Town Day Trips</a></li>
                        <li><a href="../tours.html#cultural">Cultural Experiences</a></li>
                        <li><a href="../tours.html#night">Night Tours</a></li>"""

# New 16-link block (for root pages)
new_root = """                        <li><a href="tours.html#2day">2-Day City Highlights</a></li>
                        <li><a href="tours.html#3dayclassic">3-Day Classic Shanghai</a></li>
                        <li><a href="tours.html#3daywater">3-Day Shanghai &amp; Water Town</a></li>
                        <li><a href="tours.html#4daysuzhou">4-Day Shanghai &amp; Suzhou</a></li>
                        <li><a href="tours.html#vipdinner">VIP Dinner Opera Tour</a></li>
                        <li><a href="tours.html#offbeat">Offbeat Charms &amp; Qibao</a></li>
                        <li><a href="tours.html#halfday">Half-Day Highlights</a></li>
                        <li><a href="tours.html#evening">Evening Highlights</a></li>
                        <li><a href="tours.html#layover">Layover Tours</a></li>
                        <li><a href="tours.html#flexible">Ultimate Flexible Tour</a></li>
                        <li><a href="tours.html#zhujiajiaocraft">Zhujiajiao + Craft</a></li>
                        <li><a href="tours.html#classic">Classic Full-Day Tour</a></li>
                        <li><a href="tours.html#food">Food &amp; Nightlife</a></li>
                        <li><a href="tours.html#watertown">Water Town Day Trips</a></li>
                        <li><a href="tours.html#cultural">Cultural Experiences</a></li>
                        <li><a href="tours.html#night">Night Tours</a></li>"""

# New 16-link block (for tours/ pages)
new_tours = """                        <li><a href="../tours.html#2day">2-Day City Highlights</a></li>
                        <li><a href="../tours.html#3dayclassic">3-Day Classic Shanghai</a></li>
                        <li><a href="../tours.html#3daywater">3-Day Shanghai &amp; Water Town</a></li>
                        <li><a href="../tours.html#4daysuzhou">4-Day Shanghai &amp; Suzhou</a></li>
                        <li><a href="../tours.html#vipdinner">VIP Dinner Opera Tour</a></li>
                        <li><a href="../tours.html#offbeat">Offbeat Charms &amp; Qibao</a></li>
                        <li><a href="../tours.html#halfday">Half-Day Highlights</a></li>
                        <li><a href="../tours.html#evening">Evening Highlights</a></li>
                        <li><a href="../tours.html#layover">Layover Tours</a></li>
                        <li><a href="../tours.html#flexible">Ultimate Flexible Tour</a></li>
                        <li><a href="../tours.html#zhujiajiaocraft">Zhujiajiao + Craft</a></li>
                        <li><a href="../tours.html#classic">Classic Full-Day Tour</a></li>
                        <li><a href="../tours.html#food">Food &amp; Nightlife</a></li>
                        <li><a href="../tours.html#watertown">Water Town Day Trips</a></li>
                        <li><a href="../tours.html#cultural">Cultural Experiences</a></li>
                        <li><a href="../tours.html#night">Night Tours</a></li>"""

# Process root files
for fname in root_files:
    fpath = os.path.join(base, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_root in content:
        content = content.replace(old_root, new_root)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"UPDATED: {fname}")
    else:
        print(f"SKIP (not found): {fname}")

# Process tours/ files
for fname in tours_files:
    fpath = os.path.join(base, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_tours in content:
        content = content.replace(old_tours, new_tours)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"UPDATED: {fname}")
    else:
        print(f"SKIP (not found): {fname}")

print("\nDone!")