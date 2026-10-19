"""Package the static game into the user's single HTML deliverable."""
from pathlib import Path
import base64
import re

root = Path(__file__).resolve().parent.parent
base = root / 'work' / 'noc-eksponatow' / 'dist'
page = (base / 'index.html').read_text()
page = re.sub(r'<link rel="stylesheet" href="style\.css(?:\?[^\"]*)?">', lambda _: '<style>' + (base / 'style.css').read_text() + '</style>', page)
advert = 'data:image/png;base64,' + base64.b64encode((base / 'assets' / 'kustosz-reklama.png').read_bytes()).decode()
scripts = ['knights.js', 'perks.js', 'weapons.js', 'exhibits.js', 'levels.js', 'art.js', 'game.js', 'loot.js', 'shop.js', 'loot-show.js', 'ui.js']
for name in scripts:
    attributes = ' data-sponsor-image="' + advert + '"' if name == 'art.js' else ''
    code = (base / name).read_text().replace('</script', '<\\/script')
    pattern = r'<script src="' + re.escape(name) + r'(?:\?[^\"]*)?"></script>'
    page = re.sub(pattern, lambda _: '<script' + attributes + '>' + code + '</script>', page)
output = root / 'outputs' / 'Noc-Eksponatow.html'
output.write_text(page)
print(f'Gotowy HTML: {output.stat().st_size} bajtów')
