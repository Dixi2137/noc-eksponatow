# Noc Eksponatów

Gra przeglądarkowa 2D bez zależności. Otwórz `dist/index.html` albo uruchom dowolny serwer HTTP dla folderu `dist`.

Sterowanie: A/D lub strzałki — ruch; J/spacja — atak; K/Shift — parada; L — unik; Escape — pauza. Przyciski dotykowe dostępne na telefonach.

Każdy nowy pojedynek poprzedza pełna, 18-sekundowa scenka bez możliwości pominięcia. W walce uczestniczą tylko rycerz i T-rex. Każdy cios wywołuje próbę uniku lub parowania; osłabiona garda przepuszcza obrażenia, a perfekcyjna parada odbija je w atakującego. Wygrywa się wyłącznie po zbiciu życia T-rexa do zera. Po walce stróż budzi się ze snu.

Żetony, wyglądy oraz wybrany skin zapisują się lokalnie w przeglądarce. Skrzynki nie wykorzystują prawdziwych pieniędzy. Każdy skin ma własną zdolność, wybieraną przed pojedynkiem. Aktywny jest wyłącznie bonus założonego skina.

Grafika powstaje bezpośrednio na canvasie, dźwięki są syntezowane przez Web Audio. Gra nie wymaga pobierania obrazów ani bibliotek. Czcionki Google są opcjonalne; w trybie offline używane są czcionki systemowe.

## Aktualizacja 2

T-rex pilnuje dystansu między sylwetkami, zapowiada każdy atak i zatrzymuje się na czas zamachu. Po ciosie ma okres słabej gardy, a potem odzyskuje dystans przed kolejnym atakiem.

Skrzynki zawierają 56 dodatkowych skinów w czterech rzadkościach. Osobno dostępny jest bezpłatny eksponat specjalny Stachu Jones. Pierwsza Skrzynia Galerii jest darmowa; następne kosztują 600 żetonów. Skarbiec Królów kosztuje 1800 żetonów i gwarantuje co najmniej epicki strój; Relikwiarz Legend kosztuje 4500 żetonów i gwarantuje legendarny strój. Żetony zdobywasz w grze. Brak duplikatów; aktualne szanse są pokazane przed otwarciem. Nagroda zapisuje się przed animacją i jest odzyskiwana po odświeżeniu. Założenie skina jest osobną decyzją przed walką.

## Zdolności skinów

- Stara Gwardia: +20 punktów maksymalnego życia.
- Mroźny Relikt: o 0,12 s dłuższe okno perfekcyjnej parady.
- Czarny Kustosz: 20% mniej otrzymywanych obrażeń (zaokrąglanie do pełnych punktów życia w górę).
- Patyna Wieków: 30% szybsza regeneracja energii.
- Żar Kuźni: 35% więcej obrażeń przy przełamywaniu osłabionej gardy (zaokrąglanie w górę).
- Królewska Warta: 25% niższy koszt energii parad i uników.
- Słoneczny Paladyn: perfekcyjna parada odnawia 6 punktów życia, do maksimum.

Zdolności nie sumują się i nie można zmieniać skina podczas pojedynku.

## Kolekcja rycerska — 50 nowych strojów

Do oryginalnych 7 skinów dodano pełną kolekcję 50 strojów z listy: dokładne nazwy, podane palety, własne motywy hełmów i herbów oraz bonus każdego stroju. Numery 1–15 są zwykłe, 16–30 rzadkie, 31–45 epickie, 46–50 legendarne.

Zbrojownia ma wyszukiwarkę ignorującą wielkość liter i polskie znaki, filtry rzadkości/posiadania, przełącznik nowej pięćdziesiątki i strony po 12 strojów.

Skrzynie losują rzadkość z wag 55% zwykłe / 28% rzadkie / 14% epickie / 3% legendarne, a następnie równomiernie losują nieodkryty skin z tej rzadkości. Po zebraniu całej rzadkości szanse przeliczają się pomiędzy pozostałymi. Stare skiny, waluta, wybrany strój i oczekująca nagroda zostają zachowane.

Dane nowej kolekcji: dist/knights.js. Moduł musi być załadowany przed perks.js, art.js, game.js i loot.js.

## Sklep — przygotowanie płatności

Planowane ceny skrzyń: Galeria 19,99 zł, Skarbiec Królów 49,99 zł, Relikwiarz Legend 99,99 zł. Ceny PLN są wyłącznie zapowiedzią; przycisk płatności jest wyłączony i nie pobiera pieniędzy ani nie przyznaje nagród. Działa otwieranie za żetony.

Uruchomienie prawdziwych zakupów wymaga konta sprzedawcy i integracji operatora z backendem: ceny i zamówienia po stronie serwera, potwierdzony webhook płatności, jednokrotne przyznanie nagrody oraz konto gracza z zapisem na serwerze. Obecny zapis localStorage służy rozgrywce lokalnej; nie jest autorytatywnym portfelem zakupów. Konfiguracja ofert: dist/loot.js. Widok sklepu: dist/shop.js.

## Otwarcie skrzyni

Otwarcie trwa około 8,2 sekundy: pieczęć (0,9 s), przewijanie z wyhamowaniem (6,5 s), zatrzymanie (0,8 s) i odsłonięcie nagrody. Mechaniczne kliknięcia i finał respektują wyciszenie gry; preferencja ograniczenia ruchu w systemie skraca odsłonięcie do mniej niż sekundy. Wynik i koszt zapisują się przed efektem. Dekoracyjne karty nie zmieniają szans ani przyznanej nagrody.

## Stachu Jones

58. strój, specjalny prezent dostępny od razu w kolekcji. Inspirowany zdjęciem przekazanym przez użytkownika: siwe włosy i wąs, granatowy płaszcz, bordowa tunika, zużyta zbroja i kosa na drewnianym trzonie. Zdolność UPÓR STACHA daje +30 maks. HP (150 HP). Prezent nie zmienia istniejącego wyboru stroju ani szans skrzyń.

## Faza 0 — fundament (2026-10-19)

Przeciwnik i broń są danymi, nie kodem walki:

- `dist/exhibits.js` — `window.MuseumExhibits`: każdy eksponat to wpis z HP, rytmem walki (`combat`: zamach, cios, odpoczynek, dystanse) i obrażeniami (`damage`). T-rex jest pierwszym wpisem o id `trex`. Klucz `art` wskazuje funkcję rysującą w `MuseumArt.fighters`.
- `dist/weapons.js` — `window.MuseumWeapons`: broń rycerza z zasięgiem, kosztem energii, czasem zamachu, obrażeniami w słabą gardę, bonusem serii i tym, ile odbija perfekcyjna parada. Miecz (`sword`) jest pierwszym wpisem.
- `game.js` czyta oba moduły. Przeciwnik w stanie gry nazywa się `foe` (dawniej `rex`); migawka `getState()` ma `foeHP`, `foeState`, `foe`, `exhibit` i `weapon`. `MuseumGame.start({skin, exhibit, weapon, sound})`.
- Zdarzenie `game:end` niesie `exhibit`, `weapon` i `skin`.
- `art.js` ma `drawExhibit(ctx, key, x, y, opcje)` i mapę `fighters`; nowy przeciwnik to jeden wpis tam i jeden w `exhibits.js`.

Kolejność skryptów: `knights.js`, `perks.js`, `weapons.js`, `exhibits.js`, `art.js`, `game.js`, `loot.js`, `shop.js`, `loot-show.js`, `ui.js`.

### Testy bez Node

`tests/index.html` uruchamia testy walki w przeglądarce. Odpal dowolny serwer HTTP w folderze `work/noc-eksponatow` i otwórz `/tests/`. Wynik jest w tytule strony, na stronie i w `window.__results`. Testy odpowiadają dawnemu `work/qa-suite.cjs`, ale sprawdzają liczby z obecnej gry (zapisane w `work/qa-results.json` „16/16” pochodziło ze starszej wersji bez perków i bez obecnych czasów ciosu).

## Faza 1 — poziomy, przeciwnicy z historii, przeskok w czasie (2026-10-19)

Noc to obchód po salach. Jeden poziom = jedna epoka = jeden przeciwnik:

| # | Sala | Rok | Przeciwnik | Sceneria |
| --- | --- | --- | --- | --- |
| 01 | Kreda późna | 75 mln lat temu | Velociraptor (110 HP, szybki) | muzeum |
| 02 | Koniec kredy | 66 mln lat temu | Tyrannosaurus rex (160 HP) | muzeum |
| 03 | Termopile | 480 p.n.e. | Leonidas I (180 HP, włócznia i tarcza) | sala antyku, słońce, sztandary Λ |
| 04 | Borodino | 1812 | Napoleon Bonaparte (170 HP, szabla) | śnieg, sztandary N |
| 05 | Berlin | 1945 | Adolf Hitler (150 HP, pistolet z bliska) | bunkier, beton, popiół |
| 06 | Moskwa | 1953 | Józef Stalin (220 HP, szaszka, ciężki co drugi cios) | Kreml, czerwone sztandary ★ |

- `dist/levels.js` — `window.MuseumLevels`: kolejność, rok, sala, eksponat, motyw scenerii, nagroda bazowa, tekst karty i (tylko dla sali 1) trzyczęściowy prolog.
- `dist/exhibits.js` — pięciu nowych przeciwników. Postacie historyczne używają wspólnego rigu `drawFigure` w `art.js` z kostiumem opisanym w polu `figure` (nakrycie głowy, płaszcz, wąsy, broń, tarcza). Velociraptor to szkielet T-rexa w skali 0,62 z innym odcieniem.
- `art.js` — `drawArena(ctx, w, h, t, motyw)` i mapa `themes` (museum, sparta, napoleon, bunker, kremlin): kolory ścian i podłogi, napis nad wejściem, okna (księżyc, słońce, śnieg, zamurowane), sztandary, cząsteczki (kurz, śnieg, popiół).
- `ui.js` — przebieg nocy: prolog 18 s tylko przy starcie od sali 1; inne sale dostają kartę 2,6 s. Wygrana → ekran „KO" → przeskok w czasie (4,2 s, rok przewija się od epoki do epoki, sceneria zmienia się w błysku) → następna walka. Przegrana lub ostatnia sala → epilog ze snem i wyniki całej nocy. Nagroda za salę: `reward` poziomu + 20 za każdą perfekcyjną paradę; przegrana 40.
- Postęp w profilu (`localStorage`): `cleared` (zaliczone sale) i `level` (sala, od której zaczyna się następna noc). Pasek sal w menu pozwala wybrać dowolną odblokowaną salę.
- Hitler i Stalin są wyłącznie przeciwnikami do pokonania, nie przedmiotami kolekcji. Opaska na ramieniu jest jednolicie czerwona, bez symbolu.
- `tests/levels.js` sprawdza komplet danych poziomów i eksponatów, rysowanie wszystkich póz i motywów oraz to, że z każdym eksponatem da się wygrać i od każdego oberwać. `tests/gallery.html` pokazuje wszystkich przeciwników i scenerie na jednej stronie.

## Faza 2 — ekonomia, broń, karty (2026-10-19)

Jeden katalog przedmiotów (`MuseumLoot.items`): 58 strojów, 5 broni, 13 kart. Każdy ma rzadkość i wartość (`values`: zwykły 150, rzadki 400, epicki 1000, legendarny 2500; podstawowy i prezent 0).

- **Broń** (`dist/weapons.js`): miecz (podstawowy), topór (wolny, 13 obrażeń, mocniejsze odbicie), włócznia (zasięg 470), rapier (szybki, bonus serii od 2. ciosu), rewolwer (legendarny, dystansowy). Każda ma własny zasięg, koszt energii, czas zamachu, obrażenia w słabą gardę, bonus serii i odbicie parady.
- **Rewolwer**: 6 naboi na walkę, strzał trafia z całej areny, ale tylko w osłabioną gardę; zamach i cios przeciwnik odbija, w ruchu uskakuje. Po wystrzelaniu bębna próba strzału uruchamia przeładowanie 1,6 s (bez strzałów, parada działa). HUD pokazuje naboje. Stan w `getState().weapon` (`ammo`, `maxAmmo`, `reload`).
- **Karty** (`dist/cards.js`): 8 kart bohaterów (Spartakus, Pułaski, Zawisza, Hannibal, Kościuszko, Sobieski, Joanna d'Arc, Chrobry) z jednym pasywnym bonusem; aktywna jest jedna, wybierana w kolekcji. 5 kart broni działa automatycznie, gdy założona jest pasująca broń (+10% obrażeń, rewolwer +2 naboje). Bossowie nocy nigdy nie są kartami.
- **Modyfikatory** (`loot.modifiers(profile)` → `MuseumGame.start({modifiers})`): karta bohatera, karta broni i ulepszenia łączą się z perkiem skina: wartości płaskie dodają się, mnożniki mnożą.
- **Skrzynki** (`dist/loot.js`, pole `pool`): 9 skrzyń strojów jak dotąd plus Arsenał Kustosza (900 ✦, broń) i Archiwum Bohaterów (800 ✦, karty). Sklep ma filtry BROŃ i KARTY. Bez duplikatów, szanse widoczne, nagroda zapisana przed animacją (`pendingReward`, `pendingKind`).
- **Sprzedaż** (`loot.sell`): 40% wartości; nie da się sprzedać założonego przedmiotu, przedmiotu podstawowego ani prezentu. Sprzedaż kasuje ulepszenia przedmiotu. Przycisk z potwierdzeniem w kolekcji.
- **Ulepszanie** (`loot.upgrade`): pięć poziomów, koszt 250 + 350·poziom. Strój: +6 maks. HP na poziom. Broń: +8% obrażeń w słabą gardę na poziom. Zapis w `profile.upgrades` pod kluczem `rodzaj:id`.
- **Bonus dzienny** (`loot.dailyBonus`): 50 ✦ pierwszego dnia, +25 za każdy kolejny dzień z rzędu, maksymalnie 300; dzień przerwy resetuje serię. Liczony lokalnie po dacie w `profile.login` (serwerowa wersja w fazie 4). Menu pokazuje serię i jutrzejszy bonus.
- Kolekcja ma zakładki STROJE / BROŃ / KARTY; miniatury broni i kart rysuje `art.js` (`drawWeaponIcon`, `drawCardArt`).
- Profil migruje bez utraty: stare zapisy dostają `weapons: ['sword']`, puste karty i ulepszenia, nieznane id są odrzucane.
- Testy: `tests/economy.js` (15 testów), łącznie 44.
