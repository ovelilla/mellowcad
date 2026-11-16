---
title: "Polecenie POŁĄCZ (JOIN) w AutoCADzie"
description: "Jak połączyć linie w polilinię w AutoCADzie poleceniem POŁĄCZ (JOIN): linie na jednej prostej w jedną, łuki w okrąg, krzywe w splajn. Wypróbuj za darmo online."
figure: "Trzy linie połączone w jedną polilinię, którą polecenie ODSUŃ jednym wskazaniem odsuwa w całości."
sourceHash: "c4f26ede4174"
---

Polecenie POŁĄCZ (JOIN) tworzy jeden obiekt z kilku. Wybierz je, ile chcesz, i naciśnij Enter: linie i łuki stykające się końcami stają się jedną polilinią, dołączoną do polilinii, jeśli jest wśród nich; linie na jednej prostej stają się jedną linią, niezależnie od przerw; łuki jednego okręgu stają się jednym łukiem, a gdy się zamykają, polecenie POŁĄCZ pyta, czy zamienić go w okrąg, domyślnie <Keyword id="Yes" />, czy zostawić łuk, <Keyword id="No" />. Łuki eliptyczne jednej elipsy stają się jednym łukiem, a splajn lub łuk eliptyczny wśród stykających się krzywych daje splajn. Polecenie podaje potem, co utworzyło i ile obiektów pominęło. Polilinia łączy się tylko końcami, a zamknięta nie łączy niczego. Połączenie to jeden krok cofania.

## Options

### cLose

Gdy źródłem jest łuk eliptyczny, wskazany sam: uzupełnia go do pełnej elipsy.

## Missing

Osobny krok AutoCADa, gdy źródłem jest pojedyncza linia, łuk lub polilinia wskazana sama (`Wybierz linie do dołączenia do źródła:`): tutaj niczego nie łączy. Obiekt zamknięty wskazany sam, o który AutoCAD pyta ponownie. Helisy, obiekty w pochylonej lub odwróconej płaszczyźnie oraz linie, które nie leżą w jednej płaszczyźnie, a które AutoCAD łączy w polilinię 3D lub spłaszcza do polilinii.

## Questions

### Jak się nazywa polecenie POŁĄCZ po angielsku i jaki ma skrót?

JOIN. W polskim AutoCADzie polecenie POŁĄCZ nie ma skrótu: wpisz pełną nazwę i naciśnij Enter lub spację. Angielskie `J` w polskiej wersji nie działa; `_JOIN` działa w AutoCADzie w każdym języku.

### Jak połączyć linie w polilinię w AutoCADzie?

Uruchom polecenie POŁĄCZ, wybierz linie, choćby oknem, i naciśnij Enter: te, które stykają się końcami, stają się jedną polilinią.

### Dlaczego polecenie POŁĄCZ nie działa?

Obiekty muszą stykać się dokładnie, końcami i w jednej płaszczyźnie: przerwa lub przecięcie je wyklucza, a polecenie POŁĄCZ mówi, ile odrzuciło. Mimo przerwy łączone są tylko linie na jednej prostej, łuki jednego okręgu i łuki jednej elipsy. Zamknięta polilinia niczego nie łączy.

### Jak połączyć łuki w okrąg?

Wybierz łuki jednego okręgu, które pokrywają go w całości, i naciśnij Enter: polecenie POŁĄCZ pyta, czy zamienić je w okrąg, a <Keyword id="Yes" />, domyślna odpowiedź, to robi.
