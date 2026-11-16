---
title: "Polecenie NFRAGM (PAN) w AutoCADzie"
description: "Jak przesuwać widok w AutoCADzie poleceniem NFRAGM (PAN, skrót NF): kursor w kształcie dłoni lub kółko myszy, -NFRAGM o dwa punkty i NFRAGM w innym poleceniu."
figure: "NFRAGM przeciągnięte w prawo i w dół, potem Enter: płytka przesuwa się w widoku, a jej współrzędne się nie zmieniają."
sourceHash: "0ca3050831f3"
---

Polecenie NFRAGM (PAN) przesuwa widok; nic w rysunku się nie rusza. Zaczyna od <Message id="panExit" /> i o nic więcej nie pyta: kursor zmienia się w dłoń, a przeciąganie lewym przyciskiem przesuwa z nim widok, ile razy chcesz, aż Enter lub Esc je zakończy. Bez polecenia NFRAGM przeciąganie wciśniętym kółkiem myszy przesuwa widok w każdej chwili, nawet w trakcie polecenia. Każde użycie polecenia NFRAGM to krok cofania, łączony z sąsiednimi ZOOM i NFRAGM, więc <Command id="U" /> przywraca widok. Wpisane z apostrofem, `'NFRAGM` lub `'NF`, działa wewnątrz innego polecenia, które potem trwa dalej.

<Command id="-PAN" /> przesuwa widok o dwa punkty: punkt bazowy i drugi punkt, a widok przesuwa się o odległość między nimi; albo o przemieszczenie wpisane przy pierwszym monicie, na przykład `50,0`, i Enter przy drugim. Ono również działa przezroczyście i jest osobnym krokiem cofania.

## Missing

Menu skrótów, które AutoCAD pokazuje po kliknięciu prawym przyciskiem podczas przesuwania widoku, z pozycjami Zakończ, Nowy fragment, Zoom, Orbita 3D, Zoom okno, Zoom poprzedni i Zoom zakres.

## Questions

### Jak się nazywa polecenie NFRAGM po angielsku?

PAN. W polskim AutoCADzie jego skrót to `NF`: wpisz go i naciśnij Enter lub spację. Angielskie `P` w polskiej wersji uruchamia polecenie PAPIER; pełna nazwa `NFRAGM` działa, a `_PAN` – w AutoCADzie w każdym języku. Można też bez polecenia: wciśnij kółko myszy i przeciągaj.

### Jak przesuwać widok myszą w AutoCADzie?

Wciśnij kółko myszy i przeciągaj: widok podąża za kursorem. Obracaj kółkiem, aby powiększać i pomniejszać wokół kursora. Na touchpadzie uruchom polecenie NFRAGM i przeciągaj lewym przyciskiem.

### Jak przesunąć widok w trakcie rysowania?

Przeciągnij wciśniętym kółkiem albo wpisz `'NF` przy monicie polecenia: polecenie czeka, aż przesuniesz widok, a potem znów pyta tam, gdzie skończyło.

### Jak przesunąć widok o dokładną odległość?

Użyj polecenia <Command id="-PAN" />: wpisz przemieszczenie, na przykład `100,0`, i naciśnij Enter przy drugim punkcie. Widok przesunie się o 100 jednostek wzdłuż X.
