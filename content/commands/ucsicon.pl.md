---
title: "Polecenie LUWSYMB (UCSICON) w AutoCADzie"
description: "Jak w AutoCADzie pokazać lub ukryć symbol LUW poleceniem LUWSYMB (UCSICON) i umieścić go w początku lub w rogu: Tak, Nie, Róg, Początek."
figure: "LUWSYMB Róg przenosi symbol do rogu; LUW przenosi początek na stopień klocka, a Początek rysuje tam symbol, z osią X czerwoną, Y zieloną i Z niebieską."
sourceHash: "c431e70eda01"
---

Polecenie LUWSYMB (UCSICON) pokazuje lub ukrywa symbol LUW, ramiona X i Y, które wskazują, gdzie jest bieżący LUW i w którą stronę jest skierowany, i ustala, gdzie symbol się znajduje: w początku układu LUW albo w lewym dolnym rogu rysunku. Jego jedyne pytanie proponuje bieżący stan jako domyślny, więc Enter go zachowuje. Ustawienie zapisuje się w rysunku, a każde LUWSYMB to krok cofania.

Symbol to symbol 3D z AutoCADa 2027: ramię dla X i ramię dla Y, z literą na każdym końcu, oraz kwadrat w początku, dopóki LUW jest układem globalnym. Poza widokiem z góry ramię Z pokazuje, dokąd wskazuje oś Z układu LUW, a ramię widziane od czoła zostaje pominięte. W stylu Model szkieletowy 2D symbol jest biały; w stylach Ukryty i Koncepcyjny jego X jest czerwona, Y zielona, a Z niebieska. Wpisane z apostrofem, `'LUWSYMB` ustawia zamiast tego zmienną UCSICON, nawet wewnątrz innego polecenia: od 0 do 3, gdzie 1 pokazuje symbol, a 2 umieszcza go w początku.

## Options

### ON

Pokazuje symbol.

### OFF

Ukrywa symbol. LUW nadal istnieje, a to, co rysujesz, nadal w nim leży.

### Noorigin

Utrzymuje symbol w lewym dolnym rogu rysunku, bez względu na to, gdzie jest początek.

### ORigin

Rysuje symbol w początku układu LUW, domyślnie. Gdy początek jest poza ekranem albo tak blisko jego krawędzi, że symbol by się nie zmieścił, symbol przechodzi do lewego dolnego rogu, dopóki początek nie wróci do widoku.

## Missing

Wszystkie, która w AutoCADzie stosuje ustawienie do każdej rzutni (tutaj jest tylko jedna); Wybieralne, uchwyty symbolu; oraz Właściwości, okno dialogowe Symbol LUW, ze stylem 2D, rozmiarem, szerokością linii i kolorami.

## Questions

### Jak wyłączyć symbol LUW w AutoCADzie?

Wpisz `LUWSYMB`, naciśnij Enter, a potem wybierz <Keyword id="OFF" />. <Keyword id="ON" /> go przywraca. Polecenie nie ma skrótu; angielska nazwa z podkreśleniem, `_UCSICON`, działa w AutoCADzie w każdym języku.

### Jak przenieść symbol LUW do początku układu?

LUWSYMB, potem <Keyword id="ORigin" />: symbol staje w początku układu LUW. Jeśli zostaje w rogu, początek jest poza ekranem lub zbyt blisko jego krawędzi: przesuń widok lub go oddal. <Keyword id="Noorigin" /> utrzymuje symbol w rogu.

### Co oznacza kwadrat na symbolu LUW?

Że LUW jest globalnym układem współrzędnych. Przesuń lub obróć LUW poleceniem <Command id="UCS" />, a kwadrat zniknie; <Command id="UCS" /> i Enter przywracają układ globalny, a z nim kwadrat.

### Jak zmienić styl, rozmiar lub kolor symbolu LUW?

W AutoCADzie opcją Właściwości polecenia LUWSYMB, w oknie dialogowym Symbol LUW. MellowCAD jeszcze go nie ma: symbol jest rysowany tak, jak AutoCAD 2027 rysuje go domyślnie, w stylu 3D.
