# -*- coding: utf-8 -*-
"""Kustosz.xyz — prezentacja PowerPoint. Ciemny motyw gry (limonka, złoto, krem), pikselowe zrzuty z folderu img/."""
import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree
from PIL import Image, ImageFont
_FONTS = {}
def _font(size, bold=False):
    key = (size, bold)
    if key not in _FONTS:
        path = '/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Arial.ttf'
        _FONTS[key] = ImageFont.truetype(path, int(size * 10))
    return _FONTS[key]
def wrapped_lines(text, size, width_pt, head=''):
    """How many lines Arial text takes in a box width_pt wide (measured with the real font, 10x for precision)."""
    f = _font(size); fb = _font(size, True); limit = width_pt * 10
    words = text.split(); lines = 1; cur = fb.getlength(head + '  ') if head else 0
    for w in words:
        ww = f.getlength(w + ' ')
        if cur + ww > limit and cur > 0: lines += 1; cur = ww
        else: cur += ww
    return lines

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, 'img')
OUT = os.path.join(HERE, 'Kustosz-xyz-prezentacja.pptx')

BG, PANEL, LINE = RGBColor(0x10, 0x12, 0x0F), RGBColor(0x17, 0x1A, 0x15), RGBColor(0x34, 0x38, 0x2C)
LIME, CREAM, MUTED, GOLD, RED = RGBColor(0xD5, 0xED, 0x71), RGBColor(0xEE, 0xEE, 0xE0), RGBColor(0x92, 0x99, 0x8B), RGBColor(0xD5, 0xB8, 0x78), RGBColor(0xB3, 0x20, 0x2A)
DARK, INK = RGBColor(0x0D, 0x12, 0x0C), RGBColor(0x18, 0x20, 0x0F)
HEAD, BODY = 'Arial Black', 'Arial'
W, H = Inches(13.333), Inches(7.5)
M = Inches(0.6)   # margin

prs = Presentation()
prs.slide_width, prs.slide_height = W, H
BLANK = prs.slide_layouts[6]
slide_no = 0


def set_alpha(shape, pct):
    """Transparency on a solid fill (pct 0-100)."""
    sf = shape.fill._xPr.find(qn('a:solidFill'))
    clr = sf[0]
    for el in clr.findall(qn('a:alpha')):
        clr.remove(el)
    a = etree.SubElement(clr, qn('a:alpha'))
    a.set('val', str(int((100 - pct) * 1000)))


def rect(slide, x, y, w, h, fill=PANEL, line=LINE, lw=0.75, shape=MSO_SHAPE.RECTANGLE):
    s = slide.shapes.add_shape(shape, x, y, w, h)
    s.shadow.inherit = False
    if fill is None:
        s.fill.background()
    else:
        s.fill.solid(); s.fill.fore_color.rgb = fill
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line; s.line.width = Pt(lw)
    return s


def tb(slide, x, y, w, h, runs, size=14, color=CREAM, font=BODY, bold=False, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spc=None, line_spacing=None, margin=0):
    """Text box. `runs` is a string, or a list of paragraphs; a paragraph is a string or a list of (text, opts) runs."""
    box = slide.shapes.add_textbox(x, y, w, h)
    tf = box.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Emu(margin)
    paras = runs if isinstance(runs, list) else [runs]
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        if line_spacing: p.line_spacing = line_spacing
        pieces = para if isinstance(para, list) else [(para, {})]
        for text, opts in pieces:
            r = p.add_run(); r.text = text
            f = r.font; f.name = opts.get('font', font); f.size = Pt(opts.get('size', size)); f.bold = opts.get('bold', bold)
            f.color.rgb = opts.get('color', color)
            sp = opts.get('spc', spc)
            if sp is not None: r.font._element.set('spc', str(sp))
    return box


def eyebrow(slide, x, y, w, text, color=LIME):
    return tb(slide, x, y, w, Inches(0.3), text.upper(), size=9, color=color, bold=True, spc=300)


def title(slide, text, y=Inches(0.75), size=30, x=M, w=W - 2 * M, color=CREAM):
    return tb(slide, x, y, w, Inches(0.9), text, size=size, color=color, font=HEAD, anchor=MSO_ANCHOR.TOP)


def chrome(slide, label):
    """Background and the footer strip of every content slide."""
    global slide_no
    slide_no += 1
    slide.background.fill.solid(); slide.background.fill.fore_color.rgb = BG
    tb(slide, M, H - Inches(0.5), Inches(6), Inches(0.3), 'KUSTOSZ.XYZ  ·  ' + label.upper(), size=8, color=MUTED, bold=True, spc=250)
    tb(slide, W - M - Inches(1.5), H - Inches(0.5), Inches(1.5), Inches(0.3), '%02d' % slide_no, size=8, color=MUTED, bold=True, align=PP_ALIGN.RIGHT, spc=250)


def picture(slide, name, x, y, w=None, h=None, border=True, crop_top=0.0, crop_bottom=0.0):
    path = os.path.join(IMG, name)
    iw, ih = Image.open(path).size
    ih_eff = ih * (1 - crop_top - crop_bottom)
    if w is not None and h is None: h = int(w * ih_eff / iw)
    if h is not None and w is None: w = int(h * iw / ih_eff)
    pic = slide.shapes.add_picture(path, x, y, width=w, height=h)
    if crop_top: pic.crop_top = crop_top
    if crop_bottom: pic.crop_bottom = crop_bottom
    if border:
        pic.line.color.rgb = LINE; pic.line.width = Pt(0.75)
    return pic


def framed(slide, name, x, y, w=None, h=None, label=None, crop_top=0.0, crop_bottom=0.0):
    """Screenshot with the game's eyebrow label above it."""
    if label:
        eyebrow(slide, x, y - Inches(0.3), Inches(6), label, color=MUTED)
    return picture(slide, name, x, y, w, h, crop_top=crop_top, crop_bottom=crop_bottom)


def pixels(slide, x, y, w, text, size=12, color=CREAM, head=None, para_gap=4):
    """Rows with a small lime square in front (the game's pixel bullet)."""
    cy = y
    rows = text if isinstance(text, list) else [text]
    for row in rows:
        rect(slide, x, cy + Inches(0.09), Inches(0.1), Inches(0.1), fill=LIME, line=None)
        if isinstance(row, tuple):
            head_t, body_t = row
            box = tb(slide, x + Inches(0.25), cy, w - Inches(0.25), Inches(1.2), [[(head_t + '  ', {'bold': True, 'color': LIME}), (body_t, {})]], size=size, color=color)
        else:
            box = tb(slide, x + Inches(0.25), cy, w - Inches(0.25), Inches(1.2), row, size=size, color=color)
        # estimate height: characters per line at this width
        width_pt = (w - Inches(0.25)) / Inches(1) * 72 - 2
        lines = wrapped_lines(row[1], size, width_pt, row[0]) if isinstance(row, tuple) else wrapped_lines(row, size, width_pt)
        cy += Pt(size * 1.35) * lines + Pt(para_gap)
    return cy


def card(slide, x, y, w, h, head, body, accent=LIME, size=11):
    rect(slide, x, y, w, h)
    tb(slide, x + Inches(0.2), y + Inches(0.18), w - Inches(0.4), Inches(0.4), head.upper(), size=9, color=accent, bold=True, spc=200)
    tb(slide, x + Inches(0.2), y + Inches(0.55), w - Inches(0.4), h - Inches(0.7), body, size=size, color=CREAM, line_spacing=1.15)


def stat(slide, x, y, w, number, label, color=GOLD):
    tb(slide, x, y, w, Inches(0.8), number, size=36, color=color, font=HEAD)
    tb(slide, x, y + Inches(0.78), w, Inches(0.4), label.upper(), size=8, color=MUTED, bold=True, spc=200)


# ───────────────────────────── 1. Tytuł ─────────────────────────────
s = prs.slides.add_slide(BLANK)
s.background.fill.solid(); s.background.fill.fore_color.rgb = BG
pic = s.shapes.add_picture(os.path.join(IMG, 'arena-fight.jpg'), 0, 0, width=W, height=W * 1620 // 2880)
pic.top = int((H - pic.height) / 2)
ov = rect(s, 0, 0, W, H, fill=BG, line=None); set_alpha(ov, 68)
ov2 = rect(s, 0, 0, Inches(6.9), H, fill=BG, line=None); set_alpha(ov2, 35)
eyebrow(s, M, Inches(1.5), Inches(8), 'Muzeum po godzinach  ·  gra przeglądarkowa')
tb(s, M, Inches(1.9), Inches(8), Inches(2.4), [[('KUSTOSZ', {'color': LIME}), ('.XYZ', {'color': CREAM})]], size=66, font=HEAD)
tb(s, M, Inches(3.35), Inches(7.2), Inches(1.6), 'Historia pisze się po zmroku. Nocny stróż kontra 50 bossów z dziejów świata, kasyno Kustosza i komornik, który podbiera skiny.', size=18, color=CREAM, line_spacing=1.2)
tb(s, M, Inches(5.1), Inches(7), Inches(0.5), 'kustosz.xyz  ·  pixel art  ·  zero instalacji', size=12, color=GOLD, bold=True, spc=150)
tb(s, M, H - Inches(0.75), Inches(8), Inches(0.3), 'AFTER DARK STUDIO  ·  2026', size=9, color=MUTED, bold=True, spc=250)

# ───────────────────────────── 2. Co to jest ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'o grze')
eyebrow(s, M, Inches(0.5), Inches(8), 'W jednym zdaniu')
title(s, 'Gra 2D o nocnym stróżu, który walczy z historią')
tb(s, M, Inches(1.75), Inches(5.6), Inches(2.6), [
    'Stróż muzeum zasypia na zmianie i śni, że eksponaty ożywają. Każda sala to inna epoka i inny przeciwnik: od Velociraptora i T-rexa, przez Leonidasa i Napoleona, po tyranów XX wieku. Na końcu obchodu czeka piekło i Belzebub.',
    'Działa w przeglądarce bez instalacji, na komputerze i telefonie. Postęp zapisuje się lokalnie, a po założeniu konta w chmurze z rankingiem.'], size=13, color=CREAM, line_spacing=1.25)
y = Inches(4.55)
stat(s, M, y, Inches(1.7), '51', 'sal obchodu')
stat(s, M + Inches(1.8), y, Inches(1.7), '251', 'broni')
stat(s, M + Inches(3.6), y, Inches(1.7), '388', 'wykończeń')
stat(s, M, y + Inches(1.35), Inches(1.7), '32', 'skrzynie')
stat(s, M + Inches(1.8), y + Inches(1.35), Inches(1.7), '16', 'automatów')
stat(s, M + Inches(3.6), y + Inches(1.35), Inches(1.7), '0 zł', 'do grania')
framed(s, '01-menu.jpg', Inches(6.6), Inches(1.95), w=Inches(6.1), label='Ekran główny · arena', crop_bottom=0.08)

# ───────────────────────────── 3. Fabuła i klimat ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'fabuła')
eyebrow(s, M, Inches(0.5), Inches(8), 'Fabuła i klimat')
title(s, 'Noc w muzeum, które nie powinno się obudzić')
pixels(s, M, Inches(1.8), Inches(5.9), [
    ('Prolog', '18-sekundowa scenka w pokoju stróża: biurko, żaluzje, puszka Kustosza. Potem gaśnie światło.'),
    ('Obchód', 'Jeden poziom to jedna epoka i jeden przeciwnik. Między salami przeskok w czasie: rok przewija się, sceneria zmienia się w błysku.'),
    ('Bossowie', '50 postaci z historii, wyłącznie tyrani, zbrodniarze i bandyci, w kolejności chronologicznej: od Kserksesa po Kaddafiego.'),
    ('Finał', 'Sala 51: piekło poza czasem. Belzebub z miniguną, 380 HP, lawa w podłodze i sztandary 666.'),
    ('Epilog', 'Przegrana albo koniec obchodu to pobudka: „To był tylko sen”. Wyniki nocy i żetony zostają.')], size=12)
framed(s, '04-epilog.jpg', Inches(6.9), Inches(1.95), w=Inches(5.8), label='Epilog · pokój stróża', crop_top=0.2, crop_bottom=0.12)

# ───────────────────────────── 4. Walka ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'walka')
eyebrow(s, M, Inches(0.5), Inches(8), 'Mechanika walki')
title(s, 'Pojedynek: timing ważniejszy niż ostry miecz')
picture(s, 'arena-attack.jpg', M, Inches(1.85), w=Inches(7.0))
cx = Inches(7.9)
pixels(s, cx, Inches(1.85), Inches(4.85), [
    ('Sterowanie', 'A/D ruch, J atak, K parada, L unik, Esc pauza. Na telefonie przyciski dotykowe.'),
    ('Energia', 'Każdy cios, blok i unik kosztuje wytrzymałość. Seria ciosów bronią białą regeneruje ją szybciej.'),
    ('Parada', 'Zwykły blok przepuszcza część obrażeń. Perfekcyjna parada w krótkim oknie zeruje je i odbija w atakującego.'),
    ('Słaba garda', 'Po własnym ciosie przeciwnik ma okno słabej gardy: wtedy trafienia bolą najbardziej.'),
    ('Cios presji', 'Trafienie idącego wroga to odrzut i chwianie. Lekki zamach da się przerwać, ciężkiego nigdy.'),
    ('Czytanie wroga', 'Boss zapowiada atak znakiem nad głową; HUD podpowiada: „ciężki atak, zaczekaj na błysk”.')], size=11)

# ───────────────────────────── 5. Presja i urozmaicenie ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'walka')
eyebrow(s, M, Inches(0.5), Inches(8), 'Trudność rosnąca z salą')
title(s, 'Presja, warunki sal i archetypy bossów')
card(s, M, Inches(1.8), Inches(3.95), Inches(2.55), 'Presja', 'Od sali 2 rośnie do pełnej w sali 12: boss ma do 30 % więcej HP, ciosy bolą do 50 % więcej, okno perfekcyjnej parady kurczy się do 30 %, a odruchowy unik bez gardy znika. Tylko perfekcyjna parada zeruje obrażenia.')
card(s, M + Inches(4.1), Inches(1.8), Inches(3.95), Inches(2.55), 'Warunki sal', 'Od czwartej sali każda ma warunek: ZASADZKA (boss startuje blisko), SZAŁ (szybsze zamachy), ŻELAZNA GARDA, SZKLANE OSTRZA (×1,5 obrażeń dla obu), MARATON (+40 % HP bossa), CIEMNA SALA (przyciemniona arena).')
card(s, M + Inches(8.2), Inches(1.8), Inches(3.95), Inches(2.55), 'Archetypy', 'Tyran (wyważony), osiłek (wolny, ciężki co drugi cios), pojedynkowicz (szybki), trickster (lekkie ciosy bez ostrzeżenia), strzelec (pistolet lub karabin z bliska). Od sali 4 dochodzą zagrania: finta, podwójny cios, seria.')
framed(s, '03c-walka-ciezki.jpg', M, Inches(4.75), w=Inches(5.0), label='HUD ostrzega przed ciężkim atakiem', crop_top=0.27, crop_bottom=0.15)
pixels(s, Inches(5.9), Inches(4.75), Inches(6.9), [
    ('Pauza', 'Karta przeciwnika: epoka, biogram, styl walki wyliczony z jego profilu, obrażenia, HP i nagroda za salę.'),
    ('Nagroda', 'Żetony za salę rosną z numerem (120 + 15 za salę) plus 20 za każdą perfekcyjną paradę. Przegrana daje 40.'),
    ('Po wygranej', 'Wybór: KOLEJNA SALA (przeskok w czasie) albo MENU. Postęp i żetony są już wtedy zapisane.')], size=11)

# ───────────────────────────── 6. Sale i bossowie ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'sale')
eyebrow(s, M, Inches(0.5), Inches(8), 'Obchód')
title(s, '51 sal, każda z własnym bossem i scenerią')
framed(s, '02-karta-sali.jpg', M, Inches(1.95), w=Inches(6.4), label='Karta sali przed walką', crop_top=0.25, crop_bottom=0.13)
pixels(s, Inches(7.1), Inches(1.85), Inches(5.6), [
    ('Chronologia', 'Lista sortuje się po roku: 75 mln lat temu, Termopile 480 p.n.e., Rzym, Mongołowie, Borgia, piraci, rewolucja, XX wiek, 2011. Nowe sale wskakują w środek historii.'),
    ('Scenerie', '20+ motywów: muzeum, Sparta, Kreml, bunkier, Azteków, speakeasy, dżungla, Pjongjang, piekło. Okna, sztandary, cząsteczki i tabliczka nad drzwiami zależą od epoki.'),
    ('Biogramy', 'Każdy boss ma kartę z prawdziwym życiorysem i aliasem w dopełniaczu, więc podpowiedzi w walce odmieniają imię poprawnie.'),
    ('Trofea', 'Jedno limitowane trofeum za każdą pokonaną salę. Nie ma ich w skrzyniach, nie da się ich kupić ani sprzedać.'),
    ('Rig postaci', 'Jeden pikselowy rig człowieka ubiera wszystkich 34+ bossów: 16 nakryć głowy, brody, zbroje, peleryny, 8 broni w dłoni.')], size=11)

# ───────────────────────────── 7. Postacie ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'postacie')
eyebrow(s, M, Inches(0.5), Inches(8), 'Grywalne postacie')
title(s, 'Stroje, bohaterowie i ukryte pakiety na kod')
pixels(s, M, Inches(1.85), Inches(5.9), [
    ('Kolekcja', '7 strojów bazowych, 50 strojów w czterech rzadkościach, 27 postaci z historii (Aleksander, Kleopatra, Zawisza, Joanna d’Arc, Sobieski, Churchill, Gagarin) i prezent: Stachu Jones.'),
    ('Zdolności', 'Każdy strój ma jeden perk: +HP, dłuższe okno parady, mniej obrażeń, szybsza regeneracja, tańsze bloki, leczenie za perfekcyjną paradę. Aktywny jest tylko założony.'),
    ('Karty', '33 karty bohaterów z pasywnym bonusem i 20 kart broni, które działają automatycznie przy pasującej broni.'),
    ('Ulepszenia', 'Pięć poziomów: strój +6 HP, broń +8 % obrażeń. Ulepszenia nie giną przy aktualizacjach.'),
    ('Ukryte pakiety', 'Kody dostępu odblokowują postacie specjalne z własnym rigiem i zdolnościami. Pakiety są zaszyfrowane, kod zna tylko ten, kto ma go znać.')], size=11)
framed(s, '05b-kolekcja-karty.jpg', Inches(7.0), Inches(1.95), w=Inches(5.7), label='Karty strojów w kolekcji', crop_top=0.05, crop_bottom=0.06)

# ───────────────────────────── 8. Broń i wykończenia ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'broń')
eyebrow(s, M, Inches(0.5), Inches(8), 'Arsenał')
title(s, '251 broni w siedmiu typach i 388 wykończeń')
framed(s, '07-wykonczenia.jpg', M, Inches(1.95), w=Inches(5.6), label='Sklep · wykończenia broni', crop_top=0.24)
pixels(s, Inches(6.5), Inches(1.85), Inches(6.2), [
    ('Typy', 'Ostrza, broń ciężka, drzewcowa, noże, łuki, pistolety i karabiny, w pięciu epokach. Każda broń ma zasięg, koszt energii, czas zamachu, obrażenia w słabą gardę i odbicie parady.'),
    ('Dystans', 'Rewolwer ma 6 naboi na walkę, trafia tylko w osłabioną gardę, a po wystrzelaniu bębna przeładowuje się 1,6 s. Karabiny i snajperki mają własne glify i pozy.'),
    ('Serie', 'Broń biała ma krótkie odstępy po ciosie i tańsze uderzenia, więc da się ciąć ciągiem, jeśli przeciwnik na to pozwoli.'),
    ('Wykończenia', '388 powłok w pięciu rzadkościach: farby, metale, klejnoty, marmur, damast, obsydian, hologram z przesuwającą się tęczą. Widać je na broni w ręce rycerza w każdej pozie.'),
    ('Mityczne', 'Nigdy niegwarantowane. Najwyższa szansa 3 % w Sejfie Kolekcjonera, w innych skrzyniach domieszka 0,35–1,2 %. Osobno kupowane z salda za 499–3499 zł.')], size=11)

# ───────────────────────────── 9. Ekonomia i skrzynie ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'ekonomia')
eyebrow(s, M, Inches(0.5), Inches(8), 'Ekonomia')
title(s, 'Żetony, saldo demo i 32 skrzynie bez duplikatów')
framed(s, '06-sklep-skrzynie.jpg', M, Inches(1.95), w=Inches(4.9), label='Sklep · katalog skrzyń', crop_top=0.17, crop_bottom=0.08)
framed(s, '16-losowanie.jpg', M, Inches(5.35), w=Inches(2.35), label='Losowanie', crop_top=0.28, crop_bottom=0.2)
framed(s, '17-nowy-eksponat.jpg', M + Inches(2.55), Inches(5.35), w=Inches(2.35), label='Odsłonięcie', crop_top=0.3, crop_bottom=0.05)
pixels(s, Inches(6.1), Inches(1.85), Inches(6.6), [
    ('Dwie waluty', 'Żetony ✦ zdobywasz w walkach, z bonusu dziennego (50 ✦ +25 za dzień serii, do 300) i bonusu powitalnego. Saldo w zł jest demo: wpłaty są symulowane, płatności nie są podpięte.'),
    ('Skrzynie', '32 skrzynie: klasyczne, motywy, broń, karty, mieszane, bohaterowie, limitowane. Szanse widoczne przed otwarciem, brak duplikatów, nagroda zapisana przed animacją.'),
    ('Losowanie', 'Pieczęć, 6,5 s przewijania z wyhamowaniem, odsłonięcie. OTWÓRZ PONOWNIE kręci następne losowanie bez zamykania okna.'),
    ('Rynek', 'Sprzedaż za 40 % wartości (wykończenia odkup 75 % ceny), ulepszanie 250 + 350 za poziom, sezony i promocje czasowe (Halloween: Dynia i Krypta Kustosza −40 %).'),
    ('Bez limitów', 'Saldo i żetony nie mają górnej granicy, a saldo może zejść w debet: komornik i napady potrafią wpisać minus.')], size=11)

# ───────────────────────────── 10. Kolekcja i Moja Sala ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'kolekcja')
eyebrow(s, M, Inches(0.5), Inches(8), 'Twoje muzeum')
title(s, 'Kolekcja i prywatna sala wystawowa')
framed(s, '15-moja-sala.jpg', M, Inches(1.95), w=Inches(6.6), label='Moja Sala · ekspozycja gracza', crop_top=0.06)
pixels(s, Inches(7.5), Inches(1.85), Inches(5.2), [
    ('Kolekcja', 'Zakładki STROJE / BROŃ / KARTY / WYKOŃCZENIA, wyszukiwarka ignorująca polskie znaki, filtry rzadkości i posiadania, strony po 12.'),
    ('Osiem miejsc', 'Dwa postumenty na zbroje, dwa wieszaki na broń, dwie ramy na karty, dwie gabloty na trofea. Sprzedany przedmiot znika z ekspozycji.'),
    ('Prestiż', 'Punkty za rzadkość wystawionych przedmiotów i poziomy ulepszeń, +20 za pełną salę. Prestiż liczy się w rankingu.'),
    ('Nazwa sali', 'Własna nazwa nad wejściem, do 28 znaków. Sala jest rysowana tą samą pikselową salą co arena.')], size=11)

# ───────────────────────────── 11. Kasyno: ruletka ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'kasyno')
eyebrow(s, M, Inches(0.5), Inches(8), 'Kasyno Kustosza · 1/4')
title(s, 'Ruletka: czerwone, czarne albo Kustosz')
framed(s, '09-ruletka.jpg', M, Inches(1.95), w=Inches(7.0), label='Zakładka RULETKA w sklepie', crop_top=0.24)
pixels(s, Inches(7.9), Inches(1.85), Inches(4.8), [
    ('Pasek 15 pól', '7 czerwonych, 7 czarnych i jedno zielone pole Kustosza. Czerwone i czarne płacą ×2, zielone ×14. Dom ma 6,7 % przewagi.'),
    ('Stawka', 'Żetony albo saldo, od 10 ✦ lub 1 zł do wszystkiego, co masz. Bez górnego limitu.'),
    ('Uczciwie', 'Stawka schodzi od razu, wygrana parkuje się w profilu i wchodzi po zatrzymaniu paska albo przy następnym wejściu. Odświeżenie nic nie daje.'),
    ('Dźwięk', 'Miękkie tykanie zwalnia razem z paskiem, wygrana to trzy dzwonki.')], size=11)

# ───────────────────────────── 12. Kasyno: automaty ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'kasyno')
eyebrow(s, M, Inches(0.5), Inches(8), 'Kasyno Kustosza · 2/4')
title(s, 'Szesnaście automatów, sześć rodzajów premii')
framed(s, '10-automaty.jpg', M, Inches(1.95), w=Inches(5.6), label='Wybór szafy', crop_top=0.24, crop_bottom=0.22)
framed(s, 'slots-zloto.png', M, Inches(4.75), h=Inches(1.9), label='Szafa ZŁOTO na jednym canvasie')
cx = Inches(6.5)
pixels(s, cx, Inches(1.85), Inches(6.2), [
    ('Jeden silnik', 'Każda szafa to własne bębny 16 pól, symbole 16×16 px, kolory, tabela i premia. Kufel Kustosza, Browar, Krypta, Sala Tronowa, Piekło, Siódemki, Klejnoty, Zbrojownia, Kreda, Kosmos, Piraci, Kaplica, Noc w Muzeum, Owoce, Bunkier, Złoto.'),
    ('Premie', 'Dziki symbol, scatter (płaci gdziekolwiek), pary, mnożnik na środkowym bębnie, darmowe obroty, rosnąca pula zasilana z każdej stawki.'),
    ('Policzony zwrot', 'Zwrot każdej maszyny wyliczony z wszystkich 4096 kombinacji: 88–94 %. Test pilnuje, żeby zmiana tabeli nie wyszła za chciwie ani za hojnie.'),
    ('Autospin', '10/25/50/100 obrotów, STOP w każdej chwili, zatrzymuje się sam bez środków. Wajcha, terkot bębnów i stuk przy zatrzymaniu.')], size=11)

# ───────────────────────────── 13. Pożyczka i komornik ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'kasyno')
eyebrow(s, M, Inches(0.5), Inches(8), 'Kasyno Kustosza · 3/4')
title(s, 'Pożyczka Kustosza i komornik, który podbiera skiny')
framed(s, '12-pozyczka.jpg', M, Inches(1.95), w=Inches(6.2), label='Zakładka POŻYCZKA', crop_top=0.24)
picture(s, 'bailiff.png', Inches(11.3), Inches(1.95), w=Inches(1.4), border=False)
pixels(s, Inches(7.1), Inches(1.85), Inches(4.0), [
    ('Suwaki', 'Kwota 10–1000 zł albo 100–50 000 ✦, 2–10 rat, tempo raz, dwa lub trzy razy dziennie. Odsetki 20/15/10 %: szybciej znaczy taniej.'),
    ('Raty same', 'Schodzą z konta, kiedy przyjdzie ich czas: przy starcie gry, przy wczytaniu z chmury i co 30 s w tle.')], size=11)
pixels(s, Inches(7.1), Inches(3.9), Inches(5.6), [
    ('Komornik', 'Nie ma z czego zapłacić? Zabiera najcenniejszy sprzedawalny przedmiot po cenie skupu i zalicza go na poczet długu. Lista zajęć zostaje w profilu.'),
    ('Debet', 'Kiedy kolekcja jest pusta, rata idzie w minus na saldzie. Z debetu wychodzi się wpłatą, wygraną w zł albo korektą moderatora.')], size=11)

# ───────────────────────────── 14. Napad i ochrona ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'kasyno')
eyebrow(s, M, Inches(0.5), Inches(8), 'Kasyno Kustosza · 4/4')
title(s, 'Napad na gracza z rankingu i abonament ochrony')
framed(s, '13-napad.jpg', M, Inches(1.95), w=Inches(5.4), label='Panel napadu pod rankingiem', crop_top=0.17, crop_bottom=0.15)
framed(s, '08-portfel-ochrona.jpg', M, Inches(5.25), w=Inches(5.4), label='Ochrona w portfelu', crop_top=0.56, crop_bottom=0.22)
pixels(s, Inches(6.4), Inches(1.85), Inches(6.3), [
    ('OKRADNIJ', 'Przy każdym graczu w rankingu. Wybierasz żetony albo saldo i kwotę do 25 % jego majątku. Jeden napad na 10 minut.'),
    ('Szansa', 'Bez ochrony 90 % przy małym łupie, spada do 60 % przy maksymalnym. Przy pudle nic nie tracisz, stróż nocny cię spłoszył.'),
    ('Serwer losuje', 'Wynik rozstrzyga Supabase: cudze konto zmienia się tylko przez oczekujące korekty, więc klient nie może oszukać.'),
    ('Ochrona', 'Abonament 10 000 ✦ albo 20 000 zł dziennie, pobierany przez serwer także gdy nie grasz. Jak nie ma z czego, wygasa i znów można cię okraść.'),
    ('Kara', 'Napad na chronionego nie wychodzi, a napastnik płaci ofierze to, po co szedł, do 20 % własnego konta. Ofiara widzi toast z nazwiskiem napastnika.')], size=11)

# ───────────────────────────── 15. Konto, chmura, społeczność ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'online')
eyebrow(s, M, Inches(0.5), Inches(8), 'Online')
title(s, 'Konto, zapis w chmurze, ranking i moderacja')
framed(s, '14-ranking.jpg', M, Inches(1.95), w=Inches(5.6), label='Tablica wyników z rangami', crop_top=0.06, crop_bottom=0.04)
pixels(s, Inches(6.5), Inches(1.85), Inches(6.2), [
    ('Gość albo konto', 'Gra działa bez konta. Logowanie e-mail + hasło przez Supabase daje zapis w chmurze, ranking, bonus dzienny i powitalny: 1000 ✦ i 50 zł.'),
    ('Ranking', 'Pokonane sale, prestiż sali, najszybsza noc. Rangi honorowe: OWNER, FIRST TO ARRIVE, FOUNDER, VETERAN, PATRON, MECENAS, DEMON SLAYER.'),
    ('Ogłoszenia', 'Moderator wysyła komunikaty na żywo przez Realtime: info, wydarzenie, ostrzeżenie, sponsorowane. Ticker widzą wszyscy.'),
    ('Panel moderatora', 'Statystyki, lista graczy, korekty żetonów i salda, bany, reset zapisu, role, rangi, tryb serwisowy „PRACE SERWISOWE”.'),
    ('Bezpieczeństwo', 'Row Level Security, uprawnienia sprawdza serwer, hasła odzyskiwane mailem, zbanowany nie zapisze w chmurze.')], size=11)

# ───────────────────────────── 16. Technologia ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'technologia')
eyebrow(s, M, Inches(0.5), Inches(8), 'Pod maską')
title(s, 'Czysty JavaScript, canvas i pixel art bez bibliotek')
cw, ch = Inches(3.95), Inches(2.35)
card(s, M, Inches(1.8), cw, ch, 'Silnik', 'Własny silnik walki na canvasie: stany, timery, hitstop, cząsteczki, etykiety. Przeciwnik i broń są danymi, nie kodem walki. Wszystko w jednym repozytorium statycznych plików.')
card(s, M + cw + Inches(0.15), Inches(1.8), cw, ch, 'Pixel art', 'Scena 288×162 px powiększana ×5 bez wygładzania. Kafle Kenney Tiny Dungeon (CC0) plus własne sprite’y z warstw tekstowych: rycerz, bossowie, broń, skrzynie, szafy automatów, komornik.')
card(s, M + 2 * (cw + Inches(0.15)), Inches(1.8), cw, ch, 'Dźwięk', 'Syntezator Web Audio: uderzenia, parady, ruletka, automaty. Żadnych plików audio. Przełącznik dźwięku wycisza wszystko.')
card(s, M, Inches(4.35), cw, ch, 'Backend', 'Supabase: Postgres, auth, Row Level Security, funkcje RPC do rankingu, korekt, napadów i abonamentu. Realtime do ogłoszeń. Gość działa w 100 % offline.')
card(s, M + cw + Inches(0.15), Inches(4.35), cw, ch, 'Publikacja', 'GitHub Pages z folderu dist przy każdym pushu, własna domena kustosz.xyz, cache-busting wersją w adresach skryptów. 166 wydań od 19 października.')
card(s, M + 2 * (cw + Inches(0.15)), Inches(4.35), cw, ch, 'Testy', '108 testów uruchamianych w przeglądarce bez Node: walka, poziomy, ekonomia, sala, ruletka, 16 automatów (zwrot z 4096 kombinacji), pożyczka, napad.')

# ───────────────────────────── 17. Liczby ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'liczby')
eyebrow(s, M, Inches(0.5), Inches(8), 'Kustosz w liczbach')
title(s, 'Stan na listopad 2026')
nums = [('51', 'sal obchodu'), ('50', 'bossów z historii'), ('85', 'grywalnych strojów'), ('251', 'broni'),
        ('388', 'wykończeń'), ('32', 'skrzynie'), ('53', 'karty'), ('16', 'automatów'),
        ('108', 'testów'), ('166', 'wydań'), ('20+', 'scenerii'), ('1', 'Belzebub')]
for i, (n, l) in enumerate(nums):
    col, row = i % 4, i // 4
    x = M + col * Inches(3.1); y = Inches(1.9) + row * Inches(1.75)
    rect(s, x, y, Inches(2.9), Inches(1.55))
    tb(s, x + Inches(0.2), y + Inches(0.15), Inches(2.5), Inches(0.9), n, size=40, color=GOLD if i % 4 != 3 else LIME, font=HEAD)
    tb(s, x + Inches(0.2), y + Inches(1.05), Inches(2.5), Inches(0.4), l.upper(), size=8, color=MUTED, bold=True, spc=200)

# ───────────────────────────── 18. Co dalej ─────────────────────────────
s = prs.slides.add_slide(BLANK); chrome(s, 'plan')
eyebrow(s, M, Inches(0.5), Inches(8), 'Co dalej')
title(s, 'Plan na kolejne noce')
pixels(s, M, Inches(1.85), Inches(6.0), [
    ('Płatności', 'Operator płatności i serwerowe zamówienia: ceny w zł przestają być zapowiedzią.'),
    ('Ekonomia po stronie serwera', 'Żetony i saldo liczone w bazie, żeby nikt nie dopisał sobie zer w przeglądarce.'),
    ('Sezony', 'Po Halloween zima: stroje, skrzynia i automat na Boże Narodzenie, kolejne promocje czasowe.'),
    ('Więcej kasyna', 'Turnieje automatów, pula wspólna dla wszystkich graczy, historia napadów w profilu.'),
    ('Mobile', 'Lepsze sterowanie dotykowe i instalacja jako aplikacja z ekranu głównego.')], size=12)
framed(s, '03b-walka-trex.jpg', Inches(6.9), Inches(1.95), w=Inches(5.8), label='Sala 02 · T-rex', crop_top=0.25, crop_bottom=0.13)

# ───────────────────────────── 19. Zakończenie ─────────────────────────────
s = prs.slides.add_slide(BLANK)
s.background.fill.solid(); s.background.fill.fore_color.rgb = BG
pic = s.shapes.add_picture(os.path.join(IMG, 'arena-menu.jpg'), 0, 0, width=W, height=W * 810 // 1440)
pic.top = int((H - pic.height) / 2)
ov = rect(s, 0, 0, W, H, fill=BG, line=None); set_alpha(ov, 22)
tb(s, M, Inches(2.4), W - 2 * M, Inches(1.2), 'Wejdź na nocną zmianę.', size=48, color=CREAM, font=HEAD, align=PP_ALIGN.CENTER)
tb(s, M, Inches(3.7), W - 2 * M, Inches(0.8), [[('kustosz', {'color': LIME}), ('.xyz', {'color': CREAM})]], size=36, font=HEAD, align=PP_ALIGN.CENTER)
tb(s, M, Inches(4.7), W - 2 * M, Inches(0.6), 'Gra działa w przeglądarce, bez instalacji. Muzeum otwiera się po zmroku.', size=14, color=MUTED, align=PP_ALIGN.CENTER)
tb(s, M, H - Inches(0.75), W - 2 * M, Inches(0.3), 'AFTER DARK STUDIO  ·  2026', size=9, color=MUTED, bold=True, spc=250, align=PP_ALIGN.CENTER)

prs.save(OUT)
print('saved', OUT, 'slides', len(prs.slides))
