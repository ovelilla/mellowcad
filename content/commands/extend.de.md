---
title: "Befehl DEHNEN (EXTEND) in AutoCAD"
description: "Wie DEHNEN (EXTEND, Alias DE) in AutoCAD funktioniert: Modi Schnell und Standard, Grenzkanten, Zaun, Kreuzen, Kante und Umschalttaste zum Stutzen."
figure: "Zwei Linien, bis zur Linie auf ihrem Weg verlängert: jede einmal nahe dem wachsenden Ende gewählt, im Modus Schnell."
sourceHash: "b2c0044f8e87"
---

DEHNEN (EXTEND) verlängert ein Objekt, bis es auf ein anderes trifft: Sie wählen es nahe dem Ende, das wachsen soll, und dieses Ende läuft bis zur nächsten Kante in seinem Weg weiter. Er dehnt Linien, Bögen, elliptische Bögen, offene Polylinien (entlang ihres Endsegments, gerade oder auf seinem Bogen), 3D-Polylinien und offene Splines. Er beginnt im Modus Schnell, wie der von AutoCAD: Jedes Objekt ist eine Grenze. Halten Sie beim Wählen die Umschalttaste gedrückt, stutzt er stattdessen, wie es <Command id="TRIM" /> tut. Jede Wahl ist ein Rückgängig-Schritt; die Eingabetaste beendet den Befehl.

## Options

### Boundary

Wählt, welche Objekte begrenzen: Wählen Sie sie, oder drücken Sie die Eingabetaste, um jedes Objekt zu nehmen. Von da an begrenzen nur diese, in jedem Modus, bis der Befehl endet.

### Fence

Fragt nach den Punkten einer Linie, beliebig viele bis zur Eingabetaste: Jedes Objekt, das sie kreuzt, wird von dem Ende aus gedehnt, das näher an der Kreuzungsstelle des Zauns liegt, in einem Schritt. Der Modus Standard listet ihn auf; der Modus Schnell nimmt ihn ebenfalls an.

### Crossing

Fragt nach den beiden Ecken eines Fensters: Jedes Objekt, das sein Umriss kreuzt, wird gedehnt, in einem Schritt.

### mOde

Schaltet zwischen <Keyword id="Quick" /> und <Keyword id="Standard" /> um. Im Modus Standard fragt DEHNEN zuerst nach den Grenzkanten (die Eingabetaste nimmt alle) und listet Fence und Edge auf. Der Modus gilt für DEHNEN und STUTZEN zugleich und hält für die Sitzung.

### Edge

Nur im Modus Standard. Mit <Keyword id="Extend" /> hält ein Objekt auch dort an, wo eine Grenze läge, wenn sie weiterliefe, eine Linie in beide Richtungen, ein Bogen auf seinem Kreis, sodass eine Linie bis zu einer wachsen kann, die zu kurz vor ihrem Weg endet; <Keyword id="No extend" /> ist die Vorgabe.

### Undo

Aufgeführt, sobald die Eingabeaufforderung eine Antwort hatte, eine Wahl, einen Zaun, ein Fenster: nimmt die letzte Dehnung zurück und meldet, wenn nichts mehr zurückzunehmen ist, genau das.

## Missing

Projizieren: Die Projektionsoption von AutoCAD (Keine, BKS, Ansicht) wird nicht angeboten, und alles wird auf die XY-Ebene des BKS projiziert berechnet, was AutoCADs Vorgabe BKS ist. Ein Zaun lässt sich noch nicht mit dem Fadenkreuz ziehen, nur Punkt für Punkt wählen. Der Modus und die Wahl von Kante gelten für die Sitzung, während AutoCAD sie von einer Sitzung zur nächsten behält. Ein Objekt, das schräg zum BKS liegt, ein Spline ausgenommen, begrenzt weder, noch wird es gedehnt, und eine mit <Keyword command="PEDIT" id="Fit" /> von <Command id="PEDIT" /> geglättete Polylinie wird abgelehnt, wo AutoCAD ihren letzten Bogen wachsen lässt.

## Questions

### Wie lautet das Alias von DEHNEN in AutoCAD?

`DE`, dann die Eingabetaste oder die Leertaste. Das Alias `EX` des englischen AutoCAD gehört in der deutschen Version zu EXTRUSION. Der volle Name funktioniert ebenfalls, und `_EXTEND` in jeder Sprache von AutoCAD.

### Warum meldet DEHNEN, dass keine Kante vorhanden ist?

Weil nichts auf dem Weg liegt, dem dieses Ende folgen würde. Eine Linie meldet <Message id="noEdgeInThatDirection" />, wenn ihr anderes Ende eine Kante erreichen würde, und eine Linie oder ein Bogen sonst <Message id="pathDoesNotIntersectBoundingEdge" />; eine Polylinie oder ein Spline meldet <Message id="objectDoesNotIntersectEdge" />. Wählen Sie näher am anderen Ende, oder wählen Sie im Modus Standard <Keyword id="Edge" /> und <Keyword id="Extend" />, damit eine zu kurze Grenze zählt, als liefe sie weiter. Ein Kreis, eine geschlossene Polylinie, eine ganze Ellipse, ein Text oder eine Schraffur lässt sich gar nicht dehnen: <Message id="cannotExtendObject" />

### Wie dehnt man mehrere Linien auf einmal?

Wählen Sie an einer leeren Stelle und geben Sie einen zweiten Punkt an: Jedes Objekt, das dieser Zaun kreuzt, wächst von seinem näheren Ende aus, in einem Schritt. Oder wählen Sie <Keyword id="Crossing" /> und ziehen Sie ein Fenster über die zu dehnenden Enden.

### Wie stutzt man mit DEHNEN?

Halten Sie beim Wählen die Umschalttaste gedrückt: Das Stück wird bis zu den nächsten Schnittpunkten zurückgestutzt, wie es <Command id="TRIM" /> täte, und ein Objekt, das nichts kreuzt, wird gelöscht. Die nächste Wahl ohne Umschalttaste dehnt wieder.
