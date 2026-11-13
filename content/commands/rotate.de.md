---
title: "Befehl DREHEN (ROTATE) in AutoCAD"
description: "Wie DREHEN (ROTATE, Alias DH) in AutoCAD Objekte um einen Basispunkt dreht: Winkel, Kopieren und Referenz, um sich an einer Kante auszurichten. Zum Testen."
figure: "Ein Rechteck um 30° um seine Ecke mit Kopieren gedreht, das Original behalten."
sourceHash: "0e5ae021e108"
---

DREHEN (ROTATE) dreht die gewählten Objekte um einen Basispunkt: Wählen Sie sie, geben Sie den Basispunkt an, dann den Winkel, eingegeben oder als Punkt gewählt, dessen Richtung vom Basispunkt aus der Winkel ist. Seine erste Zeile zeigt, welche Richtung positiv ist, vorgegeben gegen den Uhrzeigersinn (ANGDIR), und wo 0 liegt (ANGBASE). Die Eingabetaste beim Winkel wiederholt die letzte Drehung, in einer neuen Zeichnung 0. Die Objekte drehen sich um eine Achse parallel zum Z des BKS durch den Basispunkt, behalten in 3D also ihre Höhe. Die Drehung ist ein Schritt, den Rückgängig zurücknimmt.

## Options

### Copy

Dreht eine Kopie und lässt die Objekte, wo sie waren, und meldet <Message id="rotatingCopy" />. Die Eingabeaufforderung fragt dann erneut nach dem Winkel.

### Reference

Dreht von einem Winkel, den Sie haben, zu dem, den Sie wollen: Er fragt nach dem Referenzwinkel (eingegeben oder zwei Punkte, die ihn messen), dann nach dem neuen Winkel und dreht um die Differenz. Um eine schräge Kante waagerecht zu stellen, wählen Sie ihre beiden Enden als Referenz und geben Sie 0 ein.

### Points

Beim neuen Winkel von Reference: Der neue Winkel ist der einer Linie zwischen zwei gewählten Punkten, sodass sich die Objekte an einer bereits gezeichneten Kante ausrichten.

## Missing

Während Sie den Winkel angeben, folgt die gedrehte Auswahl dem Fadenkreuz in der Farbe jedes Objekts, aber nicht in seinem Linientyp oder seiner Linienstärke.

## Questions

### Wie lautet das Alias von DREHEN (ROTATE) in AutoCAD?

`DH`, dann die Eingabetaste oder die Leertaste. Das `RO` des englischen AutoCAD gibt es in der deutschen Version nicht. Der volle Name funktioniert ebenfalls, und `_ROTATE` in jeder Sprache von AutoCAD.

### Wie dreht man ein Objekt, um es an einem anderen auszurichten?

Wählen Sie <Keyword id="Reference" />, wählen Sie zwei Punkte entlang der Kante des Objekts, dann wählen Sie <Keyword id="Points" /> und wählen Sie zwei Punkte entlang der Linie, der es folgen soll.

### Wie dreht man ein Objekt und behält das Original?

Wählen Sie <Keyword id="Copy" /> vor der Winkelangabe: Die Kopie dreht sich, und das Original bleibt.

### Warum dreht DREHEN in die falsche Richtung?

Ein positiver Winkel dreht gegen den Uhrzeigersinn, wie ANGDIR in der ersten Zeile angezeigt wird. Geben Sie einen negativen Winkel ein, `-30`, um im Uhrzeigersinn zu drehen.
