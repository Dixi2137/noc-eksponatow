# -*- coding: utf-8 -*-
"""Kustosz.xyz — karta motywacji M1–M6 i pakiet gry v1 (Zajęcia 2, Studio gier z AI). Buduje .docx i .md."""
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'Kustosz-karta-Zajecia-2.docx')
MD = os.path.join(HERE, 'Kustosz-karta-Zajecia-2.md')
md = []

doc = Document()
for s in doc.sections:
    s.left_margin = s.right_margin = Cm(2); s.top_margin = s.bottom_margin = Cm(1.8)
st = doc.styles['Normal']; st.font.name = 'Calibri'; st.font.size = Pt(10.5)
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Calibri')
for name, size in [('Heading 1', 18), ('Heading 2', 14), ('Heading 3', 12)]:
    h = doc.styles[name]; h.font.name = 'Calibri'; h.font.size = Pt(size); h.font.bold = True; h.font.color.rgb = RGBColor(0x1F, 0x2A, 0x14)
    h.element.rPr.rFonts.set(qn('w:eastAsia'), 'Calibri')


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr(); shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), hexcolor); tcPr.append(shd)


def H(level, text):
    doc.add_heading(text, level); md.append('\n' + '#' * level + ' ' + text + '\n')


def P(text, italic=False, bold=False):
    p = doc.add_paragraph(); r = p.add_run(text); r.italic = italic; r.bold = bold
    md.append(('*%s*' % text) if italic else (('**%s**' % text) if bold else text)); md.append('')
    return p


def B(items):
    for it in items:
        p = doc.add_paragraph(style='List Bullet'); p.add_run(it); md.append('- ' + it)
    md.append('')


def CODE(text):
    p = doc.add_paragraph(); r = p.add_run(text); r.font.name = 'Courier New'; r.font.size = Pt(9)
    r._element.rPr.rFonts.set(qn('w:eastAsia'), 'Courier New')
    p.paragraph_format.left_indent = Cm(0.5); shade_p(p)
    md.append('```'); md.append(text); md.append('```'); md.append('')


def shade_p(p):
    pPr = p._p.get_or_add_pPr(); shd = OxmlElement('w:shd'); shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), 'F2F4EC'); pPr.append(shd)


def T(headers, rows, widths=None):
    t = doc.add_table(rows=1, cols=len(headers)); t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(headers):
        c = t.rows[0].cells[i]; c.text = ''; r = c.paragraphs[0].add_run(h); r.bold = True; r.font.size = Pt(9.5); shade(c, 'E3E8D6')
    for row in rows:
        cells = t.add_row().cells
        for i, v in enumerate(row):
            cells[i].text = ''; r = cells[i].paragraphs[0].add_run(str(v)); r.font.size = Pt(9.5)
    if widths:
        for row in t.rows:
            for i, w in enumerate(widths): row.cells[i].width = Cm(w)
    doc.add_paragraph()
    md.append('| ' + ' | '.join(headers) + ' |'); md.append('|' + ' --- |' * len(headers))
    for row in rows: md.append('| ' + ' | '.join(str(v).replace('\n', ' ') for v in row) + ' |')
    md.append('')


# ───────────────────────── Tytuł ─────────────────────────
t = doc.add_paragraph(); r = t.add_run('Kustosz.xyz — karta motywacji i pakiet gry v1'); r.bold = True; r.font.size = Pt(20)
md.append('# Kustosz.xyz — karta motywacji i pakiet gry v1'); md.append('')
P('Studio gier z AI · Zajęcia 2: motywacja gracza i dokumenty gry · Sztuczna Inteligencja i Data Science 1 · Kognitywistyka, I rok · PJATK', italic=True)
P('Wejściem jest karta z Zajęć 1 (wizja, 3 zasady, pola 1–5, wiersz o odbiorcy). Ten plik jest wersją „na zapas”: diagnoza i dokumenty są gotowe do wklejenia do wspólnego pliku, a na zajęciach każda rola potwierdza swoje wpisy albo podmienia je na własne. Odpowiedzi AI opisane niżej są przykładowe: prawdziwe będą inne, bo AI jest losowe, i to one trafiają do zapisu pracy z AI.')
T(['Pole', 'Wpis'], [['Zespół', '(nazwa zespołu, jak na karcie z Zajęć 1)'], ['Dyrektor kreatywny', '(imię)'], ['Projektant mechanik', '(imię)'], ['Projektant rozgrywki', '(imię)'], ['Badacz doświadczenia gracza', '(imię; w zespole 3-osobowym: dyrektor)'], ['Brief', 'Nr 5: gość muzeum · telefon przy eksponacie · gra o wybranym eksponacie · 4 minuty'], ['Eksponat na prototyp czatowy', 'Napoleon Bonaparte, sala „Borodino 1812” (jeden eksponat, żeby Mistrz Gry na Zajęciach 3 miał jedną postać do prowadzenia)']], [5, 12])

# ───────────────────────── Wejście ─────────────────────────
H(2, 'Wejście: karta z Zajęć 1 (skrót)')
P('Wszystkie oceny i zmiany niżej odwołują się do tych pól. Pełna karta jest w pliku „Kustosz-karta-Zajecia-1”.')
T(['Pole', 'Wpis (skrót)'], [
    ['Wizja', 'Gość muzeum staje przy eksponacie, telefon zamienia go w nocnego stróża w zbroi. O północy eksponat budzi się jako postać z historii i staje do pojedynku. Każdy cios jest zapowiedziany: wygrywa ten, kto odczyta rytm. Jedna sala to jeden pojedynek na kilka minut, historia to przeciwnicy z krwi i kości, nie daty.'],
    ['3 zasady wizji', 'Każdy cios zapowiedziany · Historia to przeciwnik, nie quiz · Jedna sala, jeden pojedynek'],
    ['1. Pomysł', '„Noc w muzeum spotyka pojedynek rycerski, ale każdy eksponat to postać z historii, a wygrywa się tylko odczytując rytm jej zapowiedzianych ciosów.”'],
    ['2. Mechaniki', '(1) Parada dokładnie w chwili zapowiedzianego ciosu odbija go w atakującego; zwykły blok przepuszcza część obrażeń. (2) Po zamachu eksponat ma przez chwilę osłabioną gardę i tylko wtedy cios rycerza zadaje pełne obrażenia. (3) Parada i unik zużywają wytrzymałość; z pustym paskiem nie da się bronić, aż się odnowi.'],
    ['3. Pętla', 'Gracz widzi zapowiedź i wybiera paradę, unik albo atak → gra odbija, blokuje z uszczerbkiem albo przepuszcza cios, eksponat odsłania gardę → gracz widzi paski życia, pasek wytrzymałości i etykietę (PERFEKCYJNA, BLOK −n, ODRZUT) → gracz decyduje: uderzyć w gardę czy odstąpić i odzyskać wytrzymałość. Rozgrywka: 23:58, przebudzenie, jeden pojedynek 2–4 min, KO z nagrodą w żetonach albo upadek i epilog ze snem.'],
    ['4. Uczucia', 'Napięcie ← 1 · Satysfakcja z mistrzostwa ← 1 i 2 · Pokusa ryzyka ← 3'],
    ['5. Twist', 'Mechaniki 1 i 3: gracze przestają blokować i unikać, stoją z pełnym paskiem i czekają tylko na perfekcyjną paradę, bo to jedyna obrona bez kosztu.'],
    ['Odbiorca', 'Persona od AI: Marek, 34 lata, przy eksponacie 1–2 minuty, gra tylko w kolejce i tramwaju; porzuca przez długie intro, sterowanie klawiszami i za trudny pierwszy pojedynek. Zmiana: sala 1 to samouczek, przyciski dotykowe, intro skrócone przy eksponacie.']], [3.5, 13.5])

# ───────────────────────── Rozgrzewka ─────────────────────────
H(2, 'Rozgrzewka: dlaczego ludzie wracają do gier')
P('Bez AI. Każda osoba podaje grę, do której wracała, i jednym zdaniem dlaczego. Pola do wypełnienia na kartce; w nawiasie podpowiedź, do którego napędu prowadzący zwykle przypisuje taki powód.')
T(['Kto', 'Gra i powód (do wpisania na zajęciach)', 'Napęd'], [['Dyrektor', '(np. „wracałem, bo codziennie była nowa nagroda i szkoda przerwać serię”)', '(8)'], ['Mechanik', '(np. „chciałem mieć wszystkie postacie”)', '(4)'], ['Rozgrywka', '(np. „ciekawiło mnie, co jest za następnym poziomem”)', '(7)'], ['Badacz', '(np. „grałem ze znajomymi i nie chciałem ich zawieść”)', '(5)']], [3, 11, 3])

# ───────────────────────── M1 ─────────────────────────
H(2, 'Krok 1 · M1. Diagnoza 8 napędów (bez AI)')
P('Zasada: ocena bez dowodu to 0. Dowodem jest numer mechaniki albo krok pętli z karty z Zajęć 1, nie cała gra kustosz.xyz (sklep, skrzynie i kasyno są poza kartą i poza prototypem).')
T(['Napęd', 'Ocena', 'Dowód z karty', 'Kto ocenia'], [
    ['1. Epickie znaczenie', '1', 'Tylko w tle: przebieg rozgrywki („ostatni obchód, przebudzenie eksponatu”) mówi, że stróż pilnuje muzeum, ale żadna mechanika nie daje tego odczuć; pojedynek nie ma stawki poza paskiem życia.', 'Badacz'],
    ['2. Rozwój i osiągnięcia', '1', 'Przebieg: po KO nagroda w żetonach. Każdy pojedynek zaczyna się od zera i gracz nie widzi w nim, że jest coraz lepszy.', 'Mechanik'],
    ['3. Kreatywność i feedback', '3', 'Pętla, krok 3: po każdym ruchu etykieta PERFEKCYJNA / BLOK −n / ODRZUT i paski. Pętla, krok 1: gracz wybiera między paradą, unikiem i atakiem przy każdej zapowiedzi. Czuć w każdej wymianie.', 'Rozgrywka'],
    ['4. Posiadanie', '1', 'Przebieg: żetony po KO. Karta nie mówi, do czego służą, więc „to jest moje” działa słabo i poza pojedynkiem.', 'Mechanik'],
    ['5. Wpływ społeczny', '0', 'Brak. Gość gra sam przy eksponacie; karta nie ma nikogo drugiego.', 'Badacz'],
    ['6. Niedobór i niecierpliwość', '2', 'Mechanika 3: wytrzymałość jest ograniczona; z pustym paskiem nie da się bronić, trzeba odczekać. Działa w jednej mechanice.', 'Mechanik'],
    ['7. Nieprzewidywalność', '1', 'Celowo słaby: zasada „Każdy cios zapowiedziany” odbiera losowość. W tle zostaje tylko to, który eksponat się obudzi (przebieg).', 'Badacz'],
    ['8. Utrata i unikanie', '2', 'Mechanika 1: spóźniona parada to strata życia. Przebieg: upadek rycerza kończy rozgrywkę epilogiem ze snem. Działa w mechanice 1 i w zakończeniu.', 'Rozgrywka']], [3.8, 1.3, 9.4, 2.5])
P('Obraz po diagnozie: gra stoi na feedbacku (3) i na dwóch napędach z presji (6, 8), które są wbudowane w pojedynek. Napędy „dobrego samopoczucia” 1 i 2 są słabe, 4 i 5 prawie nie istnieją.')

# ───────────────────────── M2, M3 ─────────────────────────
H(2, 'Krok 2 · M2 i M3. Najmocniejszy napęd i dwa do wzmocnienia')
T(['Pole', 'Wpis', 'Kto'], [
    ['M2. Najmocniejszy napęd', '3. Kreatywność i feedback. Pętla reaguje na każdy ruch natychmiast i jednoznacznie (etykieta plus paski), a przy każdej zapowiedzi gracz ma prawdziwy wybór. To serce wizji „wygrywa ten, kto odczyta rytm”.', 'Dyrektor'],
    ['M3. 2 napędy do wzmocnienia', '1. Epickie znaczenie i 2. Rozwój i osiągnięcia. Oba są słabe (1) i oba pasują do wizji i odbiorcy: gość muzeum ma poczuć, że jako stróż chroni swój eksponat (1), i ma zobaczyć w ciągu 4 minut, że uczy się rytmu (2). Napędy 4 i 5 też są słabe, ale ich wzmocnienie (kolekcja, ranking) nie mieści się w jednej 4-minutowej rozgrywce przy eksponacie: zostają w karcie jako „poza prototypem”. Napędy 6 i 8 zostają na poziomie 2 celowo: presja w grze dla gości muzeum ma pochodzić tylko z pojedynku, bez odliczania i straszenia.', 'Dyrektor po rozmowie zespołu']], [4, 10, 3])

H(3, 'Prompt diagnozy v1 (złożony z części ról)')
P('Każda osoba wkleja go do własnego czatu w nowym oknie. Części: kontekst odbiorcy (badacz), kontekst mechanik (mechanik), diagnoza (dyrektor), oczekiwanie (rozgrywka), ograniczenia (mechanik).')
CODE('''Kontekst: Pracujesz jako game designer używający modelu Octalysis (8 napędów motywacji). Gra jest dla gościa muzeum, na telefonie, stojąc przy eksponacie, rozgrywka trwa około 4 minut. Odbiorca: dorosły zwiedzający, który przy eksponacie stoi 1–2 minuty, gra na telefonie tylko w kolejce i w tramwaju, porzuca gry przez długie intro, sterowanie klawiszami i za trudny pierwszy pojedynek; sala 1 jest samouczkiem.
Mechaniki: (1) Jeśli gracz naciśnie paradę dokładnie w chwili zapowiedzianego ciosu eksponatu, cios wraca do atakującego i rycerz nie traci życia; zwykły blok przepuszcza część obrażeń. (2) Jeśli eksponat skończy zamach, przez chwilę ma osłabioną gardę i tylko wtedy cios rycerza zadaje pełne obrażenia. (3) Jeśli rycerz paruje albo unika, zużywa wytrzymałość; z pustym paskiem nie może się bronić, aż wytrzymałość się odnowi.
Pętla: gracz widzi zapowiedź ciosu i wybiera paradę, unik albo atak → gra odbija, blokuje z uszczerbkiem albo przepuszcza cios, eksponat po zamachu odsłania gardę → gracz widzi paski życia, pasek wytrzymałości i etykietę (PERFEKCYJNA, BLOK −n, ODRZUT) → gracz decyduje: uderzyć w gardę czy odstąpić i odzyskać wytrzymałość. Jedna rozgrywka to jeden pojedynek w jednej sali, 2–4 minuty, od przebudzenia eksponatu o 23:58 do KO albo upadku rycerza.
Zasady wizji: Każdy cios zapowiedziany. Historia to przeciwnik, nie quiz. Jedna sala, jeden pojedynek.
Diagnoza: Napęd 1 (epickie znaczenie) ma ocenę 1: tylko przebieg mówi, że stróż pilnuje muzeum, żadna mechanika nie daje tego odczuć. To problem dla gracza, bo pojedynek nie ma stawki poza paskiem życia i gość nie czuje, po co stoi przy tym eksponacie. Napęd 2 (rozwój i osiągnięcia) ma ocenę 1: jedyny dowód to żetony po KO, każdy pojedynek zaczyna się od zera. To problem, bo w 4 minutach gracz nie widzi, że uczy się rytmu, a to jedyna umiejętność, którą gra nagradza.
Oczekiwanie: Dla każdego z tych napędów zaproponuj 3 rozwiązania. Każde zmienia istniejącą mechanikę albo pętlę i jest widoczne w jednej rozgrywce albo opisane jako poza prototypem. Najwyżej 3 mechaniki, nie dodawaj czwartej. Rozwiązania zgodne z zasadami wizji: bez quizu i pytań o daty, bez drugiej sali w jednej rozgrywce, każdy cios nadal zapowiedziany. Bez presji czasu i bez rankingów. Bez krwi. Telefon, sterowanie dotykowe.''')

# ───────────────────────── Krok 3 ─────────────────────────
H(2, 'Krok 3 · Odpowiedzi AI (przykładowe) i co z nich bierze każda rola')
P('Na zajęciach każda osoba wkleja prompt do własnego czatu, a odpowiedzi leżą obok siebie we wspólnym pliku. Poniżej typowy zestaw propozycji, jaki model daje na taki prompt, żeby zespół wiedział, czego się spodziewać i co od razu przepuścić przez filtr. Prawdziwe odpowiedzi podmieniają tę tabelę.')
T(['Napęd', 'Propozycja AI (skrót)', 'Zmienia', 'Kto ją wypisuje'], [
    ['1', 'Zamiar eksponatu: obudzona postać chce coś zabrać z sali (Napoleon: koronę z gabloty). Każda perfekcyjna parada cofa ją o krok, przegrana oznacza, że sala rano wygląda inaczej.', 'Mechanika 1 i pętla (krok 3)', 'Rozgrywka'],
    ['1', 'Zwiedzający-NPC w sali, których trzeba osłonić przed ciosami.', 'Nowa, czwarta mechanika', 'Mechanik'],
    ['1', 'Dłuższe intro fabularne (30 s) o historii eksponatu przed walką.', 'Przebieg', 'Badacz'],
    ['2', 'Rytm odczytany: po trzech perfekcyjnych paradach z rzędu rycerz „zna” rytm i okno osłabionej gardy wydłuża się; spóźniona parada wraca do normy. Na ekranie KO: „odczytane ciosy: 7 z 9”.', 'Mechanika 2 i pętla (krok 3)', 'Mechanik'],
    ['2', 'Poziomy doświadczenia i drzewko umiejętności między pojedynkami.', 'Nowa mechanika, poza jedną rozgrywką', 'Mechanik'],
    ['2', 'Codzienna seria: bonus za granie każdego dnia.', 'Poza rozgrywką, napęd 8 w przebraniu', 'Badacz (zaznacza jako presja)']], [1.3, 8.2, 4, 3.5])

# ───────────────────────── Krok 4 ─────────────────────────
H(2, 'Krok 4 · Filtr 4 pytań, M4 i M5')
P('Kolejność: mechanik ogłasza zmiany mechanik, rozgrywka dopasowuje pętlę, badacz uczucia i etykę, dyrektor rozstrzyga spory.')
T(['Propozycja', '1. Wizja i 3 zasady', '2. Najwyżej 3 mechaniki', '3. Brief, widać w 1 rozgrywce', '4. Nie szkodzi odbiorcy', 'Wynik'], [
    ['Zamiar eksponatu', 'TAK: historia to przeciwnik z celem, nie quiz', 'TAK: zmienia mechanikę 1', 'TAK: cel widać od pierwszej zapowiedzi do KO', 'TAK: stawka bez odliczania', 'Przyjęte (M4, w prototypie)'],
    ['Zwiedzający-NPC', 'TAK', 'NIE: czwarta mechanika', '—', '—', 'Odpada'],
    ['Intro 30 s', 'TAK', 'TAK', 'NIE: persona porzuca przez długie intro, 4 minuty przy eksponacie', '—', 'Odpada'],
    ['Rytm odczytany', 'TAK: nagradza odczytanie rytmu', 'TAK: zmienia mechanikę 2', 'TAK: w jednym pojedynku', 'TAK', 'Przyjęte (M4, w prototypie)'],
    ['Poziomy i drzewko', 'TAK', 'NIE: nowa mechanika', 'NIE: między rozgrywkami', '—', 'Odpada'],
    ['Codzienna seria', 'TAK', 'TAK', 'NIE: nie widać w rozgrywce', 'NIE: strach przed przerwaniem serii (napęd 8)', 'Odpada']], [2.8, 2.8, 2.6, 3.2, 2.8, 2.8])

H(3, 'M4. Wzmocnienia')
T(['Napęd', 'Co się zmienia', 'Gdzie w pakiecie', 'Ocena po zmianie'], [
    ['1. Epickie znaczenie', 'Zmiana w mechanice 1 i w pętli: eksponat budzi się z zamiarem wobec sali (Napoleon chce zabrać koronę z gabloty). Zamiar ma 3 kroki. Każda perfekcyjna parada cofa eksponat o krok, każde przepuszczone uderzenie przybliża go o krok. KO: eksponat wraca na postument, sala uratowana. Upadek: Mistrz Gry opisuje, co rano brakuje w sali.', 'B (sytuacje scen), C (zamiar w stanie gry), D (ton „pilnujesz swojej sali”)', '1 → 2 (działa w mechanice 1 i w zakończeniu)'],
    ['2. Rozwój i osiągnięcia', 'Zmiana w mechanice 2: po trzech perfekcyjnych paradach z rzędu rycerz odczytuje rytm i okno osłabionej gardy wydłuża się z „chwili” do „dwóch ruchów”; spóźniona albo zwykła obrona zeruje serię. Pętla, krok 3: licznik „RYTM: 3/3” obok etykiety. KO i upadek pokazują „odczytane ciosy: n z m”.', 'B (działania), C (seria parad), A (pole 2)', '1 → 2 (widać w jednej rozgrywce)'],
    ['Poza prototypem', 'Napęd 4: kolekcja strojów i trofeów za pokonane eksponaty (istnieje w kustosz.xyz, ale wymaga wielu rozgrywek). Napęd 5: porównanie „odczytanych ciosów” z innymi gośćmi przy tym samym eksponacie, bez rankingu, tylko „najlepszy stróż tej sali”. Oba nie mieszczą się w jednej 4-minutowej rozgrywce, więc zostają w A jako „poza prototypem”.', 'A', '—']], [3, 8, 3.5, 2.5])

H(3, 'M5. Zaktualizowane pola 2–4')
T(['Pole', 'Wpis (zmiany oznaczone „Zmiana:”)', 'Właściciel'], [
    ['2. Mechaniki', '(1) Jeśli gracz naciśnie paradę dokładnie w chwili zapowiedzianego ciosu, cios wraca do atakującego i rycerz nie traci życia; zwykły blok przepuszcza część obrażeń. Zmiana: perfekcyjna parada cofa eksponat o jeden krok w jego zamiarze wobec sali, przepuszczony cios przybliża go o krok.\n(2) Jeśli eksponat skończy zamach, przez chwilę ma osłabioną gardę i tylko wtedy cios rycerza zadaje pełne obrażenia. Zmiana: po trzech perfekcyjnych paradach z rzędu okno osłabionej gardy wydłuża się do dwóch ruchów; zwykły blok, unik albo spóźniona parada zerują serię.\n(3) Jeśli rycerz paruje albo unika, zużywa wytrzymałość; z pustym paskiem nie może się bronić, aż wytrzymałość się odnowi. Bez zmian.', 'Mechanik'],
    ['3. Pętla i przebieg', '1. Gracz widzi zapowiedź ciosu i wybiera paradę, unik albo atak (1, 3). 2. Gra odbija, blokuje z uszczerbkiem albo przepuszcza cios; eksponat odsłania gardę (1, 2). 3. Gracz widzi paski życia, pasek wytrzymałości, etykietę (PERFEKCYJNA, BLOK −n, ODRZUT). Zmiana: obok etykiety licznik RYTM n/3 i pasek ZAMIAR eksponatu (3 kroki). 4. Gracz decyduje: uderzyć w gardę (dłuższą, jeśli odczytał rytm) czy odstąpić i odzyskać wytrzymałość (2, 3). Powrót do 1.\nPrzebieg: 23:58, przebudzenie eksponatu z wypowiedzianym zamiarem, jeden pojedynek 2–4 minuty. Zmiana: KO kończy się powrotem eksponatu na postument i podsumowaniem „odczytane ciosy: n z m”; upadek rycerza to epilog ze snem i opis, czego rano brakuje w sali.', 'Rozgrywka'],
    ['4. Uczucia', 'Napięcie ← 1 (krótkie okno, zapowiedziany cios) · Satysfakcja z mistrzostwa ← 2 (Zmiana: odczytany rytm wydłuża okno, co jest zasługą gracza) · Poczucie misji ← 1 (Zmiana: zamiar eksponatu daje pojedynkowi stawkę). Pokusa ryzyka z Zajęć 1 zostaje jako skutek mechaniki 3, ale nie mieści się w trzech uczuciach; twist nadal działa na mechanikach 1 i 3.', 'Badacz']], [3, 11.5, 2.5])

H(3, 'Spory i rozstrzygnięcia')
B(['Mechanik chciał, żeby seria parad dawała dodatkowe obrażenia zamiast dłuższego okna. Rozgrywka: wtedy wygrywa się szybciej, a nie mądrzej. Rozstrzygnięte zasadą „wygrywa ten, kto odczyta rytm”: nagroda za rytm to więcej czasu na decyzję, nie większy cios.',
   'Rozgrywka chciała, żeby zamiar eksponatu miał odliczanie („Napoleon dotrze do gabloty za 60 s”). Badacz: pytanie 4 filtra, presja czasu u gościa muzeum. Rozstrzygnięte filtrem: zamiar posuwa się tylko przez przepuszczone ciosy, nigdy przez upływ czasu.',
   'Badacz chciał usunąć epilog o tym, czego rano brakuje w sali, bo „straszy stratą” (napęd 8). Dyrektor: to skutek przegranego pojedynku, nie groźba przed nim, i opisuje świat, a nie ocenia gracza. Rozstrzygnięte na korzyść zamiaru: epilog zostaje, w D zasada: bez wyrzutów wobec gracza.'])

# ───────────────────────── Krok 5: pakiet gry ─────────────────────────
H(2, 'Krok 5 · Pakiet gry v1')
P('Cztery dokumenty, z których na Zajęciach 3 AI poprowadzi grę w czacie jako Mistrz Gry. Prototyp czatowy prowadzi jeden eksponat: Napoleon Bonaparte w sali „Borodino 1812”. Każda rola pisze swój dokument z AI we własnym czacie: B i C równolegle, D na podstawie sceny z B, A na końcu z M4–M5.')

H(3, 'Dokument A. Karta gry (dyrektor kreatywny)')
T(['Pole', 'Wpis'], [
    ['Wizja (3–5 zdań)', 'Gość muzeum staje przy eksponacie, a telefon zamienia go w nocnego stróża w zbroi. O północy eksponat budzi się jako postać z historii, mówi, co chce zrobić z salą, i staje do pojedynku. Każdy cios jest zapowiedziany, więc wygrywa nie szybszy, tylko ten, kto odczyta rytm. Jedna sala to jeden pojedynek na kilka minut, a historia to przeciwnicy z krwi i kości, nie daty do wkucia.'],
    ['3 zasady wizji', 'Każdy cios zapowiedziany · Historia to przeciwnik, nie quiz · Jedna sala, jeden pojedynek'],
    ['1. Pomysł w 1 zdaniu', '„Noc w muzeum spotyka pojedynek rycerski, ale każdy eksponat to postać z historii z własnym zamiarem wobec sali, a wygrywa się tylko odczytując rytm jej zapowiedzianych ciosów.”'],
    ['2. Mechaniki', 'Jak w M5: (1) parada w rytm, Zmiana: cofa zamiar eksponatu; (2) osłabiona garda po zamachu, Zmiana: po 3 perfekcyjnych paradach okno trwa dwa ruchy; (3) wytrzymałość za paradę i unik, bez zmian.'],
    ['3. Pętla i przebieg', 'Jak w M5: zapowiedź → wybór → reakcja gry → etykieta, paski, RYTM n/3, ZAMIAR → decyzja. Jeden pojedynek od 23:58 do KO (eksponat na postument, „odczytane ciosy: n z m”) albo upadku (epilog ze snem, czego rano brakuje w sali).'],
    ['4. Uczucia gracza', 'Napięcie (1) · Satysfakcja z mistrzostwa (2) · Poczucie misji (1)'],
    ['5. Twist', 'Mechaniki 1 i 3: gracze stoją z pełnym paskiem i czekają tylko na perfekcyjną paradę, bo to jedyna obrona bez kosztu. Po Zmianie w mechanice 2 jest to jeszcze bardziej opłacalne, więc pojedynek świadomie zmierza w stronę gry rytmicznej.'],
    ['Wzmocnienia poza prototypem i dlaczego', 'Napęd 4: kolekcja strojów i trofeów za pokonane eksponaty, bo wymaga wielu rozgrywek, a brief daje jedną przy eksponacie. Napęd 5: „najlepszy stróż tej sali” jako porównanie odczytanych ciosów, bez rankingu i bez nazwisk, bo pytanie 4 filtra zabrania zawstydzających rankingów, a w jednej rozgrywce i tak go nie widać.']], [4, 13])

H(3, 'Dokument B. Sceny (projektant rozgrywki)')
P('Prompt dokumentu B wysłany do AI (do skopiowania na zajęciach): „Pracujesz jako scenarzysta gier. Gra: [pole 1]. Odbiorca: brief nr 5 i wiersz o odbiorcy. Mechaniki: [pole 2 z M5]. Zasady wizji: [3 zasady]. Zaproponuj 8 scen. Każda scena: sala „Borodino 1812” w muzeum, noc; jedna postać: Napoleon Bonaparte, obudzony eksponat; sytuacja w najwyżej 3 krótkich zdaniach; 2–4 działania gracza zgodne z mechanikami; dla każdego skutek widoczny od razu i skutek, który zaskakuje; napęd Octalysis, który scena uruchamia. Bez krwi. Skutki nie oceniają gracza. Odpowiedź w tabeli.” Z 8 propozycji zespół wybrał 5; odrzucone są w zapisie pracy z AI.')
scenes = [
    ('1', 'Sala „Borodino 1812”, 23:58. Zimowa sceneria za oknem, sztandar z literą N.', 'Napoleon Bonaparte: eksponat, który właśnie zszedł z postumentu.', 'Gabloty cichną, a figura cesarza prostuje się i sięga po szablę. „Korona z tej gabloty wróci do Paryża jeszcze tej nocy.” Robi pierwszy krok w stronę gabloty i unosi szablę do zapowiedzi.', '1. Epickie znaczenie (zamiar wobec sali)', [
        ('Czekam z gardą i patrzę na zapowiedź (3)', 'Pasek wytrzymałości pełny, zapowiedź rośnie: szabla idzie w górę.', 'Napoleon mówi do ciebie po imieniu stróża z plakietki: wie, kto pilnuje sali.'),
        ('Atakuję od razu (2)', 'Cios trafia w pełną gardę: „ODRZUT”, Napoleon nie traci życia, ty tracisz 10 wytrzymałości.', 'Cesarz kwituje: „W Borodino też tak zaczynali.” Zamiar bez zmian.'),
        ('Paruję, zanim cios zostanie zapowiedziany (1)', 'Parada w pustkę: „SPÓŹNIONA / ZA WCZEŚNIE”, −15 wytrzymałości.', 'Napoleon opuszcza szablę i czeka: cios zapowie dopiero, gdy się uspokoisz.')]),
    ('2', 'Ta sama sala, chwilę później. Napoleon stoi dwa kroki od gabloty.', 'Napoleon, szabla uniesiona: pierwszy zapowiedziany cios.', 'Nad szablą pojawia się znak zamachu. Cesarz tnie z góry, ale wolno, jak w samouczku. To pierwsza okazja, żeby trafić w rytm.', '3. Kreatywność i feedback', [
        ('Parada w rytm (1)', '„PERFEKCYJNA”: cios wraca do Napoleona, −10 jego życia, ZAMIAR cofa się o krok, RYTM 1/3.', 'Szabla cesarza drży; Napoleon przez dwa ruchy ma osłabioną gardę (mechanika 2).'),
        ('Zwykły blok (1)', '„BLOK −6”: tracisz 6 życia i 15 wytrzymałości, RYTM 0/3.', 'Cesarz robi krok do gabloty: ZAMIAR 1/3, bo cios przeszedł.'),
        ('Unik (3)', 'Cios w powietrze, −20 wytrzymałości, życie bez zmian.', 'Napoleon obraca się za tobą i zapowiada następny cios szybciej.'),
        ('Atak w trakcie zamachu (2)', 'Twoje uderzenie przecina się z jego: „WYMIANA” −8 życia dla obu.', 'Napoleon chwali odwagę i przyspiesza: kolejna zapowiedź będzie krótsza.')]),
    ('3', 'Ta sama sala. Napoleon po zamachu, szabla opuszczona.', 'Napoleon z osłabioną gardą.', 'Po twojej paradzie cesarz odsłania bok. Masz chwilę, a jeśli odczytałeś rytm, dwa ruchy. Pasek wytrzymałości jest w połowie.', '2. Rozwój i osiągnięcia (odczytany rytm)', [
        ('Uderzam w osłabioną gardę (2)', '„PEŁNE TRAFIENIE”: −20 życia Napoleona.', 'Cesarz cofa się od gabloty sam, bez twojej parady: trafienie w rytm też cofa zamiar.'),
        ('Uderzam drugi raz (2, tylko przy RYTM 3/3)', 'Drugie pełne trafienie: −20 życia Napoleona.', 'Napoleon mówi: „Znasz mój krok.” Następna zapowiedź jest dłuższa.'),
        ('Odstępuję i odzyskuję wytrzymałość (3)', '+25 wytrzymałości, życie bez zmian.', 'Napoleon korzysta z chwili i robi krok do gabloty: ZAMIAR +1.')]),
    ('4', 'Ta sama sala. Pasek wytrzymałości pusty.', 'Napoleon, który widzi, że nie możesz się bronić.', 'Po serii uników nie masz czym parować. Cesarz nie przyspiesza: zapowiada cios tak samo wyraźnie jak zawsze. Twoja jedyna obrona bez kosztu to trafić w rytm.', '8. Utrata i unikanie (łagodnie: strata w pojedynku)', [
        ('Parada w rytm (1)', '„PERFEKCYJNA” nawet z pustym paskiem: cios wraca, RYTM +1.', 'Wytrzymałość odnawia się szybciej po perfekcyjnej paradzie: +15.'),
        ('Cofam się i czekam (3)', 'Cios dochodzi: −12 życia, +25 wytrzymałości.', 'Napoleon nie goni: „Odpocznij, stróżu. Korona poczeka minutę.” ZAMIAR +1.'),
        ('Atakuję mimo wszystko (2)', 'Trafienie w pełną gardę: „ODRZUT”, jego cios dochodzi: −12 życia.', 'Napoleon zatrzymuje się na moment: zaskoczony, zapowiada następny cios wolniej.')]),
    ('5', 'Ta sama sala. Napoleon jeden krok od gabloty, jego życie poniżej jednej trzeciej.', 'Napoleon przy koronie.', 'Cesarz kładzie dłoń na gablocie i zapowiada ostatni cios, ciężki, z długim zamachem. Jeden przepuszczony cios i korona jest jego. Jedna parada w rytm i wraca na postument.', '1. Epickie znaczenie i 3. Feedback', [
        ('Parada w rytm (1)', '„PERFEKCYJNA”: cios wraca, życie Napoleona 0, ZAMIAR 0/3.', 'KO: cesarz wraca na postument sam, salutując. „Odczytane ciosy: n z m.” Sala rano wygląda jak zawsze.'),
        ('Zwykły blok (1)', '„BLOK −10”, ZAMIAR 3/3.', 'Napoleon otwiera gablotę, ale nie bierze korony: „Jutro.” Pojedynek trwa, zamiar zostaje na 3/3.'),
        ('Uderzam w osłabioną gardę po jego zamachu (2)', 'Jeśli cios był sparowany wcześniej: −20 życia, Napoleon pada na kolano.', 'Przy KO z trafienia zamiast parady Napoleon mówi: „Siłą, nie rytmem. Wrócę.”'),
        ('Upadek rycerza (gdy życie rycerza 0)', 'Epilog: 06:00, pokój stróża, „To był tylko sen”.', 'Mistrz Gry opisuje, czego rano brakuje w gablocie, bez wyrzutów wobec gracza; „odczytane ciosy: n z m”.')]),
]
for num, place, who, sit, drive, acts in scenes:
    T(['Pole', 'Wpis'], [['Numer sceny', num], ['Miejsce i czas', place], ['Postać', who], ['Sytuacja (najwyżej 3 zdania)', sit], ['Napęd, który scena uruchamia', drive]], [4, 13])
    T(['Działanie gracza (numer mechaniki)', 'Skutek widoczny od razu', 'Skutek, który zaskakuje'], [list(a) for a in acts], [5.5, 5.5, 6])

H(3, 'Dokument C. Stan gry (projektant mechanik)')
P('Prompt dokumentu C (do skopiowania): „Oto mechaniki naszej gry: [pole 2 z M5] i pętla: [pole 3]. Wypisz, co gra musi pamiętać, żeby te mechaniki działały, najwyżej 4 rzeczy. Dla każdej podaj: wartość na starcie, co ją zmienia, jak Mistrz Gry pokazuje to w czacie, któremu napędowi służy. Potem wskaż 3 sytuacje, w których nie wiadomo, jaki jest stan gry. Nie dodawaj nowych mechanik.”')
T(['Co gra pamięta', 'Na starcie', 'Co to zmienia', 'Jak Mistrz Gry pokazuje to w czacie', 'Napęd'], [
    ['Życie rycerza', '100', 'Zwykły blok −6 (ciężki cios −10), przepuszczony cios −12, wymiana −8. Perfekcyjna parada: 0.', 'Linia stanu po każdym ruchu: „RYCERZ 88/100”', '8'],
    ['Życie eksponatu (Napoleon)', '100', 'Perfekcyjna parada −10, pełne trafienie w osłabioną gardę −20, wymiana −8, cios w pełną gardę 0.', '„NAPOLEON 70/100”; przy 0: KO i powrót na postument', '3'],
    ['Wytrzymałość rycerza', '100 (maks. 100)', 'Parada −15, unik −20, atak w pełną gardę −10, odstąpienie +25, perfekcyjna parada +15. Przy 0 nie da się blokować ani unikać; dostępne zostają parada w rytm i atak.', '„WYTRZYMAŁOŚĆ 45/100”, przy 0 słowo PUSTA', '6'],
    ['Rytm i zamiar (jedna linia)', 'RYTM 0/3 · ZAMIAR 0/3', 'RYTM: perfekcyjna parada +1 (maks. 3); blok, unik, spóźniona parada → 0. Przy 3/3 osłabiona garda trwa dwa ruchy. ZAMIAR: perfekcyjna parada i pełne trafienie −1, przepuszczony cios i odstąpienie +1 (zakres 0–3). Przy 3/3 Napoleon otwiera gablotę, ale korona zostaje do końca pojedynku.', '„RYTM 2/3 · ZAMIAR 1/3”; opis sceny mówi, o ile kroków cesarz jest od gabloty', '2 i 1']], [3.2, 2.2, 5.3, 4.3, 1.5])
T(['Pole', 'Wpis'], [
    ['Kiedy gra się kończy', 'KO: życie Napoleona 0 → eksponat wraca na postument, podsumowanie „odczytane ciosy: n z m” (n = perfekcyjne parady, m = wszystkie zapowiedziane ciosy). Upadek: życie rycerza 0 → epilog o 06:00; Mistrz Gry opisuje salę rano według ZAMIAR (0–1: nic nie brakuje, 2: gablota uchylona, 3: korona na podłodze pod postumentem, nie w Paryżu). Nie ma limitu czasu ani liczby wymian; przeciętny pojedynek to 8–12 zapowiedzi.'],
    ['Niejasne sytuacje i rozstrzygnięcia', '1. Gracz pisze „parada”, gdy nie ma zapowiedzi: parada w pustkę, −15 wytrzymałości, bez etykiety PERFEKCYJNA. 2. Gracz pisze działanie spoza mechanik (np. „rozmawiam z Napoleonem”, „biorę koronę”): Mistrz Gry odmawia według zasady 5 z D i powtarza listę ruchów; stan bez zmian, zapowiedź trwa. 3. RYTM 3/3 i zwykły blok w tej samej wymianie: blok zeruje serię, ale okno osłabionej gardy z tej wymiany jeszcze obowiązuje (dwa ruchy), od następnej wraca do „chwili”. Pytanie na zajęcia (luka): czy odstąpienie przy ZAMIAR 3/3 ma dalej dodawać +1.']], [4, 13])

H(3, 'Dokument D. Styl prowadzenia (badacz)')
P('Prompt dokumentu D (do skopiowania): „Odbiorca: brief nr 5 i wiersz o odbiorcy z Zajęć 1. Oto jedna scena z naszej gry: [scena 2 z B]. Napisz ją 2 razy: raz za trudno dla tego odbiorcy, raz dobrze. Potem wypisz 5 zasad stylu, które odróżniają te wersje: długość zdań, słownictwo, ton. Nie zmieniaj treści sceny.” Wersja za trudna, jaką zwykle daje AI: cztery długie zdania o Wielkiej Armii, „kontratak z riposty po zbiciu w tercji” i pytanie o rok bitwy. Wersja dobra: trzy krótkie zdania, nazwane ruchy, zero dat. Stąd zasady:')
T(['Pole', 'Wpis'], [
    ['Zasada 1: długość tekstu', 'Scena: najwyżej 3 krótkie zdania. Po nich jedna linia stanu (RYCERZ · NAPOLEON · WYTRZYMAŁOŚĆ · RYTM · ZAMIAR) i lista ruchów w jednej linii. Cała tura mieści się na ekranie telefonu bez przewijania.'],
    ['Zasada 2: słownictwo', 'Prosty polski, jak przewodnik w muzeum, nie jak instrukcja szermierki. Ruchy zawsze tymi samymi słowami: parada, blok, unik, atak, odstąpienie. Etykiety wielkimi literami: PERFEKCYJNA, BLOK −n, ODRZUT, PEŁNE TRAFIENIE. Postać nazywana po imieniu i jednym określeniem z epoki („cesarz”), bez dat i nazw bitew w tekście tury.'],
    ['Zasada 3: ton', 'Nocna straż, lekko i z dystansem. Napoleon mówi krótko, z humorem i pewnością siebie, nigdy nie obraża gracza. Mistrz Gry jest narratorem sali, nie sędzią: opisuje, co się stało, nie co gracz „powinien był”.'],
    ['Zasada 4: czego nie wolno', 'Bez krwi, ran i opisów bólu: pojedynek to szermierka na zapowiedziane ciosy, obrażenia to tylko liczby. Bez odliczania czasu, bez „pospiesz się”, bez rankingów i porównań z innymi. Etyka napędów 6–8: niedobór to tylko wytrzymałość, strata to tylko ten jeden pojedynek; epilog po upadku opisuje salę, nie wyrzuca graczowi błędów. Mistrz Gry nie wymyśla nowych ruchów, mechanik, przedmiotów ani faktów o Napoleonie spoza A–D; nie zadaje pytań z historii; nie zmienia liczb z C.'],
    ['Zasada 5: jak odmawiać graczowi', 'Gdy gracz pisze coś spoza listy ruchów, jedna linia bez pouczania: „Rycerz nie ma takiego ruchu. Do wyboru: parada, blok, unik, atak, odstąpienie.” Potem powtórzenie zapowiedzi. Gdy gracz prosi o fakty z historii: „To muzeum, nie quiz. Napoleon zaraz zapowie cios.” Gdy gracz chce przerwać: Mistrz Gry kończy pojedynek epilogiem bez kary.']], [4, 13])

# ───────────────────────── Krok 6 ─────────────────────────
H(2, 'Krok 6 · Sprawdzenie pakietu przez AI i M6')
P('Dyrektor otwiera nową rozmowę, wkleja A–D i prompt kroku 6. Zespół patrzy na ekran. Jeśli AI dopisze sceny albo zasady, dyrektor odrzuca odpowiedź i zaczyna nową rozmowę od „Nie poprawiaj, tylko wskaż.”')
CODE('''Nie poprawiaj, tylko wskaż. Na następnych zajęciach poprowadzisz grę jako Mistrz Gry wyłącznie na podstawie tych dokumentów: [A], [B], [C], [D]. Zanim zaczniesz, sprawdź je. Wypisz: 1) każde miejsce, w którym musiałbyś zgadywać, bo czegoś nie ma w dokumentach; 2) sprzeczności między dokumentami, np. scena łamie mechanikę albo zasadę wizji, skutek zmienia coś, czego nie ma w C, tekst łamie styl z D; 3) działania gracza, na które dokumenty nie mają odpowiedzi. Do każdego punktu dodaj cytat i nazwę dokumentu. Nie poprawiaj, nie dopisuj treści, nie proponuj rozwiązań. Tylko wskaż.''')
P('Lista luk, jakiej można się spodziewać po tym pakiecie (przykładowa, do podmiany po prawdziwym kroku 6). Każda ma właściciela i decyzję.')
T(['#', 'Co wskazało AI (cytat i dokument)', 'Właściciel', 'Decyzja', 'Status'], [
    ['1', 'B, scena 2, „wymiana −8 dla obu”: C nie mówi, czy wymiana zeruje RYTM.', 'Mechanik', 'C: wymiana nie zmienia RYTM (to nie obrona). Dopisane w kolumnie „co to zmienia”.', 'Zamknięta na zajęciach'],
    ['2', 'B, scena 4, „Atakuję mimo wszystko”: przy pustej wytrzymałości atak kosztuje −10, a C mówi, że przy 0 „dostępne zostają parada w rytm i atak”. Czy atak może zejść poniżej 0?', 'Mechanik', 'C: wytrzymałość nie spada poniżej 0; atak przy 0 jest możliwy i kosztuje 0.', 'Zamknięta na zajęciach'],
    ['3', 'A, uczucia: „pokusa ryzyka” zniknęła, a twist opiera się na mechanice 3. Sprzeczność między A a kartą z Zajęć 1?', 'Dyrektor', 'Nie sprzeczność: twist opisuje zachowanie, a uczucia to najwyżej 3 pola. Zapisane w A przy twiście.', 'Zamknięta na zajęciach'],
    ['4', 'D nie mówi, co Mistrz Gry robi, gdy gracz napisze dwa ruchy naraz („parada i atak”).', 'Badacz', 'D, zasada 5: przyjmuje pierwszy ruch z listy, drugi ignoruje i mówi o tym jednym zdaniem.', 'Zamknięta na zajęciach'],
    ['5', 'C, niejasne sytuacje: „czy odstąpienie przy ZAMIAR 3/3 ma dalej dodawać +1” zapisane jako pytanie, bez rozstrzygnięcia.', 'Mechanik', 'Praca domowa: rozstrzygnąć (propozycja: przy 3/3 odstąpienie nie zmienia zamiaru, Napoleon czeka przy gablocie).', 'Praca domowa'],
    ['6', 'B nie ma sceny samouczka: wiersz o odbiorcy mówi, że sala 1 jest samouczkiem, a scena 1 od razu zapowiada cios.', 'Rozgrywka', 'Praca domowa: dopisać do sceny 1 zdanie, że pierwsze dwa ciosy Napoleona są wolniejsze i nie zmieniają ZAMIAR; albo oznaczyć prototyp jako „sala bez samouczka”.', 'Praca domowa']], [0.7, 6.5, 2, 5.8, 2])

H(2, 'M6. Karta motywacji: podsumowanie')
T(['Pole', 'Wpis', 'Kto wpisał'], [
    ['M1. Diagnoza', '1: 1 · 2: 1 · 3: 3 · 4: 1 · 5: 0 · 6: 2 · 7: 1 · 8: 2 (z dowodami wyżej)', 'Mechanik, rozgrywka, badacz; zebrał dyrektor'],
    ['M2. Najmocniejszy', '3. Kreatywność i feedback: etykieta i paski po każdym ruchu, wybór przy każdej zapowiedzi', 'Dyrektor'],
    ['M3. Do wzmocnienia', '1. Epickie znaczenie i 2. Rozwój; 4 i 5 poza prototypem; 6 i 8 celowo zostają na 2', 'Dyrektor po rozmowie'],
    ['M4. Wzmocnienia', 'Zamiar eksponatu (napęd 1, mechanika 1 i pętla, w prototypie: B, C, D). Rytm odczytany (napęd 2, mechanika 2 i pętla, w prototypie: B, C). Po zmianach: 1 → 2, 2 → 2.', 'Mechanik, rozgrywka'],
    ['M5. Pola 2–4', 'Mechaniki z oznaczeniami „Zmiana:”, pętla z RYTM i ZAMIAR, 3 uczucia z numerami mechanik', 'Właściciele pól'],
    ['M6. Pakiet gry v1', 'Dokumenty A–D · krok 6: 6 punktów, 4 zamknięte na zajęciach, 2 na pracę domową', 'Wszystkie role'],
    ['Spory', 'Seria parad: dłuższe okno, nie większy cios (zasada rytmu). Odliczanie zamiaru: odpada (pytanie 4). Epilog o sali: zostaje, bez wyrzutów (opisuje świat).', 'Dyrektor'],
    ['Prompt diagnozy', 'v1 wyżej. v2 nie powstał: po dwie propozycje na napęd przeszły filtr.', 'Dyrektor']], [3.5, 10, 3.5])

H(3, 'AI zaproponowało → zespół wziął / zmienił / odrzucił')
T(['Kto', 'AI zaproponowało', 'Decyzja', 'Dlaczego'], [
    ['Projektant rozgrywki', 'Zamiar eksponatu z odliczaniem czasu do gabloty', 'Zmienił', 'Zamiar zostaje, ale posuwa się tylko przez przepuszczone ciosy; odliczanie odpada według pytania 4 filtra'],
    ['Projektant mechanik', 'Zwiedzający-NPC do osłaniania', 'Odrzucił', 'Czwarta mechanika; limit 3 z Zajęć 1'],
    ['Projektant mechanik', 'Rytm odczytany jako bonus do obrażeń', 'Zmienił', 'Nagroda za rytm to dłuższe okno decyzji, nie większy cios: zgodne z wizją „wygrywa ten, kto odczyta rytm”'],
    ['Badacz', 'Codzienna seria i poziomy między pojedynkami', 'Odrzucił', 'Nie widać w jednej rozgrywce; seria to strach przed przerwaniem (napęd 8) u gościa, który wraca do muzeum raz'],
    ['Badacz', 'Scena z pytaniem „w którym roku była bitwa pod Borodino” za bonus do życia (z 8 scen od AI)', 'Odrzucił', 'Zasada „Historia to przeciwnik, nie quiz”'],
    ['Projektant rozgrywki', 'Dwie z 8 scen od AI działy się w drugiej sali (Kreml, Berlin)', 'Odrzucił', 'Zasada „Jedna sala, jeden pojedynek” i brief 4 minuty'],
    ['Dyrektor', 'W kroku 6 pierwsza odpowiedź AI zawierała gotową scenę samouczka', 'Odrzucił', 'AI ma tylko wskazywać luki; nowa rozmowa od „Nie poprawiaj, tylko wskaż”']], [3, 5.5, 2, 6.5])

H(2, 'Praca domowa przed Zajęciami 3')
T(['Kto', 'Co robi', 'Stan'], [
    ['Projektant mechanik', 'Zamyka lukę 5 w C: odstąpienie przy ZAMIAR 3/3.', 'Propozycja wpisu gotowa wyżej; do potwierdzenia we wspólnym pliku'],
    ['Projektant rozgrywki', 'Zamyka lukę 6 w B: samouczek w scenie 1.', 'Propozycja wpisu gotowa wyżej'],
    ['Badacz', 'Sprawdza, czy sceny 1–5 trzymają zasady 1–3 z D (3 zdania, słownictwo, ton).', 'Do zrobienia po podmianie scen na własne'],
    ['Dyrektor', 'Sprawdza kompletność: A–D są, luki zamknięte, zapis pracy z AI ma wpisy od różnych osób. Potwierdza prowadzącemu: „[Zespół]: pakiet gry v1 kompletny, luki z kroku 6 zamknięte.”', 'Przed Zajęciami 3']], [3.5, 9.5, 4])

H(2, 'Lista kontrolna przed oddaniem')
B(['Każdy z 8 napędów ma ocenę i dowód; ocena bez dowodu to 0 ✔',
   'Wybrane 2 napędy są słabe i pasują do wizji oraz odbiorcy ✔ (1 i 2)',
   'Każde wzmocnienie zmienia istniejącą mechanikę albo pętlę; mechanik jest najwyżej 3 ✔',
   'Każda propozycja przeszła filtr 4 pytań; odrzucone są w zapisie pracy z AI ✔',
   'Co najmniej jedno wzmocnienie jest widoczne w dokumencie B, C albo D ✔ (oba)',
   'Każda scena w B ma napęd; każda rzecz w C ma napęd ✔',
   'Dokument D ma zasadę etyczną dla napędów 6–8 ✔ (zasada 4)',
   'Krok 6: każda luka ma właściciela, każda sprzeczność ma decyzję, lista luk na pracę domową jest zapisana ✔ (do podmiany po prawdziwym kroku 6)',
   'Są co najmniej 3 wpisy o propozycjach AI, od różnych osób ✔ (7 wpisów, 4 role)',
   'Do zrobienia na zajęciach: imiona i nazwa zespołu, powody z rozgrzewki, prawdziwe odpowiedzi AI z własnych czatów, prawdziwa lista luk z kroku 6'])

doc.save(OUT)
open(MD, 'w', encoding='utf-8').write('\n'.join(md))
print('saved', OUT)
