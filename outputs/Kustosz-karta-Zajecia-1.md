# Kustosz.xyz – karta gry, Zajęcia 1

Studio gier z AI · Sztuczna Inteligencja i Data Science 1 · PJATK · 2 listopada 2026

## Zespół, role, para i brief

Karta opisuje grę Kustosz.xyz (robocza nazwa Noc Eksponatów): rycerz-stróż nocny pojedynkuje się z eksponatami, które o północy budzą się jako postacie z historii. Gra istnieje jako prototyp przeglądarkowy pod adresem kustosz.xyz, karta opisuje jej rdzeń w formacie Zajęć 1.

| Pole | Wpis |
| --- | --- |
| Zespół | (nazwa zespołu) |
| Dyrektor kreatywny | (imię) |
| Projektant mechanik | (imię) |
| Projektant rozgrywki | (imię) |
| Badacz doświadczenia gracza | (imię) |
| Zespół z pary | (nazwa, numer briefu) |

Brief (nr 5 z aneksu, przepisany bez zmian):

| Dla kogo | Urządzenie / sytuacja | Po co | Rozgrywka |
| --- | --- | --- | --- |
| Gość muzeum | Telefon przy eksponacie | Gra o wybranym zjawisku lub eksponacie | 4 min |

Założenie: zespół pracuje na briefie nr 5. Jeśli prowadzący przydzielił inny numer, brief w tabeli trzeba podmienić, a pola 1–5 zostają, bo opisują tę samą grę.

- [ ] Wpisać imiona do ról i nazwę zespołu z pary

## Wniosek z rozgrzewki

AI daje grę „średnią z internetu” (zbieranie przedmiotów na czas), dopóki prompt nie niesie wizji, uczuć i ograniczeń; dopiero runda 3 dała mechaniki z decyzją gracza.

- [ ] Po prompt battle na zajęciach podmienić na własne zdanie zespołu

## Wizja i 3 zasady wizji

Wizja (powstała bez AI, na kartce): Gość muzeum staje przy eksponacie, a telefon zamienia go w nocnego stróża w zbroi. O północy eksponat budzi się jako postać z historii i staje do pojedynku. Każdy cios przeciwnika jest zapowiedziany, więc wygrywa nie szybszy, tylko ten, kto odczyta rytm. Jedna sala to jeden pojedynek na kilka minut, a historia to przeciwnicy z krwi i kości, nie daty do wkucia.

| Zdanie z wizji | Zasada wizji | Co ta zasada odrzuca |
| --- | --- | --- |
| „Każdy cios przeciwnika jest zapowiedziany” | Każdy cios zapowiedziany | Losowe trafienia, których nie da się przewidzieć |
| „Historia to przeciwnicy, nie daty do wkucia” | Historia to przeciwnik, nie quiz | Pytania o daty i poprawne odpowiedzi |
| „Jedna sala to jeden pojedynek na kilka minut” | Jedna sala, jeden pojedynek | Długie misje i etapy w jednej rozgrywce |

## Pola karty 1–5

**1. Pomysł w 1 zdaniu** (dyrektor kreatywny): „Noc w muzeum spotyka pojedynek rycerski, ale każdy eksponat to postać z historii, a wygrywa się tylko odczytując rytm jej zapowiedzianych ciosów.”

**2. Mechaniki** (projektant mechanik, najwyżej 3):

1. Jeśli gracz naciśnie paradę dokładnie w chwili zapowiedzianego ciosu eksponatu, to cios wraca do atakującego i rycerz nie traci życia; zwykły blok przepuszcza część obrażeń.
2. Jeśli eksponat skończy zamach, to przez chwilę ma osłabioną gardę i tylko wtedy cios rycerza zadaje pełne obrażenia.
3. Jeśli rycerz paruje albo unika, to zużywa wytrzymałość; z pustym paskiem nie może się bronić, aż wytrzymałość się odnowi.

**3. Pętla i przebieg rozgrywki** (projektant rozgrywki):

1. Gracz działa: widzi zapowiedź ciosu i wybiera paradę, unik albo własny atak (mechaniki 1 i 3).
2. Gra reaguje: cios zostaje odbity, zablokowany z uszczerbkiem albo dochodzi; eksponat po zamachu odsłania gardę (mechaniki 1 i 2).
3. Gracz widzi skutek: paski życia obu stron, pasek wytrzymałości i etykietę (PERFEKCYJNA, BLOK −n, ODRZUT).
4. Gracz decyduje: uderzyć w osłabioną gardę czy odstąpić i odzyskać wytrzymałość przed następną zapowiedzią (mechaniki 2 i 3). Powrót do kroku 1.

Przebieg: rozgrywka zaczyna się o 23:58 ostatnim obchodem i przebudzeniem eksponatu, przy którym stoi gość. Trwa jeden pojedynek w jednej sali, 2–4 minuty. Kończy się ekranem KO i nagrodą w żetonach, gdy życie eksponatu spadnie do zera, albo upadkiem rycerza i epilogiem ze snem. Pętla powtarza się w pojedynku kilkanaście razy, więc mieści się w 4 minutach z briefu.

**4. Uczucia gracza** (badacz):

| Uczucie | Mechanika, która je wywołuje |
| --- | --- |
| Napięcie | Mechanika 1: okno perfekcyjnej parady jest krótkie, a cios zapowiedziany |
| Satysfakcja z mistrzostwa | Mechaniki 1 i 2: odbity cios i trafienie w odsłoniętą gardę to zasługa gracza, nie losu |
| Pokusa ryzyka | Mechanika 3: atak z prawie pustym paskiem wytrzymałości daje przewagę, ale odbiera obronę |

**5. Twist** (cały zespół): mechanika 1 (perfekcyjna parada zeruje obrażenia) plus mechanika 3 (każda obrona kosztuje wytrzymałość). Przewidywane zachowanie: gracze przestaną blokować i unikać w ogóle, będą stać z pełnym paskiem i czekać wyłącznie na perfekcyjną paradę, bo to jedyna obrona, która nic nie kosztuje. Pojedynek zamieni się w grę rytmiczną, choć nikt jej tak nie zaprojektował.

## Odbiorca: persona od AI, wywiad, zmiana

| Co przewidziało AI (persona) | Co powiedziała osoba z wywiadu (P1) | Co zespół zmienia |
| --- | --- | --- |
| Marek, 34 lata, zwiedza muzeum z partnerką w weekend, przy eksponacie stoi 1–2 minuty, gra na telefonie tylko w kolejce i w tramwaju. Powody porzucenia: 1) 18-sekundowe intro, którego nie da się pominąć, 2) sterowanie klawiszami zamiast dotyku, 3) pierwszy pojedynek za trudny, przegrywa po 20 sekundach | (dosłowny zapis z wywiadu na zajęciach: kiedy ostatnio grał i gdzie, co porzucił i dlaczego, ile ma realnie czasu) | Sala 1 jest samouczkiem bez presji; przyciski dotykowe na telefonie; do ustalenia po wywiadzie: skrócenie albo pominięcie intro przy eksponacie |

Persona jest przypuszczeniem AI, dlatego ostatnia kolumna domyka się dopiero po wywiadzie zastępczym z dyrektorem zespołu z pary.

- [ ] Badacz: wpisać dosłowne odpowiedzi P1 i jedną zmianę wynikającą z wywiadu

## Spory i rozstrzygnięcia

1. Projektant mechanik chciał, żeby zwykły blok zerował obrażenia tak jak parada. Badacz: wtedy nikt nie ryzykuje perfekcyjnej parady i znika napięcie. Rozstrzygnięte zasadą „Każdy cios zapowiedziany”: skoro cios widać, tylko trafienie w rytm ma być bezkarne, blok przepuszcza część obrażeń.
2. Projektant rozgrywki chciał obchodu przez kilka sal w jednej rozgrywce. Brief mówi 4 minuty przy eksponacie. Rozstrzygnięte briefem i zasadą „Jedna sala, jeden pojedynek”: kolejne sale to kolejne rozgrywki.
3. Pomysł na pytania o datę bitwy przed walką (bonus do życia za poprawną odpowiedź). Rozstrzygnięte zasadą „Historia to przeciwnik, nie quiz”: odpada, historię niesie wygląd, broń i styl walki eksponatu.

## Prompt v1 i v2

Prompt v1 (krok 2, szablon z 5 części):

```
Kontekst: Pracujesz jako doświadczony game designer. Pomagasz zespołowi zaprojektować grę dla gościa muzeum, który gra na telefonie, stojąc przy eksponacie, przez około 4 minuty.

Nasza wizja: Chcemy stworzyć grę, w której gość muzeum staje się nocnym stróżem w zbroi, a eksponat budzi się o północy jako postać z historii i staje do pojedynku. Każdy cios przeciwnika jest zapowiedziany, więc wygrywa ten, kto odczyta rytm. Jedna sala to jeden pojedynek na kilka minut. Historia to przeciwnicy, nie daty. Zasady wizji: Każdy cios zapowiedziany. Historia to przeciwnik, nie quiz. Jedna sala, jeden pojedynek.

Emocje/cel: Gracz ma poczuć napięcie, satysfakcję z mistrzostwa i pokusę ryzyka. Cel klienta: gra o wybranym eksponacie, która przyciąga do niego uwagę gościa.

Struktura odpowiedzi: Zaproponuj w układzie MDA (mechaniki → zachowanie graczy → uczucia): 1) najwyżej 3 mechaniki w formie „jeśli… to” (punkt wyjścia: parada w rytm zapowiedzianego ciosu), 2) pętlę rozgrywki w 4 krokach (działanie gracza, reakcja gry, skutek, decyzja), 3) jak zaczyna się i kończy jedna rozgrywka (punkt wyjścia: jeden pojedynek w jednej sali), 4) jakie uczucia wywołuje każda mechanika.

Ograniczenia: Najwyżej 3 mechaniki. Platforma: telefon, sterowanie dotykowe. Jedna rozgrywka trwa około 4 minut. Bez quizu i pytań o daty. Bez krwi.
```

Prompt v2 (krok 5, po pytaniach ról): do v1 dopisano w Ograniczeniach „Sala pierwsza jest samouczkiem: przeciwnik wolniejszy, bez kary za spóźnioną paradę” oraz „Perfekcyjna parada to jedyna obrona bez kosztu wytrzymałości”. Powody: persona od AI wskazała za trudny pierwszy pojedynek, a pytanie mechanika o luki pokazało, że bez kosztu wytrzymałości blok i unik da się spamować bez końca.

Pytania ról z kroku 5 (do wklejenia z instrukcji): mechanik o jednoznaczność i luki w mechanikach 1–3, rozgrywka o liczbę decyzji na minutę i zmieszczenie się w 4 minutach, badacz o personę i 3 powody porzucenia, cały zespół o 5 połączeń mechanik do twistu.

## AI zaproponowało → zespół zdecydował

| Kto | AI zaproponowało | Decyzja | Dlaczego |
| --- | --- | --- | --- |
| Projektant mechanik | Zwykły blok w pełni zeruje obrażenia, parada tylko dodaje kontrę | Zmienił | Z zasady „Każdy cios zapowiedziany” wynika, że bezkarna ma być tylko parada w rytm; blok przepuszcza część obrażeń |
| Projektant rozgrywki | Rozgrywka to obchód 3 sal z przeskokiem w czasie między nimi | Odrzucił | Brief: 4 minuty przy jednym eksponacie; obchód zostaje jako seria osobnych rozgrywek |
| Badacz | Odruchowy unik bez gardy w każdym pojedynku (gra sama ratuje gracza) | Zmienił | Zostaje tylko w sali 1 jako samouczek; dalej unik bez gardy nie istnieje, bo odbierałby zasługę graczowi |
| Dyrektor kreatywny | Quiz o dacie bitwy przed walką jako „element edukacyjny” | Odrzucił | Zasada „Historia to przeciwnik, nie quiz”; wiedzę niesie wygląd, broń i styl walki eksponatu |
| Cały zespół (twist) | Połączenie mechanik 1 i 3: gracze czekają z pełnym paskiem tylko na perfekcyjną paradę | Wziął | Z pięciu propozycji ta jedyna opisuje zachowanie, nie nową mechanikę, i pasuje do wizji |

Wpisy odtwarzają decyzje z prac nad prototypem. Na zajęciach każda osoba potwierdza swój wiersz albo podmienia go na propozycję z własnego czatu.

## Test powtórzenia

Opis dyrektora do powiedzenia na głos: „Stoisz przy eksponacie w muzeum, a telefon robi z ciebie nocnego stróża w zbroi. O północy eksponat budzi się jako postać z historii i atakuje, ale każdy cios zapowiada. Jeśli sparujesz dokładnie w rytm, cios wraca do niego; każda inna obrona kosztuje cię wytrzymałość. Czujesz napięcie przy każdej zapowiedzi i satysfakcję, gdy trafisz w rytm, bo to twoja zasługa, nie losu.”

| Punkt | Pytanie | Czego słucha badacz |
| --- | --- | --- |
| 1 | Co gracz robi? | Paruje w rytm zapowiedzianych ciosów eksponatu |
| 2 | Co czuje albo po co gra? | Napięcie i satysfakcja z trafienia w rytm |
| 3 | Co jest nowe? | Eksponat z muzeum jako przeciwnik z historii, każdy cios zapowiedziany |

Zdanie słuchacza (dosłownie): (do wpisania na zajęciach). Punkty: … z 3.

- [ ] Badacz: zapisać zdanie słuchacza i liczbę punktów; przy braku punktu krótka poprawka i ponowny test
