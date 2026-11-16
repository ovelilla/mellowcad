---
title: "Polecenie WYDŁUŻ (EXTEND) w AutoCADzie"
description: "Jak wydłużyć linię w AutoCADzie poleceniem WYDŁUŻ (EXTEND, skrót WYD): tryb szybki i standardowy, krawędzie obwiedni, krawędź wybierająca i Shift do ucinania."
figure: "Dwie linie wydłużone do linii leżącej w poprzek ich drogi: każda wskazana raz blisko końca, który rośnie, w trybie szybkim."
sourceHash: "b2c0044f8e87"
---

Polecenie WYDŁUŻ (EXTEND) wydłuża obiekt, aż spotka inny: wskazujesz go blisko końca, który ma rosnąć, a ten koniec biegnie dalej do najbliższej krawędzi na swojej drodze. Wydłuża linie, łuki, łuki eliptyczne, otwarte polilinie (wzdłuż ich końcowego segmentu, prostego lub po jego łuku), polilinie 3D i otwarte splajny. Zaczyna w trybie szybkim, jak w AutoCADzie: każdy obiekt jest obwiednią. Wskazanie z wciśniętym klawiszem Shift ucina zamiast tego, jak polecenie <Command id="TRIM" />. Każde wskazanie to jeden krok cofania; Enter kończy polecenie.

## Options

### Boundary

Wybiera obiekty, które będą obwiedniami: wybierz je albo naciśnij Enter, aby wziąć wszystkie obiekty. Od tej chwili obwiedniami są tylko one, w każdym trybie, aż do końca polecenia.

### Fence

Pyta o punkty krawędzi wybierającej, ile chcesz, aż do Enter: każdy przecinany przez nią obiekt jest wydłużany od końca bliższego miejscu przecięcia, w jednym kroku. Tryb standardowy wymienia tę opcję; tryb szybki też ją przyjmuje.

### Crossing

Pyta o dwa narożniki okna: każdy obiekt przecinany przez jego obrys jest wydłużany, w jednym kroku.

### mOde

Przełącza między <Keyword id="Quick" /> a <Keyword id="Standard" />. W trybie standardowym polecenie WYDŁUŻ najpierw pyta o krawędzie obwiedni (Enter bierze wszystkie) i wymienia opcje <Keyword id="Fence" /> i <Keyword id="Edge" />. Tryb jest wspólny dla poleceń WYDŁUŻ i UTNIJ i obowiązuje do końca sesji.

### Edge

Tylko w trybie standardowym. Z opcją <Keyword id="Extend" /> obiekt zatrzymuje się także tam, gdzie byłaby obwiednia, gdyby biegła dalej – linia w obie strony, łuk po swoim okręgu – więc linia może dorosnąć do takiej, która nie sięga jej drogi; domyślna jest <Keyword id="No extend" />.

### Undo

Pojawia się na liście, gdy monit dostał już odpowiedź – wskazanie, krawędź wybierającą, okno: cofa ostatnie wydłużenie, a gdy nie ma już czego cofnąć, mówi o tym.

## Missing

Rzutuj: opcja rzutowania AutoCADa (Brak, LUW, Widok) nie jest dostępna, a wszystko jest liczone w rzucie na płaszczyznę XY układu LUW, co jest domyślnym ustawieniem AutoCADa, LUW. Krawędzi wybierającej nie można jeszcze przeciągnąć kursorem, tylko wskazać punkt po punkcie. Tryb i wybór w opcji <Keyword id="Edge" /> obowiązują do końca sesji, podczas gdy AutoCAD zachowuje je między sesjami. Obiekt ustawiony pod kątem do LUW, z wyjątkiem splajnu, ani nie ogranicza, ani nie jest wydłużany, a polilinia wygładzona opcją <Keyword command="PEDIT" id="Fit" /> polecenia <Command id="PEDIT" /> jest odrzucana, podczas gdy AutoCAD wydłuża jej ostatni łuk.

## Questions

### Jak się nazywa polecenie WYDŁUŻ po angielsku i jaki ma skrót?

EXTEND. W polskim AutoCADzie jego skrót to `WYD`: wpisz go i naciśnij Enter lub spację. Angielskie `EX` w polskiej wersji nie działa; `_EXTEND` działa w AutoCADzie w każdym języku.

### Dlaczego polecenie WYDŁUŻ mówi, że nie ma krawędzi?

Bo nic nie leży w poprzek drogi, którą biegłby ten koniec. Linia mówi <Message id="noEdgeInThatDirection" />, gdy jej drugi koniec dosięgnąłby krawędzi, a linia lub łuk w pozostałych przypadkach <Message id="pathDoesNotIntersectBoundingEdge" />; polilinia lub splajn mówi <Message id="objectDoesNotIntersectEdge" />. Wskaż bliżej drugiego końca albo w trybie standardowym wybierz <Keyword id="Edge" /> i <Keyword id="Extend" />, aby obwiednia, która nie sięga, liczyła się tak, jakby biegła dalej. Okręgu, zamkniętej polilinii, pełnej elipsy, tekstu ani kreskowania w ogóle nie można wydłużyć: <Message id="cannotExtendObject" />

### Jak wydłużyć kilka linii naraz?

Wskaż puste miejsce i drugi punkt: każdy obiekt przecinany przez tę krawędź wybierającą rośnie od bliższego końca, w jednym kroku. Albo wybierz <Keyword id="Crossing" /> i narysuj okno na końcach do wydłużenia.

### Jak uciąć poleceniem WYDŁUŻ?

Wskazuj z wciśniętym klawiszem Shift: kawałek jest ucinany do najbliższych przecięć, tak jak zrobiłoby to polecenie <Command id="TRIM" />, a obiekt, którego nic nie przecina, jest usuwany. Następne wskazanie bez klawisza Shift znowu wydłuża.
