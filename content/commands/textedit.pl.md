---
title: "Polecenie EDTEKST (TEXTEDIT) w AutoCADzie"
description: "Jak polecenie EDTEKST (TEXTEDIT, skrót EDT) w AutoCADzie edytuje tekst, tekst wielowierszowy i definicje atrybutów, jeden po drugim, z Cofaj i Tryb."
figure: "Błędnie napisane PALTE na tabliczce wskazane poleceniem EDTEKST i poprawione na PLATE, potem Esc kończy polecenie."
sourceHash: "2d0ed6fe5acc"
---

Polecenie EDTEKST (TEXTEDIT) edytuje obiekty opisu: podaje bieżący tryb edycji, na początku <Keyword id="Multiple" />, i prosi o wybranie obiektu. Tekst jednowierszowy otwiera się do ponownego wpisania w miejscu, gdzie jest, tekst wielowierszowy – w edytorze polecenia <Command id="MTEXT" />, a definicja atrybutu – jako jej oznaczenie, monit i wartość domyślna. W trybie <Keyword id="Multiple" /> polecenie pyta potem o następny obiekt, aż Esc lub Enter je zakończy, a całe wykonanie to jeden krok, który cofa <Command id="U" />. Dwukrotne kliknięcie tekstu lub definicji atrybutu uruchamia EDTEKST, a na tekście wielowierszowym otwiera edytor dla tego jednego obiektu.

Esc w edytorze tekstu jednowierszowego porzuca tę edycję i pyta o następny obiekt; drugie naciśnięcie Esc kończy polecenie. Przy obiekcie na zablokowanej warstwie polecenie wyświetla <Message id="objectOnLockedLayer" /> i pyta ponownie, a wskazanie czegokolwiek innego ponawia pytanie bez komunikatu. Jeden tekst wybrany przed uruchomieniem polecenia otwiera się od razu.

## Options

### Undo

Cofa ostatnią edycję tego wykonania i ponownie pyta; gdy nie ma już nic do cofnięcia, informuje, że polecenie zostało całkowicie cofnięte.

### Mode

Pyta o tryb edycji: <Keyword id="Single" /> kończy polecenie po jednym obiekcie, <Keyword id="Multiple" /> pyta o następny. Tryb zostaje zachowany dla następnego wywołania polecenia EDTEKST, w każdym rysunku.

## Missing

Tekst wymiaru: EDTEKST nie edytuje tekstu wymiaru, który ustala opcja Tekst polecenia <Command id="DIMLINEAR" /> podczas wstawiania. Edycja treści tekstu w palecie Właściwości. Wpisywane EDWTEKST (MTEDIT) i -EDWTEKST. Gdy edytor jest otwarty, w wierszu polecenia widnieje `EDTEKST:`, podczas gdy AutoCAD edytuje w miejscu i o nic nie pyta.

## Questions

### Jak się nazywa polecenie EDTEKST po angielsku?

TEXTEDIT. W polskim AutoCADzie wpisz `EDT` i naciśnij Enter lub spację; działają też `ODTEKST` i `ET`. Skrót `ED` z wersji angielskiej w polskiej nie działa. `_TEXTEDIT` działa w AutoCADzie w każdym języku.

### Jak edytować tekst w AutoCADzie?

Kliknij go dwukrotnie albo wpisz `EDT` i wskaż go; wpisz nową treść i naciśnij Enter. EDTEKST pyta potem o następny tekst do edycji, aż do Esc. Jego wysokość i obrót są wierszami palety Właściwości, a jego styl – wierszem Styl.

### Jak edytować kilka tekstów po kolei?

Zostaw EDTEKST w trybie <Keyword id="Multiple" />, domyślnym: po każdym tekście pyta o następny. <Keyword id="Mode" /> i <Keyword id="Single" /> sprawiają, że polecenie kończy się po jednym tekście, jak przy dwukrotnym kliknięciu.

### Dlaczego dwukrotne kliknięcie nie edytuje tekstu?

Tekst może leżeć na zablokowanej warstwie: odblokuj warstwę w Menedżerze właściwości warstw. Tekstu wymiaru EDTEKST jeszcze nie edytuje, a wartości atrybutów bloku otwiera <Command id="EATTEDIT" />.
