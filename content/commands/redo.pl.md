---
title: "Polecenie ODTWÓRZ (REDO) w AutoCADzie: przywracanie cofniętych zmian"
metaTitle: "Polecenie ODTWÓRZ (REDO) w AutoCADzie"
description: "Jak działa polecenie ODTWÓRZ (REDO) w AutoCADzie: przywraca to, co cofnęło ostatnie C lub COFAJ, zaraz po nim; WODTWÓRZ i Ctrl+Y krok po kroku."
figure: "Otwór narysowany w płycie, cofnięty poleceniem C i przywrócony poleceniem ODTWÓRZ."
sourceHash: "be2e44b98ac0"
---

Polecenie ODTWÓRZ (REDO) odwraca ostatnie <Command id="U" /> lub <Command id="UNDO" />: wszystko, co zostało cofnięte, rysuje się ponownie w całości, więc po cofnięciu pięciu poleceń przez COFAJ polecenie ODTWÓRZ przywraca wszystkie pięć. Wypisuje przy tym nazwy poleceń, a gdy nie ma już nic do przywrócenia – <Message id="everythingRedone" />. O nic nie pyta i nie ma opcji.

Działa tylko bezpośrednio po cofnięciu. W każdej innej chwili wyświetla <Message id="redoMustFollowUndo" />, a gdy w międzyczasie zostało wykonane inne polecenie, nawet takie, które niczego nie zmienia, jak LISTA czy ZOOM – <Message id="nothingToRedo" />. Gdy cofanie jest wyłączone opcją <Keyword command="UNDO" id="Control" /> › <Keyword command="UNDO" id="None" /> polecenia COFAJ, polecenie ODTWÓRZ informuje, że jest wyłączone.

<Command id="MREDO" /> przywraca krok po kroku: pyta o liczbę operacji albo o <Keyword command="MREDO" id="All" /> lub <Keyword command="MREDO" id="Last" /> i przywraca tyle kroków spośród cofniętych, niezależnie od tego, jakie C, COFAJ i ODTWÓRZ zostały w międzyczasie wykonane; <Keyword command="MREDO" id="Last" /> to całe ostatnie cofnięcie, jeden raz (<Message id="alreadyRedone" />). Ctrl+Y i pozycja Odtwórz w menu skrótów uruchamiają WODTWÓRZ z wartością 1, przerywając bieżące polecenie.

## Missing

Ctrl+Shift+Z również przywraca, bez komunikatu, choć AutoCAD nie przypisuje do niego niczego. Przyciski Cofnij i Odtwórz na górnym pasku nie zapisują niczego w historii, podczas gdy pasek szybkiego dostępu AutoCADa zapisuje własne wpisy.

## Questions

### Jak się nazywa polecenie ODTWÓRZ po angielsku?

REDO. Nie ma skrótu: wpisz `ODTWÓRZ` albo `_REDO` w AutoCADzie w dowolnym języku. Najszybciej działa Ctrl+Y, który przywraca jeden krok (WODTWÓRZ 1).

### Dlaczego ODTWÓRZ nie działa?

Polecenie ODTWÓRZ odwraca tylko C lub COFAJ wykonane tuż przed nim. Po każdym innym poleceniu nie ma już czego przywracać, nawet jeśli niczego ono nie zmieniło: cofnij, a potem od razu przywróć.

### Czym się różni ODTWÓRZ od WODTWÓRZ?

Polecenie ODTWÓRZ przywraca całe ostatnie cofnięcie i tylko bezpośrednio po nim. <Command id="MREDO" /> przywraca wybraną liczbę cofniętych kroków, jeden po drugim, albo wszystkie, i działa także po ODTWÓRZ.

### Jak powtórzyć ostatnie polecenie w AutoCADzie?

Naciśnij Enter lub spację przy monicie `Polecenie:`: ostatnie polecenie uruchomi się ponownie. ODTWÓRZ nie powtarza polecenia, tylko odwraca cofnięcie.
