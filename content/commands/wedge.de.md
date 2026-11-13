---
title: "Befehl KEIL (WEDGE) in AutoCAD"
description: "Wie KEIL (WEDGE, Alias KE) in AutoCAD einen 3D-Keil zeichnet: zwei Ecken und eine Höhe, Mittelpunkt, Würfel, Länge und 2 Punkte."
figure: "Ein Keil von 60 mal 40 mal 25, aus zwei Ecken und einer Höhe, seine Schräge fällt vom Ende der ersten Ecke ab, von Südosten im visuellen Stil Verdeckt gesehen."
sourceHash: "06fba2eeb7be"
---

KEIL (WEDGE) zeichnet einen 3D-Volumenkörper in Keilform: einen Quader, dessen Oberseite von einem Ende zum anderen abfällt. Der Befehl fragt, was <Command id="BOX" /> fragt: die erste Ecke, die andere Ecke, dann die Höhe. Das hohe Ende liegt an der ersten Ecke, und die Schräge fällt entlang der X-Achse des BKS zur Seite der anderen Ecke ab; eine Ecke bei kleinerem X dreht ihn um. Die Höhe wächst entlang der Z-Achse des BKS, eine negative geht nach unten. Länge, Breite und Höhe sind die Vorgaben von <Command id="BOX" />, die die Eingabetaste nimmt. Der Keil liegt auf dem aktuellen Layer, und Rückgängig nimmt ihn in einem Schritt zurück.

<Command id="LIST" /> zeigt seine Position, Länge, Breite, Höhe und Drehung, und in der Eigenschaftenpalette können Sie sie eingeben. Seine Griffe sind die von <Command id="BOX" />. Er ist ein 3D-Volumenkörper für <Command id="UNION" />, <Command id="SUBTRACT" /> und den Rest des 3D von MellowCAD, das nur aus Volumenkörpern besteht und noch unvollständig ist; <Command id="EXPLODE" /> macht daraus eine Region je Fläche.

## Options

### Center

Bei der ersten Eingabeaufforderung: fragt nach dem Mittelpunkt, dann nach einer Ecke, <Keyword id="Cube" /> oder <Keyword id="Length" />. Der Keil ist auf den Punkt zentriert, auch in der Höhe, sein hohes Ende liegt der angegebenen Ecke gegenüber.

### Cube

Bei der anderen Ecke: fragt nach einer Länge und erzeugt einen Keil, dessen Seiten alle so lang sind. Anders als bei <Command id="BOX" /> verläuft er entlang der X-Achse des BKS, bei negativem Wert rückwärts.

### Length

Bei der anderen Ecke: fragt nach der Länge entlang der X-Achse des BKS, dann nach der Breite entlang seiner Y-Achse; eine negative verläuft rückwärts. Ein Punkt liefert nur seinen Abstand, nie seine Richtung.

### 2Point

Bei der Höhe: fragt nach zwei Punkten, und die Höhe ist der Abstand zwischen ihnen.

## Missing

Die von <Command id="BOX" />: Verschieben, Drehen, Skalieren und Spiegeln über einen heißen Griff, die eigenen 3D-Befehle, die gepunkteten Bemaßungen, während Sie die Ecke angeben, und die visuellen Stile, die <Command id="VSCURRENT" /> fehlen. In der Draufsicht findet der Objektfang Endpunkt unter dem hohen Ende die Ecke der Oberseite, wo AutoCAD die der Grundfläche findet.

## Questions

### Wie lautet das Kürzel für KEIL (WEDGE) in AutoCAD?

`KE`. Geben Sie es ein und drücken Sie die Eingabetaste oder die Leertaste, geben Sie dann die erste Ecke, die andere Ecke und die Höhe an: `0,0`, `60,40` und `25` zeichnen den Keil der Sitzung.

### In welche Richtung fällt der Keil ab?

Vom Ende der ersten Ecke nach unten, entlang der X-Achse des BKS. Um ihn zu drehen, geben Sie die andere Ecke bei kleinerem X an, was ihn um 180° dreht, oder drehen Sie ihn danach mit <Command id="ROTATE" />.

### Wie zeichne ich ein dreieckiges Prisma?

Ein Keil ist eines: ein rechtwinkliges Dreieck an jedem Ende, entlang der Breite gezogen. Für jedes andere Dreieck zeichnen Sie es geschlossen mit <Command id="PLINE" /> und wenden <Command id="EXTRUDE" /> darauf an.

### Wie zeichne ich einen Keil von seinem Mittelpunkt aus?

Wählen Sie <Keyword id="Center" /> und geben Sie den Mittelpunkt an, dann eine Ecke, <Keyword id="Cube" /> oder <Keyword id="Length" />: Der Keil ist auf den Punkt zentriert, auch in der Höhe.
