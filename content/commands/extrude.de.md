---
title: "Befehl EXTRUSION (EXTRUDE) in AutoCAD"
description: "Wie EXTRUSION (EXTRUDE, Alias EX) in AutoCAD ein geschlossenes 2D-Profil in einen 3D-Volumenkörper verwandelt: Höhe, Richtung, Verjüngungswinkel."
figure: "Eine geschlossene L-förmige Polylinie, um 20 zu einem Volumenkörper extrudiert, dann von Südosten im visuellen Stil Verdeckt gesehen."
sourceHash: "53bfe3dd1e9c"
---

EXTRUSION (EXTRUDE) verwandelt geschlossene 2D-Profile in 3D-Volumenkörper, jedes um die angegebene Höhe gerade aus seiner Ebene gezogen. Wählen Sie die Profile — Kreise, Ellipsen, geschlossene Polylinien oder Splines, Regionen — und drücken Sie die Eingabetaste, geben Sie dann die Höhe ein oder zeigen Sie sie mit einem Punkt; die letzte Höhe ist die Vorgabe des nächsten Aufrufs. Jedes Profil wird ein eigener Volumenkörper auf dem aktuellen Layer und wird gelöscht, wie DELOBJ es standardmäßig vorgibt. Der ganze Befehl ist ein Schritt, den Rückgängig zurücknimmt.

Das 3D von MellowCAD besteht nur aus Volumenkörpern und ist noch unvollständig: Ein offenes Profil, aus dem AutoCAD eine Fläche macht, ergibt <Message id="sweepRefusedType" /> und wird aus der Auswahl entfernt.

## Options

### MOde

Fragt nach <Keyword id="SOlid" /> oder <Keyword id="SUrface" />. <Keyword id="SOlid" /> ist die Vorgabe und der einzige, den es gibt: Da es noch keine Flächenobjekte gibt, wird <Keyword id="SUrface" /> abgelehnt.

### Direction

Anstelle einer Höhe geben zwei Punkte die Richtung und die Länge an: Die Profile werden entlang dieser Linie extrudiert, schräg, wenn sie schräg ist. Eine Richtung in der Ebene des Profils ergibt <Message id="directionParallel" />, und der Befehl endet.

### Path

Wie in AutoCAD aufgeführt, aber nicht gebaut: Die Wahl wird abgelehnt, und die Höhe wird erneut abgefragt.

### Taper

Fragt nach einem Winkel zwischen −90 und 90 Grad, dann erneut nach der Höhe: Ein positiver Winkel verjüngt den Volumenkörper nach oben, ein negativer weitet ihn. Ein Kreis, der sich vor der Höhe schließt, endet in einer Spitze, einem Kegel; ein Profil, das die Verjüngung nicht verträgt, erzeugt nichts.

### Expression

Die Höhe als Ausdruck: `2*3` ist 6. Bisher nur Arithmetik.

## Missing

Path, das Sweepen entlang eines Pfads. Der Modus SUrface und offene Profile, aus denen AutoCAD Flächen macht: Es gibt noch keine Flächenobjekte. Die Flächen von Volumenkörpern und die Bereiche, die ein Klick innerhalb von Objekten findet, die <Command id="PRESSPULL" /> nimmt. Eine Verjüngung an einer Ellipse, einem Spline oder einem Bogen, der an einer Ecke auf das nächste Segment trifft. Parameter und Funktionen von Expression. <Command id="EXPLODE" /> eines extrudierten Volumenkörpers mit gekrümmten Seiten, den AutoCAD in Flächen und Regionen umwandelt. Seine Griffe sowie seine Höhe und sein Verjüngungswinkel, bearbeitet in der Palette Eigenschaften.

## Questions

### Wie lautet das Kürzel für EXTRUSION (EXTRUDE) in AutoCAD?

`EX`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_EXTRUDE` in jeder Sprache von AutoCAD.

### Wie extrudiere ich eine 2D-Zeichnung in 3D?

Zeichnen Sie den Umriss als ein geschlossenes Objekt — eine geschlossene Polylinie, einen Kreis oder eine Region —, starten Sie EXTRUSION, wählen Sie es, drücken Sie die Eingabetaste und geben Sie die Höhe ein. Von oben sieht ein Volumenkörper aus wie sein Umriss: Drehen Sie die Ansicht mit dem ViewCube, oder mit <Command id="-VIEW" /> und <Keyword command="VIEW" id="SEiso" />, um ihn in 3D zu sehen.

### Warum erzeugt EXTRUSION keinen Volumenkörper?

Das Profil ist offen oder überschneidet sich selbst. Eine Linie, ein Bogen oder eine offene Polylinie ergibt in AutoCAD eine Fläche, und MellowCAD hat noch keine: EXTRUSION meldet <Message id="sweepRefusedType" /> und entfernt sie aus der Auswahl; ein Profil, das sich selbst überschneidet, ergibt <Message id="sweepSelfIntersecting" /> und wird ebenfalls entfernt. Verbinden Sie die Teile mit <Command id="JOIN" />, machen Sie mit <Command id="REGION" /> eine Region daraus oder klicken Sie mit <Command id="PRESSPULL" /> hinein.

### Wie extrudiere ich eine Form mit Loch?

Machen Sie eine Region daraus: <Command id="REGION" /> auf dem Umriss und dem Loch, dann <Command id="SUBTRACT" /> der Region des Lochs von der des Umrisses. Extrudieren Sie diese Region, und das Loch verläuft durch den Volumenkörper. Oder starten Sie <Command id="PRESSPULL" /> und klicken Sie zwischen den Umriss und das Loch.

### Wie extrudiere ich entlang eines Pfads?

Noch nicht: <Keyword id="Path" /> wird aufgeführt, aber abgelehnt, und SWEEP ist nicht gebaut. <Keyword id="Direction" /> extrudiert entlang der geraden Linie zwischen zwei Punkten.
