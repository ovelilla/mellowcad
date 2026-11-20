---
title: "Befehl STRAHL (RAY) in AutoCAD"
metaTitle: "STRAHL (RAY) in AutoCAD: Linie ins Unendliche"
description: "Wie STRAHL (RAY) in AutoCAD Konstruktionslinien zeichnet, die an einem Punkt beginnen und in eine Richtung ins Unendliche laufen, und wie sie zu Linien werden."
figure: "Strahlen von einem Startpunkt durch drei Punkte, jeder läuft über den Rand der Ansicht hinaus."
sourceHash: "732d6e8c23de"
---

STRAHL (RAY) zeichnet Strahlen: Konstruktionslinien, die an einem Punkt beginnen und in eine Richtung ins Unendliche laufen. Wählen Sie den Startpunkt, dann einen Durchgangspunkt: Der Strahl beginnt am ersten und verläuft durch den zweiten. Jeder weitere Punkt erzeugt einen weiteren Strahl vom selben Startpunkt, bis die Eingabetaste den Befehl beendet. Ein Durchgangspunkt auf dem Startpunkt wird mit <Message id="invalid" /> abgewiesen. Jeder Strahl liegt auf dem aktuellen Layer mit der aktuellen Farbe, dem aktuellen Linientyp und der aktuellen Linienstärke.

Ein Strahl läuft quer durch die Ansicht, wie weit Sie auch pannen oder zoomen, und die Ausdehnung der Zeichnung lässt ihn außen vor, wie in AutoCAD. Der Objektfang Endpunkt findet seinen Startpunkt, Nächster, Lot und Schnittpunkt wirken entlang des Strahls. <Command id="TRIM" /> und <Command id="BREAK" /> machen aus dem Stück, das den Startpunkt enthält, eine Linie, und <Command id="EXTEND" /> führt den Startpunkt zurück bis zu einer Kante hinter ihm. <Command id="XLINE" /> zeichnet Linien, die in beide Richtungen laufen.

## Missing

LENGTHEN und JOIN an einem Strahl sind noch nicht mit AutoCAD abgeglichen, ebenso wenig die Menüs seiner Griffe.

## Questions

### Was ist der Befehl STRAHL (RAY) in AutoCAD?

Eine Konstruktionslinie mit einem Anfang: Sie beginnt an einem Punkt und läuft in eine Richtung endlos weiter. Verwenden Sie sie als Bezug, an dem Sie zeichnen, und stutzen Sie sie dann zu einer Linie oder löschen Sie sie.

### Hat STRAHL ein Kürzel?

Nein: AutoCAD gibt STRAHL kein Alias, geben Sie also `STRAHL` vollständig ein, oder `_RAY` in jeder Sprache von AutoCAD. Er steht in der erweiterten Gruppe Zeichnen der Multifunktionsleiste und hier in den Zeichenwerkzeugen neben Konstruktionslinie.

### Wie lasse ich einen Strahl an einer Linie enden?

Stutzen Sie ihn: Starten Sie <Command id="TRIM" /> und wählen Sie den Teil jenseits der Linie. Was vom Startpunkt bis zur Linie bleibt, ist ein Linienobjekt.

### Was ist der Unterschied zwischen einem Strahl und einer Linie?

Eine Linie hat zwei Enden; ein Strahl hat eines, seinen Startpunkt, und läuft ohne Ende weiter. In einer DXF-Datei wird ein Strahl als RAY gespeichert und als Strahl wieder geöffnet.
