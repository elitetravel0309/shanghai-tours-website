#!/usr/bin/env python3
"""Add Similar Tours section to pages that are missing it."""

import os

BASE_DIR = r"C:\Users\admin.DESKTOP-T5A2OCK\Desktop\shanghai-tours-website"
TOURS_DIR = os.path.join(BASE_DIR, "tours")

# The Similar Tours HTML block to insert
SIMILAR_TOURS_HTML = """
    <section class="section" style="background: var(--bg-light);">
        <div class="container">
            <div class="section-header">
                <span class="section-tag">You May Also Like</span>
                <h2 class="section-title">Similar Tours</h2>
            </div>
            <div class="tours-grid">
                <div class="tour-card">
                    <div class="tour-card-image">
                        <img src="https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?w=600&q=80" alt="Classic Tour" loading="lazy">
                        <span class="tour-card-badge">Most Popular</span>
                        <span class="tour-card-duration"><i class="far fa-clock"></i> 8 Hours</span>
                    </div>
                    <div class="tour-card-body">
                        <h3>Shanghai Incredible Highlights</h3>
                        <p>Visit both east and west Shanghai — Oriental Pearl Tower, Yu Garden, Confucius Temple, Bund and more.</p>
                        <div class="tour-card-footer">
                            <span class="tour-card-price">From <strong>$95</strong></span>
                            <a href="classic-tour.html" class="btn btn-secondary btn-sm">View Details</a>
                        </div>
                    </div>
                </div>
                <div class="tour-card">
                    <div class="tour-card-image">
                        <img src="https://images.unsplash.com/photo-1579603911786-3e6fed0f209a?w=600&q=80" alt="Food Tour" loading="lazy">
                        <span class="tour-card-badge">Foodie</span>
                        <span class="tour-card-duration"><i class="far fa-clock"></i> 4 Hours</span>
                    </div>
                    <div class="tour-card-body">
                        <h3>Shanghai Street Food Tour</h3>
                        <p>Eat your way through Shanghai's best food streets and markets with a local guide.</p>
                        <div class="tour-card-footer">
                            <span class="tour-card-price">From <strong>$79</strong></span>
                            <a href="food-tour.html" class="btn btn-secondary btn-sm">View Details</a>
                        </div>
                    </div>
                </div>
                <div class="tour-card">
                    <div class="tour-card-image">
                        <img src="https://images.unsplash.com/photo-1734443112114-c54382e4b5fb?w=600&q=80" alt="Water Town Tour" loading="lazy">
                        <span class="tour-card-badge">Day Trip</span>
                        <span class="tour-card-duration"><i class="far fa-clock"></i> 8 Hours</span>
                    </div>
                    <div class="tour-card-body">
                        <h3>Zhujiajiao Water Town Tour</h3>
                        <p>Escape to the "Venice of Shanghai" — explore ancient canals, bridges and Ming-Qing architecture.</p>
                        <div class="tour-card-footer">
                            <span class="tour-card-price">From <strong>$89</strong></span>
                            <a href="water-town-tour.html" class="btn btn-secondary btn-sm">View Details</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

"""


def add_similar_tours(filepath):
    """Insert Similar Tours section before the footer."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the insertion point: end of last section -> footer
    # Pattern: 4 spaces + </div></div></section> + \n\n + 4 spaces + <footer
    marker = '    </div></div></section>\n\n    <footer class="footer">'
    replacement = '    </div></div></section>' + SIMILAR_TOURS_HTML + '    <footer class="footer">'
    
    if marker in content:
        content = content.replace(marker, replacement, 1)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    pages = [
        "evening-highlights-tour.html",
        "flexible-tour.html",
        "half-day-shanghai-tour.html",
        "layover-tour.html",
        "zhujiajiao-craft-tour.html",
        "offbeat-charms-tour.html",
    ]
    
    for page in pages:
        filepath = os.path.join(TOURS_DIR, page)
        if not os.path.exists(filepath):
            print(f"SKIP: {page} not found")
            continue
        
        # First check if similar tours already exists
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'Similar Tours' in content:
            print(f"SKIP: {page} already has Similar Tours section")
            continue
        
        success = add_similar_tours(filepath)
        if success:
            print(f"OK: Added Similar Tours to {page}")
        else:
            print(f"FAIL: Could not find insertion point in {page}")


if __name__ == "__main__":
    main()