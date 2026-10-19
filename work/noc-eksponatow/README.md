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
