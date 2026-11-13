---
title: "AutoCAD-Übung: ein runder Tisch mit Stühlen"
metaTitle: "AutoCAD-Übung: runder Tisch mit sechs Stühlen"
description: "Einen runden Tisch mit sechs Stühlen in AutoCAD zeichnen: ein Stuhl, dann ein polares Muster um den Mittelpunkt des Tisches, und die Bemaßung. Kostenlos online."
figure: "Ein runder Tisch von 120 mit sechs Stühlen, in der Draufsicht, in Zentimetern bemaßt."
sourceHash: "1e307bf5e17a"
---

Zeichnen Sie einen runden Tisch von 120 mit sechs Stühlen, in Zentimetern: jeder Stuhl eine Sitzfläche 44 mal 40 mit auf 4 gerundeten Ecken und eine 8 tiefe Lehne, seine Vorderkante 8 vom Rand des Tisches entfernt. Zeichnen Sie einen Stuhl über dem Tisch und lassen Sie eine polare Reihe alle sechs anordnen. Der Bemaßungsmaßstab der Zeichnung ist für Zentimeter eingestellt.

## Steps

### Den Tisch zeichnen [#table]

Auf dem Layer Kontur: <Command id="CIRCLE" /> in `0,0`, <Keyword command="CIRCLE" id="Diameter" /> `120`.

### Einen Stuhl zeichnen [#chair]

Die Sitzfläche, über dem Tisch: <Command id="RECTANG" /> mit der Option <Keyword command="RECTANG" id="Fillet" /> `4`, von `-22,68`, die andere Ecke `44,40` vom ersten Punkt aus. Dann die Lehne, mit der auf `0` zurückgesetzten Verrundung, von `-22,108`, die andere Ecke `44,8` vom ersten Punkt aus. <Command id="RECTANG" /> behält seinen Verrundungsradius, bis Sie ihn ändern.

### Die Stühle anordnen [#array]

<Command id="ARRAYPOLAR" />: Wählen Sie die Sitzfläche und die Lehne, drücken Sie die Eingabetaste, geben Sie den Mittelpunkt des Tisches an, `0,0`, dann <Keyword command="ARRAYPOLAR" id="Items" />, `6`. Jeder Stuhl dreht sich beim Platzieren, sodass alle sechs zum Tisch zeigen.

### Bemaßen [#dimensions]

Auf dem Layer Bemaßung: <Command id="DIMDIAMETER" /> auf den Tisch, innen platziert, und <Command id="DIMLINEAR" /> für die Breite des oberen Stuhls, 44, und seine Tiefe mit der Lehne, 48.
