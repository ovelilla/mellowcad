---
title: "Polecenie COFAJ (UNDO) w AutoCADzie"
description: "Jak działa polecenie COFAJ (UNDO) w AutoCADzie: liczba kroków wstecz, Zaznacz i Wróć, Początek i Koniec, Tryb, i czym się różni od C i Ctrl+Z."
before: "Płyta z dwoma otworami i linią w poprzek, narysowana czterema poleceniami: PROSTOK, dwa razy OKRĄG i LINIA."
figure: "COFAJ 2: dwa ostatnie polecenia zostają cofnięte, linia i drugi otwór, a płyta zachowuje pierwszy otwór."
sourceHash: "5d2bca4366d1"
---

Polecenie COFAJ (UNDO) cofa polecenia. Krok to całe polecenie: wszystko, co narysowało jedno polecenie LINIA, znika naraz, bez względu na liczbę odcinków, tak samo jak to, co polecenie ustawiło, na przykład RLSKALA. COFAJ wypisuje swoje bieżące ustawienia, a potem pyta o liczbę operacji do cofnięcia lub opcję; Enter cofa jedną. Nazwy cofniętych poleceń wypisuje w jednym wierszu, `OKRĄG LINIA`, a gdy dojdzie do początku – <Message id="everythingUndone" />; potem <Message id="nothingToUndo" />. Polecenie, które niczego nie zmieniło, jak ID czy LISTA, też jest krokiem, podobnie jak zmiany widoku wykonane poleceniami ZOOM i NFRAGM.

<Command id="U" /> to forma skrócona: jeden krok wstecz, bez pytania. Ctrl+Z przy monicie `Polecenie:` uruchamia polecenie C; wewnątrz polecenia jest to jego własna opcja Cofaj, tak jak wpisuje ją makro AutoCADa: LINIA cofa ostatni odcinek i działa dalej. <Command id="REDO" /> użyte zaraz potem przywraca to, co cofnęło ostatnie C lub COFAJ.

## Options

### Auto

Pyta <Keyword id="ON" /> lub <Keyword id="OFF" />, proponując bieżące ustawienie, które pokazuje potem wiersz ustawień. W AutoCADzie łączy w jeden krok polecenia uruchamiane przez jedną pozycję menu; tutaj żadne menu nie uruchamia więcej niż jednego, więc niczego nie łączy.

### Control

Pyta, w jakim zakresie zachować cofanie, domyślnie <Keyword id="All" />. <Keyword id="None" /> usuwa wszystkie zachowane kroki i wyłącza cofanie: C wyświetla wtedy <Message id="uDisabled" />, a COFAJ od razu pyta o <Keyword id="Control" />. <Keyword id="One" /> zachowuje tylko ostatni krok, a COFAJ pyta wtedy o 1 lub <Keyword id="Control" />. <Keyword id="All" /> przywraca pełne cofanie. <Keyword id="Combine" /> określa, czy kolejne ZOOM i NFRAGM są jednym krokiem, a <Keyword id="Layer" /> – czy są nim kolejne zmiany w Menedżerze właściwości warstw; w obu przypadkach domyślnie Tak. Ustawienia należą do rysunku, ale nie są z nim zapisywane: nowy lub otwarty rysunek zaczyna od <Keyword id="All" />, <Keyword id="Combine" /> Tak i <Keyword id="Layer" /> Tak.

### BEgin

Rozpoczyna grupę: polecenia wykonane do <Keyword id="End" /> tworzą jeden krok, który C cofa w całości, wypisując `GRUPA` razem z ich nazwami. Gdy grupa jest otwarta, C, liczba i <Keyword id="Back" /> zatrzymują się na jej początku. <Keyword id="BEgin" /> przy otwartej grupie najpierw ją zamyka.

### End

Zamyka grupę otwartą przez <Keyword id="BEgin" />.

### Mark

Wstawia znacznik między krokami. <Keyword id="Back" />, C i liczba zatrzymują się na nim, z komunikatem <Message id="markEncountered" />.

### Back

Cofa wszystkie kroki do ostatniego znacznika, razem ze znacznikiem. Bez znacznika pyta, czy cofnąć wszystko, domyślnie Tak.

## Missing

<Keyword id="Auto" /> niczego nie łączy, bo żadne menu nie uruchamia tutaj więcej niż jednego polecenia. <Keyword id="Combine" /> i <Keyword id="Layer" /> obowiązują do końca sesji przeglądarki, podczas gdy AutoCAD zachowuje je między sesjami. Przyciski Cofnij i Odtwórz na pasku szybkiego dostępu nie zapisują niczego w historii, podczas gdy przyciski AutoCADa zapisują własne wpisy. Ctrl+Shift+Z również przywraca, bez komunikatu, choć AutoCAD nie przypisuje do niego niczego.

## Questions

### Jak się nazywa polecenie COFAJ po angielsku?

UNDO. Nie ma skrótu: wpisz `COFAJ` w całości, aby podać liczbę kroków lub opcję, albo `_UNDO` w AutoCADzie w każdym języku. Jeden krok wstecz to Ctrl+Z albo `C` i Enter; `U` z wersji angielskiej uruchamia w polskiej ŁUK.

### Czym się różni C od COFAJ?

<Command id="U" /> cofa ostatnie polecenie i o nic nie pyta. COFAJ pyta, ile cofnąć, i ma <Keyword id="Mark" /> i <Keyword id="Back" />, aby wrócić do zaznaczonego miejsca, <Keyword id="BEgin" /> i <Keyword id="End" />, aby kilka poleceń stało się jednym krokiem, oraz <Keyword id="Control" />, aby ograniczyć lub wyłączyć cofanie.

### Jak cofnąć kilka poleceń naraz w AutoCADzie?

Wpisz `COFAJ` i liczbę poleceń, na przykład `5`. Albo wybierz <Keyword id="Mark" /> przed serią, którą być może zechcesz porzucić, i <Keyword id="Back" />, aby do niej wrócić.

### Dlaczego COFAJ nie działa?

Cofanie zostało wyłączone opcją <Keyword id="Control" /> › <Keyword id="None" />: C o tym informuje, a COFAJ pyta o <Keyword id="Control" />. Odpowiedz <Keyword id="All" />, aby je ponownie włączyć. Kroki wykonane wcześniej przepadły.

### Jak przywrócić cofnięte zmiany w AutoCADzie?

<Command id="REDO" /> zaraz po C lub COFAJ przywraca wszystko naraz. Ctrl+Y przywraca po jednym kroku.
