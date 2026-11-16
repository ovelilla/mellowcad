---
title: "Polecenie UTNIJ (TRIM) w AutoCADzie"
description: "Jak uciąć linię w AutoCADzie poleceniem UTNIJ (TRIM, skrót UT): tryby Szybki i Standardowy, krawędzie tnące, opcje Krawędź i Przetnij, Shift do wydłużania."
figure: "Linia ucięta do dwóch linii, które ją przecinają: każdy koniec wskazany raz, w trybie Szybki."
sourceHash: "fcbf44618cf3"
---

Polecenie UTNIJ (TRIM) ucina obiekt do miejsc, w których przecinają go inne obiekty: wskazujesz część do usunięcia, a ona znika do najbliższego przecięcia z każdej strony. Zaczyna w trybie <Keyword id="Quick" />, jak w AutoCADzie: każdy obiekt jest krawędzią tnącą, a obiekt, którego nic nie przecina, zostaje usunięty w całości. Przytrzymanie klawisza Shift podczas wskazywania wydłuża zamiast tego obiekt do najbliższej krawędzi, tak jak robi to <Command id="EXTEND" />. Każde wskazanie to jeden krok, który cofa <Keyword id="Undo" />; Enter kończy polecenie.

## Options

### cuTting

Określa, które obiekty tną: wybierz je albo naciśnij Enter, aby przyjąć wszystkie obiekty. Od tej chwili tną tylko one, w każdym trybie, do końca polecenia.

### Fence

Pyta o kolejne punkty linii, aż do naciśnięcia Enter: każdy obiekt, który ona przecina, zostaje ucięty w miejscu przecięcia, w jednym kroku. Tryb <Keyword id="Standard" /> wymienia tę opcję na liście; tryb <Keyword id="Quick" /> też ją przyjmuje, a wskazanie w pustym miejscu samo zaczyna linię z dwóch punktów.

### Crossing

Pyta o dwa narożniki okna: wszystko, co przecina jego obrys, zostaje ucięte, w jednym kroku. Obiekt leżący w całości wewnątrz okna nie jest przez nie przecinany.

### mOde

Przełącza między <Keyword id="Quick" /> a <Keyword id="Standard" />. W trybie <Keyword id="Standard" /> polecenie UTNIJ najpierw pyta o krawędzie tnące (Enter przyjmuje wszystkie), pozostawia obiekt, którego nie przecina żadna krawędź, z komunikatem <Message id="doesNotIntersectCuttingEdge" />, wymienia na liście <Keyword id="Fence" /> i <Keyword id="Edge" />, a wskazanie w pustym miejscu zaczyna okno przecinające. Tryb jest wspólny dla poleceń UTNIJ i <Command id="EXTEND" /> i obowiązuje do końca sesji.

### Edge

Tylko w trybie <Keyword id="Standard" />. Przy <Keyword id="Extend" /> krawędź tnie także tam, gdzie przecięłaby obiekt po przedłużeniu – linia w obie strony, łuk wzdłuż swojego okręgu; domyślnie <Keyword id="No extend" />.

### eRase

Usuwa obiekty bez wychodzenia z polecenia: wybierz je, a Enter je usunie, jako jeden krok polecenia UTNIJ, który można cofnąć.

### Undo

Pojawia się na liście, gdy monit otrzymał już odpowiedź – wskazanie, linię, okno: cofa ostatnie ucięcie, a gdy nie ma już nic do cofnięcia, informuje o tym.

## Missing

Rzut: opcja Rzut AutoCADa (Brak, LUW, Widok) nie jest dostępna, a wszystko jest obliczane w rzucie na płaszczyznę XY układu LUW, co odpowiada domyślnej wartości AutoCADa, LUW. Linii opcji Krawędź nie można jeszcze przeciągnąć kursorem, można ją tylko wskazywać punkt po punkcie. Tryb ucinania i wybór w opcji <Keyword id="Edge" /> obowiązują do końca sesji, podczas gdy AutoCAD zachowuje je między sesjami. Obiekt nachylony do układu LUW, z wyjątkiem splajnu, ani nie tnie, ani nie jest ucinany.

## Questions

### Jak się nazywa polecenie UTNIJ po angielsku?

TRIM. W polskim AutoCADzie wpisz `UTNIJ` lub skrót `UT` i naciśnij Enter lub spację; skrótu `TR` z wersji angielskiej w polskiej nie ma. Angielska nazwa z podkreśleniem, `_TRIM`, działa w AutoCADzie w każdym języku.

### Dlaczego UTNIJ usuwa całą linię?

Bo polecenie działa w trybie Szybki, domyślnym w AutoCADzie od wersji 2021: wskazanie obiektu, którego nie przecina żadna krawędź, usuwa go. Wybierz <Keyword id="mOde" />, a potem <Keyword id="Standard" />, aby polecenie UTNIJ pozostawiało taki obiekt i informowało o tym.

### Jak uciąć wiele linii naraz w AutoCADzie?

Kliknij w pustym miejscu i wskaż drugi punkt: każdy obiekt, który przecina ta linia, zostaje ucięty w jednym kroku. Albo wybierz <Keyword id="Crossing" /> i narysuj okno przechodzące przez części do usunięcia.

### Jak wydłużyć linię poleceniem UTNIJ?

Przytrzymaj Shift i wskaż linię przy końcu, który chcesz wydłużyć: wydłuży się do najbliższej krawędzi, jak przy <Command id="EXTEND" />, a następne wskazanie bez Shift znów ucina.
