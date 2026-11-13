---
title: "AutoCAD-Übung: eine Lasche mit Tangenten"
metaTitle: "AutoCAD-Übung Fortgeschrittene: Lasche"
description: "Eine Lasche in AutoCAD zeichnen: zwei Augen, mit dem Objektfang Tangente durch Tangenten verbunden, die Bögen dazwischen gestutzt, und ihre Bemaßung."
figure: "Eine Lasche aus zwei Augen im Abstand von 90, durch Tangenten verbunden, bemaßt."
sourceHash: "383984af61b7"
---

Zeichnen Sie diese Lasche, in Millimetern: zwei Augen im Abstand von 90, mit Radius 20 und 12, gebohrt auf Radius 10 und 6, verbunden durch Linien, die beide tangieren, die dazwischenliegenden Bögen weggestutzt. Die Tangenten verwenden an beiden Enden den Objektfang Tangente; <Command id="TRIM" /> macht dann aus dem Kreis jedes Auges einen Bogen.

## Steps

### Die Augen zeichnen [#bosses]

Auf dem Layer Kontur vier Kreise mit <Command id="CIRCLE" />, jeder mit seinem Radius: `20` und `10` in `0,0`, `12` und `6` in `90,0`.

### Die Tangenten zeichnen [#tangents]

<Command id="LINE" />, dann geben Sie `_TAN` ein, den Objektfang Tangente für einen einzelnen Punkt, und wählen Sie den großen Kreis nahe an seinem oberen Punkt; wieder `_TAN` und wählen Sie den kleinen nahe an seinem oberen Punkt. Die Linie berührt beide. Dasselbe an der Unterseite.

### Die Bögen stutzen [#trim]

<Command id="TRIM" />: Wählen Sie jedes Auge zwischen den beiden Linien, auf der Seite, die dem anderen zugewandt ist. Die inneren Bögen sind weg, und jeder Kreis ist ein Bogen.

### Die Mittellinien zeichnen [#centreLines]

Auf Mittellinien die Achse durch beide Mittelpunkte und eine Linie quer durch jedes Auge.

### Bemaßen [#dimensions]

Auf dem Layer Bemaßung der Abstand zwischen den Mittelpunkten mit <Command id="DIMLINEAR" />, die Radien der Augen mit <Command id="DIMRADIUS" /> und ihre Bohrungen mit <Command id="DIMDIAMETER" />.
