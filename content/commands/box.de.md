---
title: "Befehl QUADER (BOX) in AutoCAD"
description: "Wie QUADER (BOX) in AutoCAD einen 3D-Quader zeichnet, Schritt für Schritt: zwei Ecken und eine Höhe, Mitte, Würfel und Länge. Zum Testen im Browser."
figure: "Ein Quader 60 mal 40 mal 25, aus zwei Ecken und einer Höhe, von Südosten gesehen im Visuellen Stil Verdeckt."
sourceHash: "46936b3da48e"
---

QUADER (BOX) zeichnet einen 3D-Volumenkörper-Quader mit seinen Seiten entlang der Achsen des BKS: Geben Sie die erste Ecke an, die andere Ecke, dann die Höhe. Die Höhe steigt entlang der Z-Achse des BKS, eine negative geht nach unten, und ein angegebener Punkt legt sie durch seinen Abstand von der Ecke fest; eine Ecke mit einem anderen Z als die erste legt die Höhe fest, ohne zu fragen. Die letzte Höhe sowie die letzte Länge und Breite eines Würfels oder von Length werden als Vorgaben angeboten, die die Eingabetaste übernimmt und die sich die anderen Grundkörper und <Command id="EXTRUDE" /> teilen. Der Quader liegt auf dem aktuellen Layer, und <Command id="U" /> nimmt ihn in einem Schritt zurück.

Der Quader behält seine Maße: <Command id="LIST" /> zeigt seine Position, Länge, Breite, Höhe und Drehung, und die Eigenschaftenpalette lässt Sie die ersten vier eingeben. Seine Griffe verschieben und strecken ihn und stellen, außerhalb der Draufsicht, seine Höhe ein. Er ist ein 3D-Volumenkörper für <Command id="UNION" />, <Command id="SUBTRACT" /> und das übrige 3D von MellowCAD, das nur aus Volumenkörpern besteht und noch unvollständig ist.

## Options

### Center

Bei der ersten Eingabeaufforderung: fragt nach dem Mittelpunkt, dann nach einer Ecke, <Keyword id="Cube" /> oder <Keyword id="Length" />. Der Quader ist auf dem Punkt zentriert, auch in der Höhe.

### Cube

Bei der anderen Ecke: fragt nach einer Länge, eingegeben oder gezeigt, und macht einen Würfel, dessen Seiten alle so lang sind. Eine eingegebene Länge verläuft zum Fadenkreuz hin, eine negative von ihm weg.

### Length

Bei der anderen Ecke: fragt nach der Länge, dann nach der Breite. Die Länge verläuft zum Fadenkreuz hin, sodass der Quader schräg liegen kann; die Breite geht zu der Seite, auf der das Fadenkreuz steht.

### 2Point

Bei der Höhe: fragt nach zwei Punkten, und die Höhe ist der Abstand zwischen ihnen.

## Missing

Verschieben, Drehen, Skalieren und Spiegeln von einem heißen Griff aus, die AutoCAD mit der Eingabetaste durchschaltet. Die eigenen 3D-Befehle, 3DMOVE, 3DROTATE, 3DSCALE, MIRROR3D, ROTATE3D, ALIGN, 3DALIGN, mit ihren Gizmos, und das Verschieben seiner Flächen, Kanten und Scheitelpunkte einzeln. Das dynamische BKS. Die gepunkteten Bemaßungen, die AutoCAD zeichnet, während Sie die Ecke, die Länge und die Breite angeben. <Command id="FILLET" /> und <Command id="CHAMFER" /> an seinen Kanten; das übernehmen hier <Command id="FILLETEDGE" /> und <Command id="CHAMFEREDGE" />. Aufzeichnen und Anzeigen des Verlaufs von Volumenkörpern und die Zeile Material. Die Visuellen Stile, die <Command id="VSCURRENT" /> über 2D-Drahtkörper, Verdeckt und Konzeptuell hinaus nicht hat.

## Questions

### Wie zeichnet man in AutoCAD einen 3D-Quader?

Starten Sie QUADER, geben Sie eine Ecke an, dann die gegenüberliegende Ecke, dann die Höhe: `0,0`, `60,40` und `25` zeichnen den Quader der Sitzung. <Keyword id="Length" /> und eine Breite statt der gegenüberliegenden Ecke drehen den Quader in einen beliebigen Winkel.

### Warum sieht mein Quader wie ein Rechteck aus?

Sie sehen ihn von oben, in der Draufsicht. Drehen Sie die Ansicht: eine Ecke des ViewCube, <Command id="-VIEW" /> und <Keyword command="VIEW" id="SEiso" /> oder <Command id="3DORBIT" />. <Command id="VSCURRENT" /> mit <Keyword command="VSCURRENT" id="Hidden" /> verbirgt die Kanten dahinter.

### Wie zeichnet man einen Würfel?

Geben Sie die erste Ecke an, wählen Sie dann <Keyword id="Cube" /> und geben Sie die Länge einer Seite ein.

### Wie zeichnet man einen Quader von seinem Mittelpunkt aus?

Wählen Sie <Keyword id="Center" /> und geben Sie den Mittelpunkt an, dann eine Ecke, <Keyword id="Cube" /> oder <Keyword id="Length" />: Der Quader ist auf dem Punkt zentriert, auch in der Höhe.
