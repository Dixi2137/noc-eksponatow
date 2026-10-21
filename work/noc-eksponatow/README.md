# Noc Eksponatów

Gra przeglądarkowa 2D bez zależności. Otwórz `dist/index.html` albo uruchom dowolny serwer HTTP dla folderu `dist`.

Sterowanie: A/D lub strzałki — ruch; J/spacja — atak; K/Shift — parada; L — unik; Escape — pauza. Przyciski dotykowe dostępne na telefonach.

Każdy nowy pojedynek poprzedza pełna, 18-sekundowa scenka bez możliwości pominięcia. W walce uczestniczą tylko rycerz i T-rex. Każdy cios wywołuje próbę uniku lub parowania; osłabiona garda przepuszcza obrażenia, a perfekcyjna parada odbija je w atakującego. Wygrywa się wyłącznie po zbiciu życia T-rexa do zera. Po walce stróż budzi się ze snu.

Żetony, wyglądy oraz wybrany skin zapisują się lokalnie w przeglądarce. Skrzynki nie wykorzystują prawdziwych pieniędzy. Każdy skin ma własną zdolność, wybieraną przed pojedynkiem. Aktywny jest wyłącznie bonus założonego skina.

Grafika powstaje bezpośrednio na canvasie, dźwięki są syntezowane przez Web Audio. Gra nie wymaga pobierania obrazów ani bibliotek. Czcionki Google są opcjonalne; w trybie offline używane są czcionki systemowe.

## Aktualizacja 2

T-rex pilnuje dystansu między sylwetkami, zapowiada każdy atak i zatrzymuje się na czas zamachu. Po ciosie ma okres słabej gardy, a potem odzyskuje dystans przed kolejnym atakiem.

Skrzynki zawierają 56 dodatkowych skinów w czterech rzadkościach. Osobno dostępne są bezpłatne eksponaty specjalne: Stachu Jones i Jan Paweł II. Pierwsza Skrzynia Galerii jest darmowa; następne kosztują 600 żetonów. Skarbiec Królów kosztuje 1800 żetonów i gwarantuje co najmniej epicki strój; Relikwiarz Legend kosztuje 4500 żetonów i gwarantuje legendarny strój. Żetony zdobywasz w grze. Brak duplikatów; aktualne szanse są pokazane przed otwarciem. Nagroda zapisuje się przed animacją i jest odzyskiwana po odświeżeniu. Założenie skina jest osobną decyzją przed walką.

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


Układ sklepu (faza73): trzy zakładki. **SKRZYNIE**: po lewej katalog kompaktowych kafelków (pikselowa skrzynia, numer, kategoria, nazwa, koszt w ✦, planowana cena w zł, postęp puli) pogrupowany w sekcje według `crateGroups`, z filtrami rodzin nad listą; po prawej przyklejony panel wybranej skrzyni (grafika, opis, szanse na rzadkości, rozwijana zawartość, przycisk otwarcia za żetony, planowana cena). Poniżej 900 px panel schodzi pod katalog. **WYKOŃCZENIA**: siatka 28 mitycznych powłok z ikoną na aktualnej broni, ceną i przyciskiem KUP z salda. **PORTFEL**: saldo i przyciski wpłat jako zapowiedź: kliknięcie niczego nie dolicza, tylko informuje, że płatności nie są podpięte (`loot.deposit` zostaje w API na przyszłość). Żetony i saldo są zawsze widoczne w nagłówku sklepu. Skrzynie otwiera się wyłącznie tu: przycisk w panelu skrzyni uruchamia losowanie nad sklepem; kolekcja (zakładka KOLEKCJA) pokazuje już tylko przedmioty. Nieodkryte eksponaty są w kolekcji **zablokowane**: rozmyta grafika z kłódką i napisem ZABLOKOWANE, bez nazwy, w osobnej sekcji za odkrytymi (wyszukiwarka ich nie zdradza); kliknięcie mówi, z których skrzyń wypadają.
Planowane ceny skrzyń: Galeria 19,99 zł, Skarbiec Królów 49,99 zł, Relikwiarz Legend 99,99 zł. Ceny PLN są wyłącznie zapowiedzią; przycisk płatności jest wyłączony i nie pobiera pieniędzy ani nie przyznaje nagród. Działa otwieranie za żetony.

Uruchomienie prawdziwych zakupów wymaga konta sprzedawcy i integracji operatora z backendem: ceny i zamówienia po stronie serwera, potwierdzony webhook płatności, jednokrotne przyznanie nagrody oraz konto gracza z zapisem na serwerze. Obecny zapis localStorage służy rozgrywce lokalnej; nie jest autorytatywnym portfelem zakupów. Konfiguracja ofert: dist/loot.js. Widok sklepu: dist/shop.js.

## Otwarcie skrzyni

Otwarcie trwa około 8,2 sekundy: pieczęć (0,9 s), przewijanie z wyhamowaniem (6,5 s), zatrzymanie (0,8 s) i odsłonięcie nagrody. Mechaniczne kliknięcia i finał respektują wyciszenie gry; preferencja ograniczenia ruchu w systemie skraca odsłonięcie do mniej niż sekundy. Wynik i koszt zapisują się przed efektem. Dekoracyjne karty nie zmieniają szans ani przyznanej nagrody.

## Stachu Jones

58. strój, specjalny prezent dostępny od razu w kolekcji. Inspirowany zdjęciem przekazanym przez użytkownika: siwe włosy i wąs, granatowy płaszcz, bordowa tunika, zużyta zbroja i kosa na drewnianym trzonie. Zdolność UPÓR STACHA daje +30 maks. HP (150 HP). Prezent nie zmienia istniejącego wyboru stroju ani szans skrzyń.

## Presja: trudność rosnąca z salą

`MuseumGame.start` dostaje `difficulty` (numer sali); `pressure` = 0 w sali 1 (samouczek), 0,45 od sali 2 i liniowo do 1 w sali 12 (`clamp(0,45 + (sala − 2) / 18, 0, 1)`). Pod presją wróg ma do 30% więcej HP, ciosy bolą do 50% więcej, blok kosztuje do 50% więcej wytrzymałości, zamach jest do 30% krótszy, ciężkie ataki przychodzą częściej, okno perfekcyjnej parady kurczy się do 30%, zwykły blok przepuszcza do 40% obrażeń blokowanych (BLOK −n), a odruchowy unik bez gardy to w sali 1 rzut monetą i pod pełną presją nie istnieje: niebroniony cios zawsze dochodzi. Tylko perfekcyjna parada zeruje obrażenia. (Do wersji faza67 tabela obrażeń wroga i licznik zadanych obrażeń dzieliły klucz `state.damage`, przez co po pierwszym trafieniu wroga jego ciosy dawały NaN i rycerz nie tracił HP; teraz tabela to `state.foeDamage`, z testem regresji.) Presja skaluje tempo przeciwnika: szybkość marszu ×(1+1,4p), przerwy (`idleDelay`, `repositionTime`, `retreatTime`) i odpoczynek po ciosie krótsze, zamach krótszy, mniejszy dystans, jaki lubi trzymać; pod presją zamiast grzecznie się cofać, gdy gracz podejdzie, często od razu atakuje.

Trafienie wroga, który idzie na gracza (stan idle/approach/retreat/reposition), to **cios presji**: drobne obrażenia (30% obrażeń słabej gardy), **odrzut** (strzał 56 px, broń ciężka/drzewcowa 36, reszta 24, malejący z presją do 40%) i **chwianie** (`stagger`, 0,42 s, krótsze z presją), po którym wróg przez ~1,1 s trzyma równowagę (bez stun-locka: kolejne trafienia tylko odrzucają). Lekki zamach da się **przerwać** (75% szansy strzałem, 55% bronią białą, malejąco z presją, nigdy ciężkiego). Pod presją rośnie szansa, że wróg **uniknie** ciosu w marszu (do 50%). Etykiety: ODRZUT, DRAŚNIĘCIE, PRZERWANY, UNIK.

## Jan Paweł II

Drugi eksponat specjalny, dostępny od razu dla każdego gracza: biała sutanna, czerwona mucet ze złotym obszyciem, piuska i złoty krzyż na piersi. W pikselowym trybie ma własnego sprite'a (długa sutanna zamiast nagolenników), a w walce trzyma dowolną wybraną broń. Perk „Nie lękajcie się”: +3 HP za każdą perfekcyjną paradę i 130 HP na start.

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

## Faza 3 — zbrojownia: własna sala muzealna (2026-10-19)

Zakładka **04 MOJA SALA** otwiera prywatną salę gracza (`dist/hall.js`, `window.MuseumHall`).

- Osiem miejsc ekspozycji (`slots`): dwa postumenty na zbroje (skiny), dwa wieszaki na broń, dwie ramy na karty, dwie gabloty na trofea. Miejsce przyjmuje tylko posiadany przedmiot właściwego rodzaju; sprzedany przedmiot znika z ekspozycji przy następnym renderze (`exhibition()` sprawdza posiadanie).
- **Trofea** to przedmioty limitowane: po jednym za każdą pokonaną salę (`trophies`, klucz `level`), nie ma ich w katalogu skrzyń, nie da się ich kupić ani sprzedać. Posiadanie wynika z `profile.cleared`, więc nic dodatkowego nie trzeba zapisywać.
- **Prestiż** (`summary()`): punkty za rzadkość wystawionych przedmiotów (podstawowy 1, zwykły 2, rzadki 4, epicki 8, legendarny 16, trofeum 12) + 2 za każdy poziom ulepszenia + 20 za pełną salę. **Wartość ekspozycji** to suma wartości wystawionych przedmiotów (trofea 0).
- Nazwa sali (do 28 znaków) jest wypisana nad wejściem; zapis w `profile.hall = {name, slots}` (migracja w `loot.migrate` przez `MuseumHall.migrate`).
- Rysowanie: `art.js` ma motyw `hall` (bez reliefów), `drawHall(ctx, w, h, t, ekspozycja, {name})` i `drawTrophy`. Panel sali: pole nazwy, podgląd na canvasie, lista miejsc z wyborem, siatka trofeów (nieodkryte jako „???" z nazwą sali do pokonania).
- Kolejność skryptów: `hall.js` po `cards.js`, przed `art.js` i `loot.js`.
- Testy: `tests/hall.js` (8 testów), łącznie 52.

## Faza 4 — konto, zapis w chmurze, ranking (2026-10-19, strona kliencka)

Backend: Supabase (logowanie e-mail + hasło, Postgres z Row Level Security). Gra działa jako gość bez żadnej konfiguracji; konto jest opcjonalne.

- `dist/config.js` — `supabaseUrl` i `supabaseAnonKey`. Puste = chmura wyłączona (przycisk konta i ranking mówią o tym wprost). Klucz anon jest publiczny z założenia; o dostępie decydują polityki RLS.
- `dist/cloud.js` — `window.MuseumCloud`: klient bez biblioteki, czysty `fetch` do Auth (`/auth/v1/signup`, `token?grant_type=password|refresh_token`, `logout`) i PostgREST (`/rest/v1/...`). Sesja w `localStorage` (`museum-night-session`), odświeżana automatycznie przed wygaśnięciem. Każde wywołanie zwraca `{ok, data|error}`, błędy po polsku (`messageFor`).
- `supabase/schema.sql` — tabela `profiles` (pseudonim, zapis gry `save` jsonb, statystyki, stan bonusu dziennego), widok `leaderboard` (tylko publiczne kolumny), trigger tworzący profil przy rejestracji, RPC `nickname_taken(name)` i `claim_daily_bonus()` (data serwera w Europe/Warsaw, więc zmiana zegara w systemie nic nie daje).
- UI: przycisk **KONTO** w górnym pasku (modal z logowaniem/rejestracją; po zalogowaniu: zapisz/wczytaj z chmury, wyloguj), zakładka **05 RANKING** (działa też dla gości, tylko odczyt).
- Zapis w chmurze: każde `persist()` odkłada wysyłkę o 2,5 s (`pushCloud`), koniec nocy wysyła od razu. Przy logowaniu: jeśli w chmurze jest niepusty zapis, a lokalny jest świeży, gra wczytuje chmurę; w przeciwnym razie pyta (`confirm`) albo wysyła lokalny postęp.
- Ranking: `halls_cleared` (pokonane sale), `prestige` (prestiż sali), `fastest_night` (najszybsza pełna noc, tylko po przejściu wszystkich sal), `night_coins`. Rekordy nocy w `profile.records`.
- Bonus dzienny: zalogowani dostają go z RPC (serwer), goście lokalnie jak w fazie 2.
- Testy: `tests/cloud.js` (6 testów z podstawionym `fetch`), łącznie 58. Runner obsługuje testy asynchroniczne.

### Uruchomienie chmury (raz)
1. Konto na supabase.com, nowy projekt (region EU), hasło do bazy zapisz w menedżerze haseł.
2. SQL Editor → wklej `supabase/schema.sql` → Run.
3. Authentication → Providers → Email: włączone. Dla wygody testów wyłącz „Confirm email" (albo zostaw, gra obsługuje potwierdzenie linkiem).
4. Project Settings → API: skopiuj Project URL i klucz `anon public` do `dist/config.js`.
5. Przebuduj `outputs/Noc-Eksponatow.html` skryptem `work/build-offline.py`.

## Faza 5 — 36 sal nocnego obchodu (2026-10-21)

Do sześciu sal doszło trzydzieści nowych z antagonistami z historii, wpiętych chronologicznie. `levels.js` sortuje wpisy po roku i numeruje je automatycznie, nagroda rośnie z numerem sali (120 + 15·indeks).

| # | Rok | Przeciwnik | Styl | # | Rok | Przeciwnik | Styl |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | 75 mln | Velociraptor | — | 19 | 1718 | Czarnobrody | gunman |
| 02 | 66 mln | T-rex | — | 20 | 1794 | Robespierre | duelist |
| 03 | 480 p.n.e. | Leonidas | — | 21 | 1812 | Napoleon | — |
| 04 | 479 p.n.e. | Kserkses I | tyrant | 22 | 1900 | Leopold II | tyrant |
| 05 | 210 p.n.e. | Qin Shi Huang | tyrant | 23 | 1916 | Rasputin | brute |
| 06 | 4 p.n.e. | Herod Wielki | trickster | 24 | 1929 | Al Capone | gunman |
| 07 | 40 | Kaligula | trickster | 25 | 1940 | Mussolini | brute |
| 08 | 64 | Neron | tyrant | 26 | 1941 | Tōjō | duelist |
| 09 | 192 | Kommodus | duelist | 27 | 1945 | Hitler | — |
| 10 | 451 | Attyla | brute | 28 | 1953 | Stalin | — |
| 11 | 1211 | Czyngis-chan | duelist | 29 | 1966 | Mao | tyrant |
| 12 | 1398 | Tamerlan | tyrant | 30 | 1976 | Idi Amin | brute |
| 13 | 1462 | Wład Palownik | trickster | 31 | 1977 | Pol Pot | trickster |
| 14 | 1483 | Torquemada | tyrant | 32 | 1989 | Ceaușescu | tyrant |
| 15 | 1521 | Cortés | duelist | 33 | 1991 | Saddam | gunman |
| 16 | 1532 | Pizarro | gunman | 34 | 1993 | Escobar | trickster |
| 17 | 1570 | Iwan Groźny | brute | 35 | 2001 | bin Laden | gunman |
| 18 | 1610 | Elżbieta Batory | trickster | 36 | 2011 | Kaddafi | brute |

- **Archetypy walki** (`MuseumExhibits.archetypes`): tyrant (wyważony), brute (wolny, ciężki co drugi cios, długi odpoczynek), duelist (szybki, rzadko ciężki), trickster (lekkie ciosy bez ostrzeżenia, ciężkie z długim zamachem), gunman (pistolet lub karabin z bliska, krótki kontakt). Helper `villain(id, …, archetyp, tier, kostium)` skaluje HP (150 + 18·tier) i obrażenia po tierze 1–6.
- **Dopełniacz** (`aliasGen`): podpowiedzi w walce odmieniają imię poprawnie („rani Kaliguli", „garda Robespierre'a").
- **Rig postaci** dostał nowe nakrycia głowy (korona, mianguan, wieniec laurowy, turban, futrzana czapa, kaptur, tricorn, fez, czapka, beret, fedora, morion, hełm), brody (pełna, długa, kozia) i wąsy podkręcone oraz bronie: karabin, sztylet, topór, laska, łuk.
- **Scenerie**: 18 nowych motywów w `art.js` (rome, persia, china, judea, steppe, castle, church, aztec, tsar, pirate, revolution, jungle, speakeasy, fascist, japan, desert, cartel, palace).
- **Trofea**: po jednym za każdą z 36 sal (`hall.js`).
- Wszyscy nowi są wyłącznie bossami; nie ma ich w skrzynkach ani kartach. Wybrani: postacie historyczne powszechnie uznawane za tyranów, zbrodniarzy lub bandytów, żadna żyjąca.
- `tests/gallery.html?compact` pokazuje wszystkich 36 w jednej siatce.

## Porządki (2026-10-21)

Z areny zniknął plakat reklamowy piwa Kustosz i napis o sponsorze walki; usunięty też obrazek `assets/kustosz-reklama.png` i jego osadzanie w buildzie offline. Nazwa Kustosz zostaje tylko tam, gdzie znaczy kustosza muzeum (sklep, rewolwer, arsenał).

## Faza 6 — witryna skrzyń (2026-10-21)

- **Siedemnaście skrzyń.** Do 11 dotychczasowych doszły: Skrzynia Startowa (300 ✦, tylko zwykłe i rzadkie), Skrzynia Nocnej Zmiany (700 ✦, mieszana), Skarbiec Kustosza (2500 ✦, mieszana, minimum epicki), Skrzynia Legend (6000 ✦, mieszana, tylko legendarne), Panteon Bohaterów (1000 ✦, tylko karty bohaterów) i Plany Broni (500 ✦, tylko karty broni). Pole `pool: 'any'` w `loot.js` losuje z wszystkich rodzajów przedmiotów; rodzina `mixed` ma własny filtr w sklepie.
- **Grafika skrzyń** jest rysowana na canvasie (`MuseumArt.drawCrate`): materiał zależy od rodziny (drewno, lakier w kolorze kategorii, stal dla broni, ozdobna szkatuła dla kart, ciemna z poświatą dla mieszanych), okucia i emblemat w kolorze skrzyni (`glyph` w danych), iskry. Ta sama grafika w sklepie i w kolekcji.
- **Witryna w kolekcji** zastępuje listę rozwijaną: przewijany rząd kart skrzyń z nazwą, ceną i plakietką (DARMOWA, NAJLEPSZA OFERTA, TYLKO LEGENDY, NOWOŚĆ, ZEBRANA). Kliknięcie wybiera skrzynię, a duży rysunek i szczegóły pod spodem się aktualizują.
- Testy: 60.

## Faza 7 — zbrojownia na serio i nowy cennik (2026-10-21)

**24 bronie w pięciu typach i czterech epokach** (`dist/weapons.js`). Typ ustala rytm (`types`), epoka trafia do skrzyń (`categoryId`), rzadkość dodaje obrażeń (+1 rzadki, +2 epicki, +3 legendarny).

| Typ | Bronie |
| --- | --- |
| Ostrza | miecz rycerski (podstawowy), gladius, szabla damasceńska, claymore, szabla husarska, katana |
| Broń ciężka | topór bojowy, młot bojowy, morgensztern, berdysz, labrys |
| Broń drzewcowa | włócznia hoplity, trójząb retiariusa, halabarda, pika |
| Broń lekka | rapier szlachecki, sztylet, bagnet, stylet |
| Broń dystansowa | rewolwer Kustosza, łuk refleksyjny, kusza, muszkiet, strzelba Kustosza |

Epoki: starożytność, średniowiecze, nowożytność, wiek XIX i XX. Każda broń ma własną ikonę (`drawWeaponIcon`, 20 kształtów). Podgląd: `tests/weapons.html`.

**Skrzynie: 26 w siedmiu grupach** (`crateGroups`): klasyczne, stroje według motywu, cała zbrojownia, broń według typu (Zbrojownia Ostrzy, Kuźnia Ciężka, Sala Drzewcowa, Gabinet Sztyletów, Strzelnica Kustosza), broń według epoki (Arsenał Antyku, Średniowiecza, Nowożytny, XX Wieku), karty, mieszane. Witryna w kolekcji pokazuje każdą grupę jako osobny, przewijany rząd z nagłówkiem. Skrzynie broni filtrują po `weaponType` i `categoryId`.

**Cennik.** Żetony za salę: 120–645 plus 20 za paradę, więc pełna noc daje kilkanaście tysięcy. Ceny skrzyń podniesione mniej więcej półtora do dwóch razy: Galeria 900 (29,99 zł), tematyczne 1500–2200, Skarbiec Królów 3000 (79,99 zł), Relikwiarz 7500 (149,99 zł), broń według typu 1600–2600, według epoki 1700–2800, karty 800–1500, startowa 400, Nocnej Zmiany 1200, Skarbiec Kustosza 4000, Legend 9000 (199,99 zł). Reguła: około 40 żetonów za złotówkę. Wartości przedmiotów: zwykły 240, rzadki 700, epicki 1800, legendarny 4500 (sprzedaż 40%). Ulepszenia 400 + 600·poziom. Bonus dzienny 80 + 40 za dzień serii, do 500.

Testy: 64.

## Faza 8 — 122 bronie (2026-10-21)

Zbrojownia urosła z 24 do 122 sztuk (`dist/weapons.js`), siedem typów i pięć epok:

| Typ | Ile | Przykłady |
| --- | --- | --- |
| Ostrza | 24 | xiphos, gladius, spatha, falcata, jian, seax, miecz długi, falchion, półtorak, tachi, claymore, Szczerbiec, Zulfikar, szabla husarska, pałasz, katana, wakizashi, zweihänder, kordelas, szabla kawaleryjska, szaszka |
| Broń ciężka | 16 | maczuga, labrys, franciska, topór duński, kiścień, cep bojowy, młot bojowy, młot oburęczny, morgensztern, czekan, nadziak, buzdygan, berdysz, łom, kij bejsbolowy, młot kowalski |
| Broń drzewcowa | 14 | pilum, sarissa, trójząb, widły, glewia, yari, naginata, halabarda, rohatyna, partyzana, pika, kopia husarska, lanca |
| Noże i sztylety | 19 | pugio, sica, mizerykordia, sztylet rondelowy, tantō, kris, stylet, rapier, szpada, nóż Bowie, kukri, nóż szturmowy, bagnet, nóż motylkowy, karambit, maczeta, nóż taktyczny, bagnet M9 |
| Łuki i kusze | 10 | proca, łuk kompozytowy, refleksyjny, długi, yumi, kusza strzemionowa, kusza, chu-ko-nu, arbaleta, łuk bloczkowy |
| Pistolety | 16 | skałkowy, kołowy, pojedynkowy, derringer, Peacemaker, Nagant, Rewolwer Kustosza, Mauser C96, Luger, Colt 1911, VIS, P38, Glock, Beretta, Magnum .44, Desert Eagle |
| Karabiny i strzelby | 23 | arkebuz, muszkiet, garłacz, Brown Bess, sztucer, Winchester, dubeltówka, Mosin, Springfield, Lee-Enfield, Mauser 98k, Garand, strzelba, Thompson, MP 40, STEN, PPSz, pompka, AK-47, M16, Dragunow, Barrett |

Epoki: starożytność, średniowiecze, nowożytność, wiek XIX i XX, współczesność. Broń dystansowa to trzy typy o różnym rytmie: łuki (dużo strzał, szybkie ładowanie), pistolety (średnio), karabiny (mocno, wolno; pistolety maszynowe strzelają seriami z małymi obrażeniami). Ikony: 31 kształtów w `drawWeaponIcon`, w tym karambit, kukri, maczeta, kiścień, pistolet, skałkowy, karabin, pistolet maszynowy, karabin wyborowy. Podgląd: `tests/weapons.html`.

Skrzynie: 29. Strzelnicę zastąpiły Łucznia, Gabinet Pistoletów i Zbrojownia Karabinów; doszedł Arsenał Współczesny. Testy: 64.

Uwaga: w walce rycerz nadal trzyma w ręce miecz niezależnie od założonej broni (rysunek w `drawKnight`); rysowanie 122 broni w dłoni to osobne zadanie.

## Ikony broni palnej (faza75)

Broń palna ma własne, szerokie glify 24×14 px w `pixel.js` (`I`): `flintlock`, `revolver`, `pistol` (klasyczne samopowtarzalne), `modern` (Glock/Beretta/Desert Eagle), `smg` (Thompson z bębnem), `mp` (MP 40/Sten), `musket`, `bolt` (zamkowe: Mosin, Springfield, Lee-Enfield, Mauser 98k, sztucer), `lever` (Winchester), `garand`, `assault` (AK-47, M16), `shotgun` (dubeltówka, Strzelba Kustosza), `pump`, `blunderbuss`, `sniper`. `drawWeaponIcon` skaluje glify szersze niż 16 px do całkowitego mnożnika i centruje je w polu 16×16, więc wywołania się nie zmieniły. Karabin w ręce rycerza ma kolbę, komorę i kabłąk zamiast patyka. Wektorowy zapas mapuje nowe klucze na najbliższe stare rysunki.

## Finał: Walka z Belzebubem (2026-10-21)

Sala 37 `hell` (rok 9999, „POZA CZASEM”, sceneria `hell`): Belzebub (`exhibits.js`, rig człowieka z nowym nakryciem `horns`, czerwona skóra, peleryna, włócznia; tyran tier 8 z 380 HP, ciężki cios co drugi zamach, obrażenia 20/34) i warunek sali DRUGI ODDECH ustawiony wprost w definicji poziomu (`levels.js` honoruje `twist` z definicji, inaczej cykl). Sceneria piekła: czerwony tint, zamurowane okna, sztandary „666”, tabliczka PIEKŁO, migoczące płomienie przy cokole i pęknięcia lawy w podłodze (`fire: true` w `pixel.js`), wektorowy motyw `hell` w `art.js`. Trofeum RÓG BELZEBUBA. Kaddafi przestał być „ostatnim bossem”.

Belzebub ma miniguna (`figure.weapon: 'minigun'`, nowy sprite gatlinga w `human.weapons`: pakiet trzech luf z pierścieniem wylotowym, korpus z silnikiem, chwyt i skrzynka amunicji z mosiężną taśmą, noszony poziomo przy biodrze; w trybie wektorowym rysowany jak karabin). Archetyp `gunman`: strzela z 420 px, specjal `burst` (seria: drugi strzał zaraz po pierwszym), nadal 380 HP i ciężki strzał co drugi.

## Ekran startowy (2026-10-21)

Po otwarciu strony pełnoekranowy `#boot` (z-index nad wszystkim): 1) „GAME BY / AFTER DARK STUDIO” z limonkową linią (2,3 s), 2) pieczęć kustosza wbijana jak stempel + tytuł NOC EKSPONATÓW / MUZEUM PO GODZINACH (3,3 s), 3) karta „Księga gości”: ZALOGUJ SIĘ, ZAŁÓŻ KONTO (otwierają okno konta w odpowiednim trybie), KONTYNUUJ JAKO GOŚĆ. Klik, Esc albo POMIŃ skraca do karty; przywrócona sesja pokazuje „Witaj, …” i WEJDŹ DO MUZEUM; bez konfiguracji chmury zostaje tylko gość; `prefers-reduced-motion` pomija animacje. Scanlines i przejścia w CSS (`boot-*` keyframes).

## Tryb serwisowy (2026-10-21)

Tabela `settings` (klucz → jsonb, publiczny odczyt, w publikacji Realtime) z wierszem `maintenance` {enabled, message, since}. Tylko admin przełącza (`mod_set_maintenance(enabled, message)`, sekcja TRYB SERWISOWY na górze panelu moderatora, z potwierdzeniem). U graczy pełnoekranowy ekran „PRACE SERWISOWE” (`#maintenance`, z komunikatem i godziną), walka pauzowana, nic nie da się kliknąć; moderatorzy grają dalej pod czerwonym banerem. Rola jest dociągana już przy przywracaniu sesji, a ekran serwisowy ma przycisk LOGOWANIE MODERATORA (okno konta nad ekranem), więc admin nigdy nie zostaje zamknięty na zewnątrz. Awaryjnie: `update public.settings set value = '{"enabled": false, "message": ""}'::jsonb where key = 'maintenance';` w SQL Editorze. Po stronie serwera polityka aktualizacji profilu odrzuca zapisy zwykłych graczy, gdy `maintenance_on()`. Dostawa: ten sam WebSocket co ogłoszenia (`postgres_changes` na `settings`) plus odpytywanie co 15 s. Migracja: `supabase/2026-10-21-serwis.sql`.

## Urozmaicenie sal (2026-10-21)

Odpowiedź na „gra jest monotonna”. Dwie warstwy, obie czysto w danych i silniku, bez nowych grafik:

- **Warunki sal** (`dist/twists.js`, `MuseumTwists`): od czwartej sali każda ma warunek z cyklu z cichymi salami co kilka pokoi: ZASADZKA (boss startuje blisko i atakuje od razu), SZAŁ (zamach i odpoczynek ×0,75/0,7), ŻELAZNA GARDA (krótka słaba garda, droższe bloki), SZKLANE OSTRZA (obie strony ×1,5 obrażeń), MARATON (boss +40 % HP, twoja wytrzymałość ×1,3), CIEMNA SALA (przyciemniona arena, znak zamachu dopiero od 65 %), ZEGAR (75 s, potem 4 HP/s), DRUGI ODDECH (boss przy 35 % HP leczy 25 % i przyspiesza, raz), CIĘŻKA RĘKA (co drugi atak ciężki). Sala z warunkiem daje +20 % nagrody. Warunek pokazuje karta sali, przeskok w czasie, HUD (nazwa sali) i karta przeciwnika na pauzie.
- **Specjalne zagrania bossów** po archetypie (`stats.archetype` w `exhibits.js`, od sali 4): pojedynkowicz i trickster robią FINTĘ (zamach przerwany w 55 %, zaraz potem szybki cios ×0,7), osiłek i tyran PODWÓJNY CIOS (po lekkim ciosie drugi z krótkim zamachem, 35 %), strzelec SERIĘ (drugi strzał z zamachem ×0,45, 50 %). Losowość przez `state.rng` (wstrzykiwana w testach).

## Poprawki po feedbacku testera (2026-10-21)

- Napisy na sztandarach (np. SPQR) są rysowane jako pikselowe glify (`pixelGlyph`), wieloliterowe pionowo na sztandarze, zamiast rozmytego tekstu wylewającego się poza sztandar.
- Tabliczka nad drzwiami zależy od epoki (`signs` w `pixel.js`: TERMOPILE, ROMA, BUNKIER…), a drzwi są tintowane kolorem sztandaru, więc wyjście nie wygląda wszędzie identycznie.
- Data i nazwa sali w rogu areny są większe, jasne i na ciemnej plakietce.
- Pauza (Esc) pokazuje kartę przeciwnika: nazwa, epoka, opis, styl walki wyliczony z jego profilu (zamach, ciężki cios, odpoczynek), obrażenia, HP i nagroda za salę.

## Ogłoszenia dla wszystkich (2026-10-21)

Tabela `announcements` (treść do 300 znaków, rodzaj info/event/warning/sponsored, autor, wygaśnięcie), publiczna do odczytu, dodana do publikacji `supabase_realtime`. Moderator wysyła z panelu (`mod_announce(body, kind, seconds)`, od 30 s do 7 dni w selektorze, serwer przyjmuje 10 s–30 dni) i wycofuje (`mod_unannounce`; wycofanie dochodzi przez Realtime jako UPDATE). Klient (`MuseumCloud.announcements`) łączy się z Supabase Realtime po WebSocket ręcznie mówionym protokołem Phoenix (join na `postgres_changes` INSERT, heartbeat co 25 s, reconnect z backoffem) i dodatkowo odpytuje tabelę co 15 s oraz po powrocie karty, więc nic nie ginie. Pasek nad areną (`#announceBar`) jest tickerem: aktywne ogłoszenia po kolei przelatują przez pasek (Web Animations, prędkość ok. 90 px/s, 4 s przerwy między przelotami, pauza po najechaniu) aż wygasną; zamknięcie chowa pasek do następnego nowego ogłoszenia. Nowe ogłoszenie daje też toast w menu. Migracja zmiany na sekundy: `supabase/2026-10-21-ogloszenia-sekundy.sql`. Migracja dla istniejącego projektu: `supabase/2026-10-21-ogloszenia.sql`. Rodzaj `sponsored` wyświetla się jako niebieski pasek z plakietką MATERIAŁ SPONSOROWANY (migracja `supabase/2026-10-21-ogloszenia-sponsorowane.sql` rozszerza constraint na `kind`). Paska ogłoszeń nie da się zamknąć: gracz widzi każde aktywne ogłoszenie aż do jego wygaśnięcia lub wycofania przez moderatora.

## Seria ciosów bronią białą (2026-10-21)

Jakub chciał atakować mieczem ciągiem. Trzymanie J już powtarzało ciosy, ale hamowało tempo i energia. Teraz broń biała ma krótszy odstęp po ciosie (ostrza 0,26 s zamiast 0,46; ciężka 0,4; noże 0,18) i tańsze ciosy (ostrza 7 energii zamiast 12; ciężka 10; noże 5), a w trakcie serii energia wraca 6/s zamiast 2/s. Broń dystansowa bez zmian.

## Rangi honorowe (2026-10-21)

Kolumna `profiles.title` (owner, first-to-arrive, founder, veteran, patron; katalog nazw i kolorów w `MuseumCloud.titles`). Nadaje moderator przyciskiem RANGA w panelu (`mod_set_title`); „first-to-arrive” jest unikalna w bazie (indeks częściowy), więc dostanie ją tylko jedna osoba. Ranga pokazuje się jako plakietka przy pseudonimie w rankingu, w liście moderatora i w KONCIE właściciela. Dla istniejącego projektu Supabase: `supabase/2026-10-21-rangi.sql`, potem `supabase/2026-10-21-ranga-owner.sql`.

## Moderacja (2026-10-21)

Supabase: `supabase/schema.sql` ma sekcję „Moderacja”: kolumny `role` (player/moderator/admin), `banned_until`, `ban_reason`, `mod_note` w `profiles`; funkcje `is_mod()`/`is_admin()`; trigger `protect_mod_fields` (gracz nie zmieni sobie roli ani bana, rolę zmienia tylko admin albo SQL Editor); polityka odczytu wszystkich profili dla moderatorów; zbanowany nie zapisze w chmurze. RPC `mod_stats`, `mod_list(q, lim)`, `mod_ban(target, hours, reason)` (0 h = bezterminowo), `mod_unban`, `mod_note`, `mod_adjust(target, coins_delta, balance_delta)` (grosze), `mod_reset`, `mod_set_role` (tylko admin, nie sobie). Rolę admina nadaje się raz w SQL Editorze: `update public.profiles set role = 'admin' where nickname = '…';`.

Gra: po zalogowaniu `fetchProfile` zwraca rolę i ban; zbanowany dostaje komunikat i jest wylogowany. Moderator widzi w KONCIE przycisk PODGLĄD MODERATORA: statystyki, wyszukiwarka graczy, lista z salami, żetonami, saldem i statusem, akcje ŻETONY ±, SALDO ±, NOTATKA, BAN/ODBANUJ, RESET ZAPISU, ROLA (admin). Klient (`MuseumCloud.mod`) tylko formuje wywołania; uprawnienia sprawdza serwer.

## Dopasowanie do okna (2026-10-21)

Ramka gry ma szerokość `clamp(58%, (100vh − --chrome) × 16/9, 100%)`: `fitStage()` w `ui.js` mierzy pasek górny, linię sekcji i pasek sterowania (`--chrome`), więc arena razem z nimi mieści się w wysokości okna bez przewijania. Gdy ramka jest przez to węższa niż strona, wszystko w ramce poza canvasem dostaje `zoom: var(--ui-zoom)` równy stosunkowi szerokości ramki do pełnej szerokości treści, więc menu, HUD i sceny skalują się proporcjonalnie zamiast się ucinać. Poniżej 1280 px nawigacja paska górnego schodzi do drugiego rzędu; powyżej pasek się nie zawija.

## Publikacja online (2026-10-21)

Gra jest publikowana na GitHub Pages z folderu `dist/` przez workflow `.github/workflows/pages.yml` przy każdym pushu na `main` (repo `Dixi2137/noc-eksponatow`). Adres: https://dixi2137.github.io/noc-eksponatow/. Bez kluczy w `config.js` działa tryb gościa; po podaniu Supabase dojdą konta i ranking.

## Otwórz ponownie (2026-10-21)

Po odsłonięciu nagrody okno losowania ma trzeci przycisk **OTWÓRZ PONOWNIE** (`lootAgainBtn`, `openAgain` w `ui.js`): zachowuje nagrodę w kolekcji (bez zakładania), pobiera cenę tej samej skrzyni i od razu kręci następne losowanie, bez zamykania okna. Etykieta pokazuje koszt albo GRATIS (darmowa skrzynia Galerii), a przy braku żetonów lub wyczerpanej puli przycisk jest wyłączony z informacją ile brakuje.

## Limitowane wykończenia broni (2026-10-21)

Katalog wykończeń (`dist/finishes.js`, `window.MuseumFinishes`) ma ~388 powłok w pięciu rzadkościach, generowanych z list kolorów i wzorów: 120 zwykłych (farba, mat, lakier, emalia, pastel, „bieda” w 16 odcieniach i 12 neutralnych; 2,99–9,99 zł), 110 rzadkich (paski, kropki, szachownica, szczotka, dwubarwne, metale z kolorową krawędzią; 14,99–39,99 zł), 80 epickich (20 klejnotów i metali szlachetnych × polerowany/żyłkowany/żarzący/fasetowany; 49,99–149,99 zł), 50 legendarnych (25 żywiołów × żar/iskry, animowane; 199–499 zł) i 28 mitycznych (osiem ręcznie robionych plus aurora, plazma, lawa, pryzmat, mgławica, chrom, kriogen, pieczęć kustosza…; 499–4999 zł). Skrzynie tylko z wykończeniami: **Lakiernia Muzealna** (`lacquer`, 1200 ✦ / 34,99 zł, cały katalog, 55/28/12/4,5/0,5 %) i **Atelier Płatnerza** (`atelier`, 6000 ✦ / 129,99 zł, minimum epickie, 3 % mitycznych). Do pozostałych skrzyń wpadają wyłącznie mityczne. Sprzedaż bezpośrednia w sklepie obejmuje tylko mityczne. Osiem ręcznie robionych mitycznych: Diamentowy Szmaragd, Złoty Marmur, Tytan, Hologram, Obsydian i Rubin, Stal Damasceńska, Różowe Złoto, Nocna Pustka. Wykończenie to osobny rodzaj przedmiotu (`kind:'finish'`, rzadkość `mythic`, wartość 15 000 ✦, sprzedaż 6 000 ✦), nakładany na dowolną broń: przebarwia stal, krawędź, okucia i trzonek w walce, w menu i w kolekcji (zakładka WYKOŃCZENIA; drugie kliknięcie zdejmuje).

- Nigdzie nie są gwarantowane. **Sejf Kolekcjonera** (`collector`, 12 000 ✦ / 199,99 zł, grupa „Limitowane wykończenia broni”) miesza stroje, bronie i karty z wykończeniami i daje najwyższą szansę w muzeum: 3 %. Każda inna skrzynia ma je domieszane z malutką wagą `mythic` (tanie 0,35 %, od 2 500 ✦ 0,6 %, skrzynie legend 1,2 %), niezależnie od swojej puli i filtrów; szansa jest wypisana w panelu skrzyni i w sklepie, a po zebraniu wszystkich ośmiu znika.
- Render: `MuseumFinishes.palette(id, time)` podmienia litery palety sprite'ów (M stal, W krawędź, S ciemna stal, G okucia, D trzonek), a `overlay()` dokłada efekty na piksel: iskry (szmaragd, różowe złoto), gwiazdy (pustka), żyłki (marmur, damast), szczotkowanie (tytan), żar krawędzi (obsydian) i przesuwające się tęczowe pasy (hologram, kolor liczony z czasu). W trybie wektorowym ikona jest tintowana `source-atop` kolorami wykończenia.
- Sprzedaż bezpośrednia (planowana, płatności wkrótce): każde wykończenie ma `pricePLN` w `finishes.js` i własną kartę w sklepie w sekcji „Wykończenia broni”: Tytan 499 zł, Stal Damasceńska 699 zł, Różowe Złoto 899 zł, Obsydian i Rubin 1 199 zł, Złoty Marmur 1 499 zł, Nocna Pustka 1 999 zł, Diamentowy Szmaragd 2 499 zł, Hologram 3 499 zł. Cena jest też wypisana na karcie w kolekcji.
- **Portfel PLN** (`profile.balance`, w groszach): saldo w pasku górnym obok żetonów, panel „Saldo i wpłaty” w sklepie z kwotami 20/50/100/250/500 zł i własną kwotą. Płatności nie są podpięte, więc wpłata jest symulowana i od razu zasila saldo (tryb demo). Z salda kupuje się wykończenia (`buyFinish`, przycisk KUP w sklepie), a posiadane sprzedaje się z powrotem za 75% ceny (`sellFinish`, przycisk SPRZEDAJ w kolekcji; nałożonego nie da się sprzedać). Ukryte przyciski dodające żetony i złotówki zostały usunięte 2026-10-21 (korekty robi moderator w panelu).
- Profil: `finishes` (posiadane) i `finish` (nałożone); `MuseumGame.start` dostaje `finish`, rycerz rysuje broń z paletą wykończenia.

## Tryb pikselowy (2026-10-21)

Przycisk ▦ w górnym pasku przełącza grę w prawdziwy pixel art (`profile.pixel`). Rysowanie przejmuje `dist/pixel.js` (`window.MuseumPixel`): scena ma 288 × 162 pikseli (czynnik 5 względem 1440 × 810), rysowana na małym płótnie i powiększana bez wygładzania przez `MuseumArt.pixelFrame`.

- **Sala** jest składana z kafli paczki **Kenney Tiny Dungeon** (CC0, `dist/assets/kenney/`, licencja obok): ceglane ściany, kolumny, wielkie drewniane drzwi w wejściu, herby, skrzynie, kamienna podłoga. Motywy scenerii to tinty, okna (księżyc, słońce, śnieg, zamurowane) i sztandary rysowane pikselami. Tilesheet jest wbudowany w `pixel.js` jako data URL, więc build offline działa.
- **Rycerz** (28 × 40 px) i **szkielet T-rexa** (60 × 40 px, Velociraptor to ten sam szkielet w skali 0,9 w innym odcieniu) to sprite'y z warstw tekstowych (`blit`), z obrysem i trzema tonami cienia, składane z części (głowa, pióropusz, tors, ręce, nogi, miecz, tarcza, peleryna) w pozach idle, walk, attack, guard, dodge, hurt, dead. Paleta rycerza pochodzi z kolorów skina, więc wszystkie 58 strojów działa od razu.
- **Bossowie-ludzie** (34 postacie) używają jednego pikselowego riga człowieka (`drawFigure` w `pixel.js`), który zjada te same dane kostiumów co wektorowy `MuseumArt.drawFigure`: 16 nakryć głowy (hełm koryncki, bikorn, korona, mianguan, laur, turban, fez, czapka z daszkiem, beret, fedora, morion…), 6 fryzur i zarostów, zbroja, szarfa, epolety, opaska, peleryna, tarcza oraz 8 broni w dłoni (włócznia, szabla, sztylet, topór, laska, pistolet, karabin, łuk).
- **Broń**: 31 ikon 16 × 16 px (`drawWeaponIcon`, kolor obramowania według rzadkości) obsługuje wszystkie 122 bronie w kolekcji i w sali prywatnej. Rycerz trzyma w dłoni to, co ma założone: miecz dla ostrzy, a dla pozostałych typów topór, włócznię, sztylet, łuk, pistolet lub karabin, w pozie spoczynkowej, przy zamachu i przy ciosie.
- **Skrzynie** w galerii i w sklepie to skrzynie z Tiny Dungeon (inna dla broni, kart i skrzyń mieszanych) na kamiennym postumencie, tintowane kolorem skrzyni, z glifem skrzyni jako pikselową plakietką. **Karty** mają pikselową ramkę z inicjałami i gwiazdkami rzadkości. **Sala prywatna** jest rysowana tą samą salą z kafli, z tabliczką nazwy, postumentami, wieszakami, ramami i gablotami.
- Zamach bronią (`swing` w `pixel.js`, wspólny dla rycerza i bossów) ma trzy fazy: ręka w górze z bronią nad głową, wypad z ręką wyciągniętą i bronią w poziomie, opadnięcie; dłoń zawsze trzyma rękojeść, a korpus lekko odchyla się i wypada do przodu.
- **Pokój stróża** (prolog i epilog) ma własną pikselową wersję (`drawGuardRoom`): stróż za biurkiem w czapce z odznaką, okno z żaluzją i świtem, tablica korkowa ze zdjęciem, grafikiem i kluczami, lampa, kubek z parą; `awake` otwiera oczy w epilogu. Podgląd: `tests/pixel-room.html`.
- Galerie do podglądu: `tests/pixel-gallery.html?pose=attack`, `tests/pixel-swing.html` (fazy zamachu) (wszyscy bossowie) i `tests/pixel-weapons.html` (ikony broni oraz rycerz z każdym typem broni).
- Napisy walki, pierścień zamachu z wykrzyknikiem, PRZEŁADOWANIE i PAUZA są w trybie ▦ rysowane osobnym przejściem (`drawOverlay` w `game.js`) w pełnej rozdzielczości nad powiększoną sceną, więc pozostają czytelne.
- Po każdej wygranej sali pojawia się panel wyboru (`#choice`): KOLEJNA SALA (Enter) rusza przeskok w czasie, MENU GŁÓWNE (Esc) kończy noc, zapisując rekord żetonów; postęp i żetony są już wtedy zapisane.
- Czcionki trybu ▦: duże nagłówki, HUD, napisy w walce i tabliczki w sali używają **Jersey 10** (Google Fonts, Latin Extended, wyraźne H/C/W), Pixelify Sans został tylko jako zapas; drobne etykiety i ticker ogłoszeń są w Manrope, bo pikselowe kroje poniżej 16 px zlewają litery.
