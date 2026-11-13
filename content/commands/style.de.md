---
title: "Befehl STIL (STYLE) in AutoCAD"
description: "Wie STIL (STYLE, Alias STI) in AutoCAD Textstile verwaltet: neu, umbenennen, löschen, aktuell setzen, feste Höhe, und was ein Stil mit TEXT und MTEXT macht."
figure: "Ein Typenschild: STIL, dann TEXT, dessen Stil ? den Stil der Zeichnung auflistet, Standard in Arial, und der Name des Schilds darin geschrieben."
sourceHash: "8c15a1a95e66"
---

STIL (STYLE) verwaltet die Textstile der Zeichnung: womit ein Text geschrieben wird. Jeder Text, Mehrzeilentext und jedes Attribut hat einen Stil, und neue übernehmen den aktuellen Stil, in einer neuen Zeichnung Standard. STIL von AutoCAD öffnet das Dialogfeld Textstil; MellowCAD hat noch keines, STIL öffnet also die Texttabelle der Palette Stile, in der auch die Bemaßungsstile von <Command id="DIMSTYLE" /> stehen. Eine davor getroffene Auswahl wird verworfen, wie das Dialogfeld sie verwirft, und mit Apostroph innerhalb eines Befehls eingegeben, `'STYLE`, öffnet er sich, ohne diesen Befehl zu beenden.

Die Tabelle listet die Stile auf, der aktuelle ist markiert. Neu erstellt eine Kopie des gewählten Stils, `style1`, `style2` … benannt, der erste freie Name, und macht sie aktuell. Aktuell setzen macht einen Stil aktuell; sein Name kann neu eingegeben werden, und ein bereits verwendeter Name, in beliebiger Schreibweise, wird abgelehnt, wie AutoCAD ihn ablehnt. Löschen entfernt einen Stil, aber nie Standard, den aktuellen Stil oder einen verwendeten. Höhe gibt einem Stil eine feste Höhe: 0, die Vorgabe, lässt sie frei, sodass <Command id="TEXT" /> jedes Mal nach einer fragt; bei festgelegter Höhe fragt TEXT nicht. Jede Änderung ist ein Schritt, den <Command id="U" /> zurücknimmt. Bei gewählten Texten gibt die Zeile Stil der Palette Eigenschaften ihnen einen anderen Stil, in einem Schritt.

## Missing

Das Dialogfeld Textstil und seine Vorschau: STIL öffnet stattdessen die Palette Stile. Schriftart, Schriftstil und Großschrift, Breitenfaktor, Neigungswinkel und die Effekte Kopfstehend, Rückwärts und Vertikal: Jeder Stil wird in Arial gezeichnet, aufrecht, mit Breite 1. Beschriftungsfähige Stile und der Stil Annotative, den eine neue AutoCAD-Zeichnung neben Standard enthält. `-STYLE`, das alles in der Befehlszeile abfragt.

## Questions

### Wie lautet das Kürzel für STIL (STYLE) in AutoCAD?

`STI`, dann die Eingabetaste oder die Leertaste; ebenso `DDSTYLE`. `_STYLE` funktioniert in jeder Sprache von AutoCAD.

### Wie ändere ich den Textstil in AutoCAD?

Für neuen Text machen Sie den Stil in der von STIL geöffneten Palette Stile aktuell oder mit der Option <Keyword command="TEXT" id="Style" /> von <Command id="TEXT" />. Für bereits geschriebenen Text wählen Sie ihn und wählen den Stil in der Zeile Stil der Palette Eigenschaften.

### Wie ändere ich die Schriftart eines Textstils?

In AutoCAD unter Schriftname im Dialogfeld Textstil. Hier noch nicht: Jeder Stil wird in Arial gezeichnet, und ein Stil unterscheidet sich nur in seinem Namen und seiner Höhe.

### Warum fragt TEXT nicht nach der Höhe?

Der aktuelle Stil hat eine eigene Höhe. Setzen Sie seine Höhe in der Palette Stile auf 0, und <Command id="TEXT" /> fragt wieder nach der Höhe und bietet die zuletzt verwendete an.
