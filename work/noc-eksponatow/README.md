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

## Tryb pikselowy (2026-10-21)

Przycisk ▦ w górnym pasku przełącza grę w prawdziwy pixel art (`profile.pixel`). Rysowanie przejmuje `dist/pixel.js` (`window.MuseumPixel`): scena ma 288 × 162 pikseli (czynnik 5 względem 1440 × 810), rysowana na małym płótnie i powiększana bez wygładzania przez `MuseumArt.pixelFrame`.

- **Sala** jest składana z kafli paczki **Kenney Tiny Dungeon** (CC0, `dist/assets/kenney/`, licencja obok): ceglane ściany, kolumny, wielkie drewniane drzwi w wejściu, herby, skrzynie, kamienna podłoga. Motywy scenerii to tinty, okna (księżyc, słońce, śnieg, zamurowane) i sztandary rysowane pikselami. Tilesheet jest wbudowany w `pixel.js` jako data URL, więc build offline działa.
- **Rycerz** (28 × 40 px) i **szkielet T-rexa** (60 × 40 px, Velociraptor to ten sam szkielet w skali 0,9 w innym odcieniu) to sprite'y z warstw tekstowych (`blit`), z obrysem i trzema tonami cienia, składane z części (głowa, pióropusz, tors, ręce, nogi, miecz, tarcza, peleryna) w pozach idle, walk, attack, guard, dodge, hurt, dead. Paleta rycerza pochodzi z kolorów skina, więc wszystkie 58 strojów działa od razu.
- **Bossowie-ludzie** (34 postacie) używają jednego pikselowego riga człowieka (`drawFigure` w `pixel.js`), który zjada te same dane kostiumów co wektorowy `MuseumArt.drawFigure`: 16 nakryć głowy (hełm koryncki, bikorn, korona, mianguan, laur, turban, fez, czapka z daszkiem, beret, fedora, morion…), 6 fryzur i zarostów, zbroja, szarfa, epolety, opaska, peleryna, tarcza oraz 8 broni w dłoni (włócznia, szabla, sztylet, topór, laska, pistolet, karabin, łuk).
- **Broń**: 31 ikon 16 × 16 px (`drawWeaponIcon`, kolor obramowania według rzadkości) obsługuje wszystkie 122 bronie w kolekcji i w sali prywatnej. Rycerz trzyma w dłoni to, co ma założone: miecz dla ostrzy, a dla pozostałych typów topór, włócznię, sztylet, łuk, pistolet lub karabin, w pozie spoczynkowej, przy zamachu i przy ciosie.
- **Skrzynie** w galerii i w sklepie to skrzynie z Tiny Dungeon (inna dla broni, kart i skrzyń mieszanych) na kamiennym postumencie, tintowane kolorem skrzyni, z glifem skrzyni jako pikselową plakietką. **Karty** mają pikselową ramkę z inicjałami i gwiazdkami rzadkości. **Sala prywatna** jest rysowana tą samą salą z kafli, z tabliczką nazwy, postumentami, wieszakami, ramami i gablotami.
- Zamach bronią (`swing` w `pixel.js`, wspólny dla rycerza i bossów) ma trzy fazy: ręka w górze z bronią nad głową, wypad z ręką wyciągniętą i bronią w poziomie, opadnięcie; dłoń zawsze trzyma rękojeść, a korpus lekko odchyla się i wypada do przodu.
- Galerie do podglądu: `tests/pixel-gallery.html?pose=attack`, `tests/pixel-swing.html` (fazy zamachu) (wszyscy bossowie) i `tests/pixel-weapons.html` (ikony broni oraz rycerz z każdym typem broni).
- Napisy walki, pierścień zamachu z wykrzyknikiem, PRZEŁADOWANIE i PAUZA są w trybie ▦ rysowane osobnym przejściem (`drawOverlay` w `game.js`) w pełnej rozdzielczości nad powiększoną sceną, więc pozostają czytelne.
- Po każdej wygranej sali pojawia się panel wyboru (`#choice`): KOLEJNA SALA (Enter) rusza przeskok w czasie, MENU GŁÓWNE (Esc) kończy noc, zapisując rekord żetonów; postęp i żetony są już wtedy zapisane.
- HUD, tytuły i przyciski w tym trybie używają fontu Pixelify Sans (Google Fonts, z polskimi znakami).
