---
title: "Befehl LINIE (LINE) in AutoCAD"
description: "So arbeitet AutoCADs LINIE (LINE, Alias L): Punkte wählen oder tippen, Zurück und Schließen, und die Eingabetaste, um von der letzten Linie weiterzuzeichnen."
figure: "Ein Dreieck: sein erster Punkt getippt, die nächsten zwei vom letzten Punkt aus, dann Schließen."
sourceHash: "5065fc1817a1"
---

LINIE (LINE) zeichnet gerade Segmente, jedes ein eigenes Objekt: Geben Sie den ersten Punkt an, dann jeden nächsten, bis zur Eingabetaste. Ein Punkt wird angeklickt, mit einem Objektfang gefangen oder eingegeben. Wie in AutoCAD bei eingeschalteter dynamischer Eingabe wird ein nach dem ersten eingegebener Punkt vom letzten aus gemessen, sodass `80,0` 80 entlang X zeichnet und der Verlauf es als `@80,0` schreibt; eine Zahl allein ist ein Abstand in Richtung des Cursors, und `<30` hält den nächsten Punkt auf 30°. Die Eingabetaste oder ein Rechtsklick beim ersten Punkt setzt die Zeichnung am Ende der letzten Linie, Polylinie oder des letzten Bogens fort: tangential an einen Bogen und nur mit der Frage nach der Länge. Wie viele Segmente er auch zeichnet, ein <Command id="U" /> nimmt den ganzen Befehl zurück.

## Options

### Undo

Nimmt das letzte Segment zurück und fragt erneut ab dem Punkt davor. Ist kein Segment mehr da, meldet er <Message id="allLineSegmentsUndone" /> und fragt erneut nach dem ersten Punkt.

### Close

Ab dem zweiten Segment angeboten: zeichnet das letzte Segment zurück zum ersten Punkt und beendet den Befehl, die Form geschlossen.

## Missing

Tangente oder Lot, beim ersten Punkt eingegeben, wartet auf den nächsten (ein aufgeschobener Fang), wie in AutoCAD, aber nur bei Linien, Kreisen und Bögen, nicht bei einem Polylinien-Segment, einer Ellipse oder einem Spline, und zwei aufgeschobene Lote werden nicht gelöst.

## Questions

### Wie lautet das Kürzel für LINIE (LINE) in AutoCAD?

`L`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_LINE` in jeder Sprache von AutoCAD.

### Wie zeichne ich eine Linie mit Winkel und Länge?

Geben Sie den ersten Punkt an, geben Sie dann den nächsten als Länge und Winkel ein: `@100<30` zeichnet 100 unter 30°. Oder schalten Sie die Spurverfolgung ein, folgen Sie ihrer Hilfslinie in diesem Winkel und geben Sie nur die Länge ein.

### Wie zeichne ich von der zuletzt gezeichneten Linie aus weiter?

Starten Sie LINIE und drücken Sie beim ersten Punkt die Eingabetaste: Er beginnt am Ende der letzten Linie, Polylinie oder des letzten Bogens. Von einem Bogen aus läuft die Linie tangential an ihn weiter, und LINIE fragt nur nach ihrer Länge. Gibt es nichts zum Weiterzeichnen, meldet er <Message id="noLineOrArcToContinue" />.

### Warum besteht meine Linie aus einzelnen Stücken?

Jedes Segment, das LINIE zeichnet, ist wie in AutoCAD eine eigene Linie. Für ein Objekt zeichnen Sie mit <Command id="PLINE" />, oder verbinden Sie die Linien danach mit <Command id="JOIN" />.
