---
title: "Polecenie RÓŻNICA (SUBTRACT) w AutoCADzie"
description: "Jak działa polecenie RÓŻNICA (SUBTRACT, skrót ROZ) w AutoCADzie: bryły lub regiony, które zostają, Enter, potem te do odjęcia, z otworami."
figure: "Walec odjęty od prostopadłościanu poleceniem RÓŻNICA, otwór na wylot: najpierw wskazany prostopadłościan, potem walec."
sourceHash: "416991f5f4d1"
---

Polecenie RÓŻNICA (SUBTRACT) odejmuje bryły 3D od innych brył albo regiony od regionów w tej samej płaszczyźnie: walec odjęty od prostopadłościanu zostawia w nim otwór na wylot, okrąg odjęty od kwadratu – kwadrat z otworem. Pyta dwa razy. Najpierw wyświetla <Message id="subtractFrom" /> i pyta o obiekty, które mają zostać, aż naciśniesz Enter; potem <Message id="subtractWhat" /> i pyta o obiekty do odjęcia, aż ponownie naciśniesz Enter. Jak w AutoCADzie 2027 zbiór wybrany wcześniej zostaje odrzucony i pytanie pada ponownie.

Bryły pierwszego zbioru stają się jedną bryłą, a każda bryła drugiego zbioru zostaje od niej odjęta i usunięta, niezależnie od tego, czy na nią zachodziła. Regiony są przetwarzane płaszczyzna po płaszczyźnie: regiony pierwszego zbioru w danej płaszczyźnie są łączone, regiony drugiego zbioru w tej płaszczyźnie są od nich odejmowane i usuwane, a region w płaszczyźnie, w której pierwszy zbiór nie ma żadnego, pozostaje bez zmian. Bryła wynikowa jest bryłą złożoną: nie jest już prostopadłościanem ani walcem i nie ma historii. Gdy nic nie zostaje, polecenie wyświetla <Message id="nullSolid" /> lub <Message id="nullRegion" /> i usuwa obiekty. Całe polecenie to jeden krok cofania. 3D w MellowCAD wciąż jest częściowe: bryły istnieją, powierzchnie i siatki nie.

## Missing

Powierzchnie, których tu nie ma. Zakrzywione ściany przecinające się wzdłuż krzywej, dla której MellowCAD nie ma jeszcze dokładnej postaci: walce, stożki, sfery lub torusy, których osie ani się nie pokrywają, ani nie są równoległe (dwa walce mogą też się przecinać); stożek z czymkolwiek poza płaszczyzną lub bryłą na jego osi; torus lub bryła obrotowa z płaszczyzną ani prostopadłą do osi, ani przez nią przechodzącą, albo z bryłą poza osią; bryła wyciągnięta z czymkolwiek poza płaszczyzną lub ścianą wyciągniętą w tym samym kierunku. Są one odrzucane, a bryły pozostają bez zmian; tak samo cięcie, które styka się z krawędzią stycznie, ściany leżące prawie, ale nie całkiem, na jednej powierzchni oraz bardzo cienki pasek między cięciem a krawędzią. Poprzedni po poleceniu RÓŻNICA informuje, że nie ma poprzedniego zbioru wskazań, podczas gdy AutoCAD nie znajduje żadnego z usuniętych obiektów. Historia brył nie jest przechowywana (SOLIDHIST, SHOWHISTORY).

## Questions

### Jak się nazywa polecenie RÓŻNICA po angielsku?

SUBTRACT. W polskim AutoCADzie wpisz `RÓŻNICA` lub skrót `ROZ` i naciśnij Enter lub spację; skrót `SU` z wersji angielskiej w polskiej nie działa. `_SUBTRACT` działa w AutoCADzie w każdym języku.

### Jak odjąć jedną bryłę od drugiej w AutoCADzie?

Narysuj bryłę do odjęcia tam, gdzie zachodzi na drugą: walec przez prostopadłościan, aby powstał otwór. Uruchom RÓŻNICA, wskaż prostopadłościan i naciśnij Enter, potem wskaż walec i naciśnij Enter: w prostopadłościanie zostaje otwór, a walec znika. Kolejność ma znaczenie, bo zostaje to, co wskazano najpierw.

### Dlaczego RÓŻNICA nie działa?

Często chodzi o kolejność: to, co ma zostać, trafia do pierwszego zbioru, a to, co należy odjąć, do drugiego. Gdy pierwszy zbiór nie zawiera bryły ani regionu albo drugi nie zawiera żadnego, którego nie ma już w pierwszym, polecenie wyświetla <Message id="noSolidsOrRegionsSelected" /> i kończy działanie; gdy niczego z drugiego zbioru nie da się odjąć od pierwszego, na przykład bryły od regionu albo regionu w innej płaszczyźnie, wyświetla <Message id="subtractNeedsTwo" /> i niczego nie zmienia. Z linii i polilinii trzeba najpierw utworzyć regiony. Gdy informuje, że jedna operacja logiczna się nie powiodła, bryły przecinają się w sposób, którego MellowCAD jeszcze nie potrafi obliczyć, i pozostają bez zmian.

### Jak odjąć pole w AutoCADzie?

Aby wyciąć jeden kształt 2D z drugiego, utwórz z obu regiony poleceniem <Command id="REGION" /> i odejmij wewnętrzny od zewnętrznego poleceniem RÓŻNICA: kwadrat, z którego odjęto okrąg, staje się jednym regionem z otworem. Aby zmierzyć pole bez zmieniania rysunku, <Command id="AREA" /> odejmuje obszary od bieżącej sumy opcją <Keyword command="AREA" id="Subtract" />.

### Czy można odjąć bez usuwania obiektu?

RÓŻNICA usuwa to, co odejmuje, tak jak w AutoCADzie. Aby go zachować, najpierw skopiuj obiekt w to samo miejsce: <Command id="COPY" />, obiekt i Enter, punkt bazowy 0,0, potem ponownie Enter, aby skopiować go o 0,0, na siebie. RÓŻNICA zużyje wtedy jeden z nich.
