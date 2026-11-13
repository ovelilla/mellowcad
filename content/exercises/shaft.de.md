---
title: "AutoCAD-Übung: eine Stufenwelle"
metaTitle: "AutoCAD-Übung Maschinenbau: eine Stufenwelle"
description: "Eine Stufenwelle in AutoCAD zeichnen: halbe Kontur als Polylinie, mit Fasen, an der Achse gespiegelt, und ihre Längen als Kettenbemaßung. Schritt für Schritt."
figure: "Eine Stufenwelle in der Seitenansicht, 150 lang, mit ihren Längen als Kettenbemaßung."
sourceHash: "8c649e73bc55"
---

Zeichnen Sie diese Stufenwelle in der Seitenansicht, in Millimetern: 150 lang, mit Durchmessern von 30, 40 und 30 über Längen von 40, 60 und 50 und beiden Enden mit 2 mal 2 angefast. Zeichnen Sie die Hälfte über der Achse als eine Polylinie, fasen Sie sie an und spiegeln Sie sie; dann die quer über die Welle gesehenen Kanten, die Achse und die Längen. Maßgebend sind die hier genannten Durchmesser.

## Steps

### Die obere Hälfte zeichnen [#half]

Auf dem Layer Kontur eine <Command id="PLINE" /> von `0,0`: hoch `0,15`, weiter `40,0`, hoch `0,5`, weiter `60,0`, runter `0,-5`, weiter `50,0` und runter `0,-15`, zurück zur Achse. Die Eingabetaste beendet sie.

### Die Enden anfasen [#chamfers]

<Command id="CHAMFER" />, dann <Keyword command="CHAMFER" id="Distance" />: `2`, und die Eingabetaste nimmt `2` auch für den zweiten Abstand. <Keyword command="CHAMFER" id="Multiple" /> fast eine Ecke nach der anderen an, ohne neu zu beginnen: Wählen Sie die beiden Segmente an der Ecke jedes Endes.

### Spiegeln [#mirror]

<Command id="MIRROR" />: Wählen Sie die Polylinie, drücken Sie die Eingabetaste, dann die Spiegelachse von `0,0` bis `150,0`, die Achse, und die Eingabetaste, um das Original zu behalten.

### Die Kanten zeichnen [#edges]

Mit <Command id="LINE" /> die quer über die Welle gesehenen Kanten, jede `0,30` hoch von unten: von `2,-15` und `148,-15` an den Fasen und von `40,-15` und `100,-15` an den Absätzen.

### Die Achse zeichnen [#axis]

Auf Mittellinien die Achse: eine Linie von `-8,0` um `166,0`.

### Bemaßen [#dimensions]

Auf dem Layer Bemaßung: <Command id="DIMLINEAR" /> für die erste Länge, 40, unten platziert. <Command id="DIMCONTINUE" /> setzt von ihrer zweiten Maßhilfslinie aus fort: `#100,-20`, dann `#150,-15`, mit # vom Ursprung aus eingegeben, und zweimal die Eingabetaste, um zu beenden. Eine letzte <Command id="DIMLINEAR" /> liefert die Gesamtlänge, 150, weiter unten.
