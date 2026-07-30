#!/usr/bin/env python3
"""Update footer navigation links on all pages to include new bus tour and private tour pages."""

import os

BASE_DIR = r"C:\Users\admin.DESKTOP-T5A2OCK\Desktop\shanghai-tours-website"
TOURS_DIR = os.path.join(BASE_DIR, "tours")

# New footer links to add in Tour Categories section
# Format: (marker, new_links_html)
# The marker is the existing line after which we insert new links

NEW_LINKS = '''
            <li><a href="yu-garden-zhujiajiao-bus-tour.html">Yu Garden &amp; Zhujiajiao Bus</a></li>
            <li><a href="private-yu-garden-jade-temple-tour.html">Private Garden &amp; Temple Tour</a></li>
'''

NEW_LINKS_TOURS = '''
                        <li><a href="tours/yu-garden-zhujiajiao-bus-tour.html">Yu Garden &amp; Zhujiajiao Bus</a></li>
                        <li><a href="tours/private-yu-garden-jade-temple-tour.html">Private Garden &amp; Temple Tour</a></li>
'''


def update_file(filepath, marker, new_content):
    """Insert new_content after marker in file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if marker in content:
        content = content.replace(marker, marker + new_content, 1)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    # 1. Update root pages (index.html, about.html, contact.html, faq.html)
    # These use anchor links "tours.html#zhujiajiaocraft"
    root_pages = ['index.html', 'about.html', 'contact.html', 'faq.html']
    
    for page in root_pages:
        filepath = os.path.join(BASE_DIR, page)
        if not os.path.exists(filepath):
            print(f"SKIP: {page} not found")
            continue
        
        marker = '<li><a href="tours.html#zhujiajiaocraft">Zhujiajiao + Craft</a></li>'
        new = '''
                        <li><a href="tours.html#yu-garden-bus">Yu Garden &amp; Zhujiajiao Bus</a></li>
                        <li><a href="tours.html#private-jade-temple">Private Garden &amp; Temple Tour</a></li>
'''
        success = update_file(filepath, marker, new)
        if success:
            print(f"OK: {page}")
        else:
            print(f"FAIL: {page} - marker not found")
    
    # 2. Update tour detail pages (in tours/ subdirectory)
    # These use direct "zhujiajiao-craft-tour.html" format
    tour_pages = [f for f in os.listdir(TOURS_DIR) if f.endswith('.html')]
    
    for page in tour_pages:
        filepath = os.path.join(TOURS_DIR, page)
        marker = '<li><a href="zhujiajiao-craft-tour.html">Zhujiajiao + Craft</a></li>'
        new = NEW_LINKS
        success = update_file(filepath, marker, new)
        if success:
            print(f"OK: tours/{page}")
    
    print("\nDone!")


if __name__ == "__main__":
    main()