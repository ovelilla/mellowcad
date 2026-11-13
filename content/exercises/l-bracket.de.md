---
title: "AutoCAD-Übung: ein L-Winkel"
metaTitle: "AutoCAD-Übung für Anfänger: ein L-Winkel"
description: "Einen L-Winkel in AutoCAD mit relativen Koordinaten zeichnen: Kontur, Verrundung, zwei Löcher und Basislinienbemaßung, Schritt für Schritt."
figure: "Der L-Winkel, 100 mal 80, von seiner unteren linken Ecke aus bemaßt."
sourceHash: "5c7cd5d57c92"
---

Zeichnen Sie diesen Winkel, in Millimetern: 100 lang, mit einem 20 hohen Fuß und einem 30 breiten und 80 hohen Schenkel, die Innenecke auf den Radius 10 gerundet, ein Loch von 8 im Fuß und eines von 10 im Schenkel, jedes in seinem Arm zentriert. Die Kontur ist ein Zug mit <Command id="LINE" />, jeder Punkt eingegeben als der Weg vom letzten, und ihre Bemaßungen beginnen alle an der unteren linken Ecke.

## Steps

### Die Kontur zeichnen [#outline]

Auf dem Layer Kontur: <Command id="LINE" /> von `0,0`, dann jeder Punkt als Schritt vom letzten: `100,0`, `0,20`, `-70,0`, `0,60` und `-30,0`. <Keyword command="LINE" id="Close" /> zeichnet die letzte Seite zurück zum Anfang und beendet den Befehl.

### Die Innenecke runden [#fillet]

<Command id="FILLET" />: Wählen Sie <Keyword command="FILLET" id="Radius" />, geben Sie `10` ein und wählen Sie dann die beiden Linien, die sich in der Innenecke treffen, die Oberkante des Fußes und die Seite des Schenkels.

### Die Löcher zeichnen [#holes]

Zwei Kreise mit <Command id="CIRCLE" />, jeder mit seinem <Keyword command="CIRCLE" id="Diameter" />: `8` in `80,10`, im Fuß, und `10` in `15,65`, im Schenkel.

### Bemaßen [#dimensions]

Auf dem Layer Bemaßung: <Command id="DIMLINEAR" /> von `0,0` zum Loch des Fußes, `80,10`, unten platziert: 80. <Command id="DIMBASELINE" /> macht von derselben ersten Maßhilfslinie aus weiter: Geben Sie das rechte Ende ein, `#100,0`, wobei # vom Ursprung aus misst, dann zweimal die Eingabetaste, um zu beenden. Dasselbe an der linken Seite, zum oberen Loch und dann zur Oberkante, `#0,80`. <Command id="DIMRADIUS" /> auf die Verrundung und <Command id="DIMDIAMETER" /> auf jedes Loch vervollständigen sie.
