"""
Scrape JUPAS program pages and write a programs_seed.json file for seeding the DB.

Run:
  python3 scraper-python.py

Output: data/programs_seed.json with objects { university: 'hku', program: '...' }
"""

import requests
from bs4 import BeautifulSoup
import json
import os

# Map of jupas paths to our university codes
sites = [
    ("hku", "https://www.jupas.edu.hk/en/programme/hku/"),
    ("hkust", "https://www.jupas.edu.hk/en/programme/hkust/"),
    ("cityu", "https://www.jupas.edu.hk/en/programme/cityuhk/"),
    ("cuhk", "https://www.jupas.edu.hk/en/programme/cuhk/"),
    ("hkbu", "https://www.jupas.edu.hk/en/programme/hkbu/"),
    ("eduhk", "https://www.jupas.edu.hk/en/programme/eduhk/"),
    ("lingnan", "https://www.jupas.edu.hk/en/programme/lingnanu/"),
    ("polyu", "https://www.jupas.edu.hk/en/programme/polyu/"),
    ("hkmu", "https://www.jupas.edu.hk/en/programme/hkmu/"),
]

out = []

for code, url in sites:
    try:
        r = requests.get(url, timeout=15)
        r.encoding = 'utf-8'
        soup = BeautifulSoup(r.text, 'html.parser')
        programs = soup.find_all(attrs={'class': 'c-ft'})
        names = []
        for c in programs:
            title = c.find(string=True, recursive=False)
            if title:
                names.append(title.strip())
        # often first entry is header, drop if it looks like header
        if names and len(names) > 0:
            # remove first if duplicate of heading
            if len(names) > 1 and names[0].lower().startswith('programme'):
                names = names[1:]
        for n in names:
            out.append({"university": code, "program": n})
        print(f"{code}: scraped {len(names)} programs")
    except Exception as e:
        print(f"Failed to scrape {code}: {e}")

os.makedirs('data', exist_ok=True)
with open('data/programs_seed.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print('Wrote data/programs_seed.json')




