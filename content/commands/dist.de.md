---
title: "Befehl ABSTAND (DIST) in AutoCAD"
description: "Wie ABSTAND (DIST, Alias AB) in AutoCAD funktioniert: der Abstand zwischen zwei Punkten mit Winkeln und Deltas in X, Y und Z, oder die Länge eines Punktzugs."
figure: "ABSTAND entlang der Diagonale einer Platte von 100 mal 60: der Abstand, der Winkel in der XY-Ebene und die Deltas."
sourceHash: "31fbe420bc43"
---

ABSTAND (DIST) misst den Abstand zwischen zwei Punkten. Klicken, fangen oder geben Sie den ersten und den zweiten Punkt ein, und der Befehl schreibt in die Befehlszeile den Abstand, den Winkel in der XY-Ebene und den Winkel zu ihr sowie die Deltas in X, Y und Z, und endet. Jeder Punkt wird dort gemessen, wo er liegt, sein Z-Wert eingeschlossen, der Abstand ist also der wahre im Raum. Die Eingabetaste beim ersten Punkt beginnt beim zuletzt angegebenen Punkt, und beim zweiten misst sie zurück zum ersten. Die Zahlen folgen der Genauigkeit der Zeichnung, die Winkel AUPREC.

## Options

### Multiple

<Keyword id="Multiple" /> Punkte, bei der zweiten Eingabeaufforderung: ein Punktzug statt einer Strecke, der bisherige Abstand wird vor jedem nächsten Punkt geschrieben und über dem Cursor angezeigt, bis zur Eingabetaste oder <Keyword id="Total" />.

### Arc

Misst stattdessen entlang von Bögen, mit den Bogenoptionen von PLINIE: <Keyword id="Angle" />, <Keyword id="Center" />, <Keyword id="Close" />, <Keyword id="Direction" />, <Keyword id="Line" />, <Keyword id="Radius" />, <Keyword id="Second pt" />, <Keyword id="Undo" />. Die Länge jedes Bogens wird dem Punktzug hinzugefügt.

### Close

Geht zurück zum ersten Punkt, fügt diese letzte Strecke hinzu, schreibt die Summe und endet.

### Length

Fügt eine Strecke der eingegebenen Länge entlang der letzten hinzu.

### Undo

Nimmt den letzten Punkt des Punktzugs zurück.

### Total

Schreibt die Summe des Punktzugs und endet; die Eingabetaste tut dasselbe.

## Missing

MEASUREGEOM, die Werkzeuge Messen des Menübands, die die Eingabeaufforderungen von ABSTAND in einer Schleife mit Radius, Winkel, Fläche, Volumen und Schnell stellen: Hier startet die Schaltfläche Abstand des Menübands ABSTAND. Bei <Keyword id="Center" /> der Option Arc wird der eingeschlossene Winkel in Grad gelesen, wo AutoCAD 2027 dort eine Zahl als Abstand entlang des Cursors liest.

## Questions

### Wie lautet das Kürzel für ABSTAND (DIST) in AutoCAD?

`AB`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_DIST` in jeder Sprache von AutoCAD.

### Wie messe ich einen Abstand in AutoCAD?

Geben Sie `AB` ein und geben Sie dann die zwei Punkte an, mit Objektfang, um auf den Endpunkten oder Mittelpunkten der Objekte zu landen. Der Abstand wird in die Befehlszeile geschrieben, mit dem Winkel und den Deltas.

### Wie messe ich die Gesamtlänge mehrerer Segmente?

Wählen Sie beim zweiten Punkt <Keyword id="Multiple" /> Punkte und geben Sie weiter Punkte an: Der bisherige Abstand wird an jedem Punkt angezeigt, und die Eingabetaste schreibt die Summe.

### Wie messe ich einen Abstand in 3D?

Geben Sie die Punkte mit ihrem Z-Wert an oder fangen Sie Objekte in ihrer Höhe: ABSTAND misst den wahren Abstand im Raum und schreibt den Winkel zur XY-Ebene und das Delta in Z.

### Warum zeigt ABSTAND weniger Dezimalstellen, als ich brauche?

Er schreibt Längen mit der Genauigkeit der Zeichnung, in einer neuen Zeichnung hier zwei Stellen. Stellen Sie in <Command id="UNITS" /> mehr ein, bis zu acht.
