"""Package the static game into the user's single HTML deliverable."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
base = root / 'work' / 'noc-eksponatow' / 'dist'
page = (base / 'index.html').read_text()
page = re.sub(r'<link rel="stylesheet" href="style\.css(?:\?[^\"]*)?">', lambda _: '<style>' + (base / 'style.css').read_text() + '</style>', page)
scripts = ['config.js', 'cloud.js', 'knights.js', 'perks.js', 'weapons.js', 'finishes.js', 'exhibits.js', 'twists.js', 'levels.js', 'trivia.js', 'cards.js', 'hall.js', 'art.js', 'pixel.js', 'game.js', 'loot.js', 'secret.js', 'shop.js', 'loot-show.js', 'ui.js']
for name in scripts:
    code = (base / name).read_text().replace('</script', '<\\/script')
    pattern = r'<script src="' + re.escape(name) + r'(?:\?[^\"]*)?"></script>'
    page = re.sub(pattern, lambda _: '<script>' + code + '</script>', page)
output = root / 'outputs' / 'Noc-Eksponatow.html'
output.write_text(page)
print(f'Gotowy HTML: {output.stat().st_size} bajtów')
